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

interface GalleryImage {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  published: boolean;
}

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    published: true,
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const galleryCollectionRef = collection(db, "gallery");
  const { uploading, uploadImage, deleteImage } = useImageUpload({ path: 'gallery' }); // Use the hook

  const fetchImages = async () => {
    setLoading(true);
    try {
      const q = query(galleryCollectionRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as GalleryImage[];
      setImages(imagesData);
    } catch (error: any) {
      console.error("Failed to load gallery:", error);
      toast.error("Failed to load gallery. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    const urls = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    try {
      for (const file of uploadedFiles) {
        const imageUrl = await uploadImage(file); // Use the hook's function
        if (imageUrl) {
          await addDoc(galleryCollectionRef, {
            title: formData.title || file.name,
            caption: formData.caption || null,
            image_url: imageUrl,
            published: formData.published,
            created_at: new Date().toISOString(),
          });
        }
      }

      toast.success(`${uploadedFiles.length} image(s) uploaded successfully`);
      resetForm();
      fetchImages();
    } catch (error: any) {
      // The hook will show the toast, but you might want to log here
      console.error("Error during submission process:", error);
    } 
  };
  
  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      // 1. Delete the Firestore document
      await deleteDoc(doc(db, "gallery", id));

      // 2. Delete the image from Storage via the hook
      await deleteImage(imageUrl);

      // 3. Update the UI
      setImages(images.filter(img => img.id !== id));

    } catch (error: any) {
        toast.error(error.message || 'An error occurred during deletion.');
        console.error("Deletion Error:", error);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const imageDoc = doc(db, "gallery", id);
      await updateDoc(imageDoc, { published: !currentStatus });
      // Optimistic UI update
      setImages(images.map(img => img.id === id ? { ...img, published: !currentStatus } : img));
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", caption: "", published: true });
    setUploadedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Manage Gallery</h2>

      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Upload New Images</h3>
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
                {previewUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preview ${idx}`}
                    className="h-24 w-full object-cover rounded"
                  />
                ))}
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p>Drag & drop images, or click to select</p>
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
              {uploading ? 'Uploading...' : 'Upload Images'}
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
        {images.map((img) => (
          <Card key={img.id} className="overflow-hidden">
            <img
              src={img.image_url}
              alt={img.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-sm mb-2">{img.title}</h3>
              <div className="flex items-center justify-between">
                <Switch
                  checked={img.published}
                  onCheckedChange={() => togglePublished(img.id, img.published)}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(img.id, img.image_url)}
                  disabled={loading} // You might want a specific loading state for delete
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
