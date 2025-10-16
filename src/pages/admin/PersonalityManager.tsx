
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
  media_url: string;
  media_type: 'image' | 'video';
  week_start: string;
  week_end: string;
  is_active: boolean;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { uploading, uploadFile, deleteFile } = useImageUpload({ path: 'personalities' });

  const fetchPersonalities = useCallback(async () => {
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
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile && !editingPersonality) {
      toast.error("Please upload a file");
      return;
    }

    setLoading(true);

    try {
      let media_url = editingPersonality?.media_url || "";
      let media_type = editingPersonality?.media_type || (uploadedFile?.type.startsWith('image/') ? 'image' : 'video');

      if (uploadedFile) {
        if (editingPersonality?.media_url) {
          await deleteFile(editingPersonality.media_url);
        }
        const new_media_url = await uploadFile(uploadedFile);
        if(new_media_url) media_url = new_media_url;
        media_type = uploadedFile.type.startsWith('image/') ? 'image' : 'video';
      }

      if (formData.is_active) {
        const batch = writeBatch(db);
        const q = query(personalitiesCollectionRef, where("is_active", "==", true));
        const currentlyActive = await getDocs(q);
        currentlyActive.forEach(doc => {
          if (doc.id !== editingPersonality?.id) {
            batch.update(doc.ref, { is_active: false });
          }
        });
        await batch.commit();
      }

      if (editingPersonality) {
        const personalityDoc = doc(db, "personality_of_week", editingPersonality.id);
        await updateDoc(personalityDoc, { ...formData, media_url, media_type });
        toast.success("Personality updated successfully");
      } else {
        await addDoc(personalitiesCollectionRef, {
          ...formData,
          media_url,
          media_type,
          created_at: new Date().toISOString(),
        });
        toast.success("Personality added successfully");
      }

      resetForm();
      fetchPersonalities();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (personality: Personality) => {
    if (!confirm("Are you sure you want to delete this personality?")) return;

    setLoading(true);
    try {
      if (personality.media_url) {
        await deleteFile(personality.media_url);
      }
      await deleteDoc(doc(db, "personality_of_week", personality.id));
      toast.success("Personality deleted");
      fetchPersonalities();
    } catch (error: any) {
      toast.error(error.message);
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
    setPreviewUrl(personality.media_url);
    setUploadedFile(null);
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
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl("");
  };

  const toggleActive = async (personality: Personality) => {
    try {
      const batch = writeBatch(db);
      const personalityDoc = doc(db, "personality_of_week", personality.id);

      if (!personality.is_active) {
        const q = query(personalitiesCollectionRef, where("is_active", "==", true));
        const currentlyActive = await getDocs(q);
        currentlyActive.forEach(doc => {
          batch.update(doc.ref, { is_active: false });
        });
      }
      
      batch.update(personalityDoc, { is_active: !personality.is_active });
      await batch.commit();

      fetchPersonalities();
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Personality of the Week</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingPersonality ? "Edit Personality" : "Add New Personality"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              uploadedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded"
                />
              ) : (
                <video
                  src={previewUrl}
                  className="max-h-48 mx-auto rounded"
                  autoPlay
                  muted
                  loop
                />
              )
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p>Drag & drop a file, or click to select</p>
              </div>
            )}
          </div>

          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            placeholder="Level/Year (e.g., Level 300)"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            required
          />

          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Week Start</label>
              <Input
                type="date"
                value={formData.week_start}
                onChange={(e) =>
                  setFormData({ ...formData, week_start: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Week End</label>
              <Input
                type="date"
                value={formData.week_end}
                onChange={(e) =>
                  setFormData({ ...formData, week_end: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
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
        {personalities.map((person) => (
          <Card key={person.id} className="p-4">
            <div className="flex items-center gap-4">
              {person.media_type === 'image' ? (
                <img
                  src={person.media_url}
                  alt={person.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <video
                  src={person.media_url}
                  className="w-20 h-20 rounded-full object-cover"
                  autoPlay
                  muted
                  loop
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold">{person.name}</h3>
                <p className="text-sm text-muted-foreground">{person.level}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(person.week_start).toLocaleDateString()} -{" "}
                  {new Date(person.week_end).toLocaleDateString()}
                </p>
                {person.is_active && (
                  <span className="inline-block px-2 py-1 bg-primary text-primary-foreground text-xs rounded mt-1">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={person.is_active}
                  onCheckedChange={() => toggleActive(person)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(person)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(person)}
                  disabled={loading}
                >
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
