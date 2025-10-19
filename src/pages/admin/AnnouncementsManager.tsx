
import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Announcement {
  id: string;
  title: string;
  body: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  published: boolean;
  createdAt: any;
}

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'createdAt'>>({
    title: "",
    body: "",
    published: true,
    mediaUrl: "",
    mediaType: 'image',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploading, uploadImage: uploadFile, deleteImage: deleteFile } = useImageUpload({ path: 'announcements' });

  const announcementsCollectionRef = useMemo(() => collection(db, "announcements"), []);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(announcementsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Announcement[];
      setAnnouncements(data);
    } catch (error) {
      toast.error("Failed to load announcements.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [announcementsCollectionRef]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      setFormData(prev => ({ 
        ...prev, 
        mediaType: file.type.startsWith('video/') ? 'video' : 'image' 
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: false,
  });

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormData({ title: "", body: "", published: true, mediaUrl: "", mediaType: 'image' });
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
        toast.error("Title and Body are required.");
        return;
    }
    if (!editingId && !uploadedFile) {
      toast.error("Please upload a file for the new announcement.");
      return;
    }

    try {
      let finalMediaUrl = formData.mediaUrl || "";
      let finalMediaType = formData.mediaType;

      if (uploadedFile) {
        if (editingId && formData.mediaUrl) {
          await deleteFile(formData.mediaUrl);
        }
        const newUrl = await uploadFile(uploadedFile);
        if (!newUrl) return; 
        finalMediaUrl = newUrl;
        finalMediaType = uploadedFile.type.startsWith('image/') ? 'image' : 'video';
      }

      const dataToSave = { ...formData, mediaUrl: finalMediaUrl, mediaType: finalMediaType, createdAt: serverTimestamp() };

      if (editingId) {
        const docRef = doc(db, "announcements", editingId);
        await updateDoc(docRef, dataToSave);
        toast.success("Announcement updated successfully");
      } else {
        await addDoc(announcementsCollectionRef, dataToSave);
        toast.success("Announcement added successfully");
      }

      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.message || "Failed to save announcement.");
    }
  }, [formData, editingId, uploadedFile, deleteFile, uploadFile, announcementsCollectionRef, fetchAnnouncements, resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const toDelete = announcements.find(ann => ann.id === id);
      if (toDelete?.mediaUrl) {
        await deleteFile(toDelete.mediaUrl);
      }
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement deleted");
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Failed to delete.");
    }
  }, [announcements, deleteFile]);

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    const { title, body, published, mediaUrl, mediaType } = ann;
    setFormData({ title, body, published, mediaUrl, mediaType });
    setPreviewUrl(ann.mediaUrl);
    setUploadedFile(null);
    window.scrollTo(0, 0);
  };
  
  const handleContentChange = (content: string) => {
    setFormData({ ...formData, body: content });
  };

  const togglePublished = useCallback(async (id: string, status: boolean) => {
    try {
      const docRef = doc(db, "announcements", id);
      await updateDoc(docRef, { published: !status });
      setAnnouncements(anns => anns.map(a => a.id === id ? {...a, published: !status} : a));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Announcements</h2>
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">
          {editingId ? "Edit Announcement" : "Add New Announcement"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-muted/20 ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}>\
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="relative aspect-video mx-auto">
                {formData.mediaType === 'video' ? (
                  <video src={previewUrl} className="max-h-64 object-contain w-full h-full rounded" autoPlay muted loop playsInline key={previewUrl} />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-64 object-contain w-full h-full rounded" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Drag & drop file, or click to select</p>
                <p className="text-xs text-muted-foreground">Images and videos are supported</p>
              </div>
            )}
          </div>
          <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <ReactQuill 
            theme="snow" 
            value={formData.body} 
            onChange={handleContentChange}
            className="bg-card"
          />
          <div className="flex items-center gap-2 pt-8"><Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}/> <label>Published</label></div>
          <div className="flex gap-2">
            <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : (editingId ? "Update" : "Add") + ' Announcement'}
            </Button>
            {editingId && (<Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>Cancel</Button>)}
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-32 h-24 rounded-md overflow-hidden bg-muted/30 flex-shrink-0">
                {ann.mediaType === 'image' ? (
                  <img src={ann.mediaUrl} alt={ann.title} className="w-full h-full object-contain"/>
                ) : (
                  <video src={ann.mediaUrl} className="w-full h-full object-contain" muted loop playsInline />
                )}
              </div>
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-bold">{ann.title}</h3>
                <div 
                    className="text-sm text-muted-foreground line-clamp-2" 
                    dangerouslySetInnerHTML={{ __html: ann.body }} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {ann.createdAt && new Date(ann.createdAt?.toDate()).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                <Switch checked={ann.published} onCheckedChange={() => togglePublished(ann.id, ann.published)}/>
                <Button size="sm" variant="outline" onClick={() => handleEdit(ann)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(ann.id)} disabled={loading}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
