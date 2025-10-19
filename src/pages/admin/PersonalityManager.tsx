import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  writeBatch,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload, Plus, X } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Personality {
  id: string;
  name: string;
  level: string;
  description: string;
  photo_urls: string[];
  week_start: string;
  week_end: string;
  is_active: boolean;
  created_at: string;
  department?: string;
  year?: string;
  highSchool?: string;
  favoriteCourse?: string;
  achievements?: string[];
  favoriteQuote?: string;
}

interface NewImageFile {
  file: File;
  preview: string;
}

const personalitiesCollectionRef = collection(db, "personality_of_week");

const PersonalityManager = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPersonality, setEditingPersonality] = useState<Personality | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    description: "",
    week_start: "",
    week_end: "",
    is_active: false,
    department: "",
    year: "",
    highSchool: "",
    favoriteCourse: "",
    achievements: [] as string[],
    favoriteQuote: "",
  });

  const [newImageFiles, setNewImageFiles] = useState<NewImageFile[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState("");

  const { uploading, uploadImage, deleteImage } = useImageUpload({ path: 'personalities' });

  const fetchPersonalities = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(personalitiesCollectionRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const personalitiesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Personality[];
      setPersonalities(personalitiesData);
    } catch (error: any) {
      toast.error("Failed to load personalities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonalities();
  }, [fetchPersonalities]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImageFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleRemoveImage = (urlToRemove: string) => {
    if (urlToRemove.startsWith('blob:')) {
      const newFile = newImageFiles.find(f => f.preview === urlToRemove);
      if (newFile) {
        URL.revokeObjectURL(newFile.preview);
        setNewImageFiles(prev => prev.filter(f => f.preview !== urlToRemove));
      }
    } else {
      setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
    }
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setFormData(prev => ({ ...prev, achievements: [...prev.achievements, achievementInput.trim()] }));
      setAchievementInput("");
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== index) }));
  };

  const resetForm = () => {
    setEditingPersonality(null);
    setFormData({
      name: "",
      level: "",
      description: "",
      week_start: "",
      week_end: "",
      is_active: false,
      department: "",
      year: "",
      highSchool: "",
      favoriteCourse: "",
      achievements: [],
      favoriteQuote: "",
    });
    newImageFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setNewImageFiles([]);
    setExistingImageUrls([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImageUrls.length === 0 && newImageFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(f => uploadImage(f.file));
        const results = await Promise.all(uploadPromises);
        uploadedUrls = results.filter((url): url is string => url !== null);
        if (uploadedUrls.length !== newImageFiles.length) {
          throw new Error("Some images failed to upload. Please try again.");
        }
      }

      const finalImageUrls = [...existingImageUrls, ...uploadedUrls];

      if (editingPersonality) {
        const originalUrls = editingPersonality.photo_urls || [];
        const urlsToDelete = originalUrls.filter(url => !finalImageUrls.includes(url));
        if (urlsToDelete.length > 0) {
          await Promise.all(urlsToDelete.map(url => deleteImage(url)));
        }
      }

      if (formData.is_active) {
        const batch = writeBatch(db);
        const q = query(personalitiesCollectionRef, where("is_active", "==", true));
        const currentlyActive = await getDocs(q);
        currentlyActive.forEach(activeDoc => {
          if (activeDoc.id !== editingPersonality?.id) {
            batch.update(activeDoc.ref, { is_active: false });
          }
        });
        await batch.commit();
      }
      
      const dataToSave = { ...formData };
      if (!dataToSave.achievements || dataToSave.achievements.length === 0) {
        delete (dataToSave as any).achievements; 
      }

      if (editingPersonality) {
        const personalityDoc = doc(db, "personality_of_week", editingPersonality.id);
        await updateDoc(personalityDoc, { ...dataToSave, photo_urls: finalImageUrls });
        toast.success("Personality updated successfully");
      } else {
        await addDoc(personalitiesCollectionRef, {
          ...dataToSave,
          photo_urls: finalImageUrls,
          created_at: new Date().toISOString(),
        });
        toast.success("Personality added successfully");
      }

      resetForm();
      await fetchPersonalities();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (personality: Personality) => {
    if (!window.confirm("Are you sure you want to delete this personality?")) return;

    setLoading(true);
    try {
      if (personality.photo_urls && personality.photo_urls.length > 0) {
        await Promise.all(personality.photo_urls.map(url => deleteImage(url)));
      }
      await deleteDoc(doc(db, "personality_of_week", personality.id));
      toast.success("Personality deleted");
      await fetchPersonalities();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete personality.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (personality: Personality) => {
    setEditingPersonality(personality);
    setFormData({
      name: personality.name,
      level: personality.level,
      description: personality.description,
      week_start: personality.week_start,
      week_end: personality.week_end,
      is_active: personality.is_active,
      department: personality.department || "",
      year: personality.year || "",
      highSchool: personality.highSchool || "",
      favoriteCourse: personality.favoriteCourse || "",
      achievements: personality.achievements || [],
      favoriteQuote: personality.favoriteQuote || "",
    });
    setExistingImageUrls(personality.photo_urls || []);
    setNewImageFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (personality: Personality) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const personalityDoc = doc(db, "personality_of_week", personality.id);

      if (!personality.is_active) {
        const q = query(personalitiesCollectionRef, where("is_active", "==", true));
        const currentlyActive = await getDocs(q);
        currentlyActive.forEach(activeDoc => batch.update(activeDoc.ref, { is_active: false }));
      }

      batch.update(personalityDoc, { is_active: !personality.is_active });
      await batch.commit();
      await fetchPersonalities(); 
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const allPreviewUrls = [...existingImageUrls, ...newImageFiles.map(f => f.preview)];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Personality of the Week Manager</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingPersonality ? "Edit Personality" : "Add New Personality"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-semibold">Images</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mt-2 ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <span>Drag & drop images, or click to select files</span>
                </div>
            </div>
            {allPreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {allPreviewUrls.map((url) => (
                    <div key={url} className="relative group">
                    <img src={url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(url)}>
                        <X className="h-4 w-4" />
                    </Button>
                    </div>
                ))}
                </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input placeholder="Level/Position (e.g., Level 300)" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required />
            <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            <Input placeholder="Year (e.g., 2024)" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
            <Input placeholder="High School Attended" value={formData.highSchool} onChange={(e) => setFormData({ ...formData, highSchool: e.target.value })} />
            <Input placeholder="Favorite Geomatic Course" value={formData.favoriteCourse} onChange={(e) => setFormData({ ...formData, favoriteCourse: e.target.value })} />
          </div>

          <Textarea placeholder="Biography" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={6} />
          <Textarea placeholder="Favorite Quote" value={formData.favoriteQuote} onChange={(e) => setFormData({ ...formData, favoriteQuote: e.target.value })} rows={3} />
          
          <div>
             <label className="font-semibold">Achievements (Optional)</label>
             <div className="flex gap-2 mt-2">
                <Input value={achievementInput} onChange={e => setAchievementInput(e.target.value)} placeholder="Add an achievement" />
                <Button type="button" onClick={handleAddAchievement}><Plus className="h-4 w-4 mr-2"/>Add</Button>
             </div>
             <ul className="mt-4 space-y-2">
                {formData.achievements.map((ach, index) => (
                    <li key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                        <span>{ach}</span>
                        <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveAchievement(index)}><X className="h-4 w-4"/></Button>
                    </li>
                ))}
             </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Week Start</label>
              <Input type="date" value={formData.week_start} onChange={(e) => setFormData({ ...formData, week_start: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Week End</label>
              <Input type="date" value={formData.week_end} onChange={(e) => setFormData({ ...formData, week_end: e.target.value })} required />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-500/10 p-3 rounded-lg">
            <Switch id="is-active-switch" checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
            <label htmlFor="is-active-switch" className="font-semibold text-primary">Set as Active Personality</label>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button type="submit" disabled={loading || uploading} size="lg">
              {uploading ? 'Uploading Images...' : (editingPersonality ? "Update Personality" : "Add Personality")}
            </Button>
            {editingPersonality && (
              <Button type="button" variant="outline" onClick={resetForm} size="lg">
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div>
        <h3 className="text-2xl font-bold mb-4">Existing Personalities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading && personalities.length === 0) ? (
            <p>Loading personalities...</p>
          ) : personalities.map((person) => (
            <Card key={person.id} className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-48 bg-muted">
                {person.photo_urls && person.photo_urls.length > 0 ? (
                  <img src={person.photo_urls[0]} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span>No Image</span>
                  </div>
                )}
                {person.is_active && (
                  <span className="absolute top-2 right-2 inline-block px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-primary">{person.name}</h3>
                <p className="text-sm text-muted-foreground font-semibold">{person.level}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(person.week_start).toLocaleDateString()} - {new Date(person.week_end).toLocaleDateString()}
                </p>
              </div>

              <div className="p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Switch id={`active-${person.id}`} checked={person.is_active} onCheckedChange={() => toggleActive(person)} disabled={loading} />
                  <label htmlFor={`active-${person.id}`} className="text-sm font-medium">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(person)} disabled={loading}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(person)} disabled={loading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalityManager;
