import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload, Mail, Linkedin, Phone } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload"; // Import the hook

interface Executive {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  email: string | null;
  linkedin_url: string | null;
  photo_url: string;
  published: boolean;
  display_order: number;
}

export default function ExecutivesManager() {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Executive, 'id' | 'display_order' | 'photo_url'> & { photo_url?: string }>({
    name: "",
    position: "",
    phone: "",
    email: "",
    linkedin_url: "",
    published: true,
    photo_url: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploading, uploadImage, deleteImage } = useImageUpload({ path: 'executives' });
  const executivesCollectionRef = collection(db, "executives");

  const fetchExecutives = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(executivesCollectionRef, orderBy("display_order", "asc"));
      const querySnapshot = await getDocs(q);
      const executivesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Executive[];
      setExecutives(executivesData);
    } catch (error) {
      toast.error("Failed to load executives.");
      console.error("Fetch executives error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutives();
  }, [fetchExecutives]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
        toast.error("Name and Position are required.");
        return;
    }
    if (!editingId && !uploadedFile) {
      toast.error("Please upload an image for the new executive.");
      return;
    }

    try {
      let finalPhotoUrl = formData.photo_url || "";

      if (uploadedFile) {
        if (editingId && formData.photo_url) {
          await deleteImage(formData.photo_url);
        }
        const newUrl = await uploadImage(uploadedFile);
        if (!newUrl) return; // Upload failed, stop submission.
        finalPhotoUrl = newUrl;
      }

      const dataToSave = { ...formData, photo_url: finalPhotoUrl };

      if (editingId) {
        const executiveDoc = doc(db, "executives", editingId);
        await updateDoc(executiveDoc, dataToSave);
        toast.success("Executive updated successfully");
      } else {
        const highestOrder = executives.reduce((max, exec) => Math.max(exec.display_order, max), -1);
        await addDoc(executivesCollectionRef, { ...dataToSave, display_order: highestOrder + 1 });
        toast.success("Executive added successfully");
      }

      resetForm();
      fetchExecutives();
    } catch (error: any) {
      toast.error(error.message || "Failed to save executive.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this executive?")) return;

    try {
      const executiveToDelete = executives.find(exec => exec.id === id);
      if (executiveToDelete?.photo_url) {
        await deleteImage(executiveToDelete.photo_url);
      }

      await deleteDoc(doc(db, "executives", id));
      toast.success("Executive deleted");
      setExecutives(prev => prev.filter(exec => exec.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete executive.");
    }
  };

  const handleEdit = (exec: Executive) => {
    setEditingId(exec.id);
    setFormData(exec);
    setPreviewUrl(exec.photo_url);
    setUploadedFile(null);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", position: "", phone: "", email: "", linkedin_url: "", published: true, photo_url: "" });
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const executiveDoc = doc(db, "executives", id);
      await updateDoc(executiveDoc, { published: !currentStatus });
      setExecutives(execs => execs.map(e => e.id === id ? {...e, published: !currentStatus} : e));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Executives</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingId ? "Edit Executive" : "Add New Executive"}
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
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto rounded"
              />
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p>Drag & drop photo, or click to select</p>
              </div>
            )}
          </div>

          <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input placeholder="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required />
          <div className="flex items-center gap-2"><Phone className="h-5 w-5 text-muted-foreground" /><Input placeholder="Phone (Optional)" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}/></div>
          <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-muted-foreground" /><Input type="email" placeholder="Email (Optional)" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/></div>
          <div className="flex items-center gap-2"><Linkedin className="h-5 w-5 text-muted-foreground" /><Input placeholder="LinkedIn URL (Optional)" value={formData.linkedin_url || ''} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}/></div>
          <div className="flex items-center gap-2"><Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}/> <label>Published</label></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : (editingId ? "Update" : "Add") + ' Executive'}
            </Button>
            {editingId && (<Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>Cancel</Button>)}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {executives.map((exec) => (
          <Card key={exec.id} className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <img src={exec.photo_url} alt={exec.name} className="w-20 h-20 rounded-full object-cover"/>
              <div className="flex-1 min-w-[150px]">
                <h3 className="font-bold">{exec.name}</h3>
                <p className="text-sm text-muted-foreground">{exec.position}</p>
                {exec.phone && (<p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {exec.phone}</p>)}
                {exec.email && (<p className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" /> {exec.email}</p>)}
                 {exec.linkedin_url && (<a href={exec.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 text-blue-500 hover:underline"><Linkedin className="h-3 w-3" /> LinkedIn</a>)}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Switch checked={exec.published} onCheckedChange={() => togglePublished(exec.id, exec.published)}/>
                <Button size="sm" variant="outline" onClick={() => handleEdit(exec)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(exec.id)} disabled={loading}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
