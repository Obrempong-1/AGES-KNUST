
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
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload"; // Import the new hook

interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  published: boolean;
}

const galleryCollectionRef = collection(db, "gallery");

const GalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    published: true,
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{ url: string; type: string }[]>([]);

  const { uploading, uploadFile, deleteFile } = useImageUpload({ path: 'gallery' }); // Use the hook

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(galleryCollectionRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as GalleryItem[];
      setItems(itemsData);
    } catch (error: any) {
      console.error("Failed to load gallery:", error);
      toast.error("Failed to load gallery. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    const urls = acceptedFiles.map((file) => ({ url: URL.createObjectURL(file), type: file.type }));
    setPreviewUrls((prev) => [...prev, ...urls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "video/*": [] },
    multiple: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    try {
      for (const file of uploadedFiles) {
        const mediaUrl = await uploadFile(file);
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        if (mediaUrl) {
          await addDoc(galleryCollectionRef, {
            title: formData.title || file.name,
            caption: formData.caption || null,
            media_url: mediaUrl,
            media_type: mediaType,
            published: formData.published,
            created_at: new Date().toISOString(),
          });
        }
      }

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error("Error during submission process:", error);
    } 
  };
  
  const handleDelete = async (id: string, mediaUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      await deleteFile(mediaUrl);
      setItems(items.filter(item => item.id !== id));
    } catch (error: any) {
        toast.error(error.message || 'An error occurred during deletion.');
        console.error("Deletion Error:", error);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const itemDoc = doc(db, "gallery", id);
      await updateDoc(itemDoc, { published: !currentStatus });
      setItems(items.map(item => item.id === id ? { ...item, published: !currentStatus } : item));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", caption: "", published: true });
    setUploadedFiles([]);
    previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviewUrls([]);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Gallery</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Upload New Files</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            <input {...getInputProps()} />
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {previewUrls.map((preview, idx) => (
                  preview.type.startsWith('image/') ? (
                    <img
                      key={idx}
                      src={preview.url}
                      alt={`Preview ${idx}`}
                      className="h-24 w-full object-cover rounded"
                    />
                  ) : (
                    <video
                      key={idx}
                      src={preview.url}
                      className="h-24 w-full object-cover rounded"
                      autoPlay
                      muted
                      loop
                    />
                  )
                ))}
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p>Drag & drop files, or click to select</p>
              </div>
            )}
          </div>

          <Input
            placeholder="Title (optional, defaults to filename)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <Textarea
            placeholder="Caption (optional)"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          />

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked })
              }
            />
            <label>Published</label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading || uploadedFiles.length === 0}>
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
            {uploadedFiles.length > 0 && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.media_type === 'image' ? (
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
            ) : (
                <video
                    src={item.media_url}
                    className="w-full h-48 object-cover"
                    controls
                />
            )}
            <div className="p-4">
              <h3 className="font-bold text-sm mb-2">{item.title}</h3>
              <div className="flex items-center justify-between">
                <Switch
                  checked={item.published}
                  onCheckedChange={() => togglePublished(item.id, item.published)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id, item.media_url)}
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

export default GalleryManager;
