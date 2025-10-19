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
import { Trash2, Upload } from "lucide-react";
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
  });

  const [newImageFiles, setNewImageFiles] = useState<NewImageFile[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

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

  const resetForm = () => {
    setEditingPersonality(null);
    setFormData({ name: "", level: "", description: "", week_start: "", week_end: "", is_active: false });
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

      if (editingPersonality) {
        const personalityDoc = doc(db, "personality_of_week", editingPersonality.id);
        await updateDoc(personalityDoc, { ...formData, photo_urls: finalImageUrls });
        toast.success("Personality updated successfully");
      } else {
        await addDoc(personalitiesCollectionRef, {
          ...formData,
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
      <h2 className="text-3xl font-bold mb-8">Personality of the Week</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingPersonality ? "Edit Personality" : "Add New Personality"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}`}>
            <input {...getInputProps()} />
            <div>
              <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p>Drag & drop images, or click to select</p>
            </div>
          </div>
          
          {allPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {allPreviewUrls.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => handleRemoveImage(url)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input placeholder="Level/Year (e.g., Level 300)" value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} required />
          <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={5} />

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

          <div className="flex items-center gap-2">
            <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
            <label>Active Personality (Only one can be active at a time)</label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? 'Uploading...' : (editingPersonality ? "Update" : "Add") + ' Personality'}
            </Button>
            {editingPersonality && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {(loading && personalities.length === 0) ? (
          <p>Loading personalities...</p>
        ) : personalities.map((person) => (
          <Card key={person.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
                {person.photo_urls && person.photo_urls.length > 0 ? (
                  <img src={person.photo_urls[0]} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.level}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(person.week_start).toLocaleDateString()} - {new Date(person.week_end).toLocaleDateString()}
                </p>
                {person.is_active && (
                  <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs rounded mt-1">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={person.is_active} onCheckedChange={() => toggleActive(person)} disabled={loading} />
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
  );
};

export default PersonalityManager;
