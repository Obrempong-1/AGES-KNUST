import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  createdAt: Timestamp;
}

export default function AnnouncementsManager() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploading, uploadImage, deleteImage } = useImageUpload({
    path: "announcements",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const itemsCollectionRef = collection(db, "announcements");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(itemsCollectionRef, orderBy("createdAt", "desc"));
      const data = await getDocs(q);
      setItems(
        data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as AnnouncementItem[]
      );
    } catch (error) {
      console.error("Error fetching items: ", error);
      toast.error("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = useCallback(() => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setCurrentImageUrl("");
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleSave = async () => {
    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      let finalImageUrl = currentImageUrl;

      if (imageFile) {
        if (isEditing && currentImageUrl) {
          await deleteImage(currentImageUrl);
        }
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          toast.error("Image upload failed. Please try again.");
          return;
        }
      } else if (!isEditing) {
        toast.error("Please provide an image.");
        return;
      }

      const itemData = { title, content, imageUrl: finalImageUrl };

      if (isEditing && editingId) {
        const itemDoc = doc(db, "announcements", editingId);
        await updateDoc(itemDoc, { ...itemData, updatedAt: serverTimestamp() });
        toast.success("Announcement updated successfully!");
      } else {
        await addDoc(itemsCollectionRef, {
          ...itemData,
          createdAt: serverTimestamp(),
          published: true,
        });
        toast.success("Announcement created successfully!");
      }
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error("Error saving item: ", error);
      toast.error(error.message || "Failed to save announcement.");
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      await deleteImage(imageUrl);
      toast.success("Announcement and image deleted successfully!");
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting item: ", error);
      toast.error(error.message || "Failed to delete announcement.");
    }
  };

  const togglePublish = async (item: AnnouncementItem) => {
    try {
      const itemDoc = doc(db, "announcements", item.id);
      await updateDoc(itemDoc, { published: !item.published });
      toast.success(
        `Announcement ${!item.published ? "published" : "unpublished"} successfully!`
      );
      fetchItems();
    } catch (error) {
      console.error("Error toggling publish status: ", error);
      toast.error("Failed to update publish status.");
    }
  };

  const handleEdit = (item: AnnouncementItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCurrentImageUrl(item.imageUrl);
    setPreviewUrl(item.imageUrl);
    setImageFile(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Announcement" : "Create Announcement"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
          >
            <input {...getInputProps()} />
            <p>
              {isDragActive
                ? "Drop the image..."
                : "Drag & drop or click to select image"}
            </p>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto mt-4 rounded"
              />
            )}
          </div>
          <ReactQuill theme="snow" value={content} onChange={setContent} />
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={uploading}>
              {uploading
                ? "Uploading..."
                : isEditing
                ? "Update Announcement"
                : "Create Announcement"}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.createdAt
                      ? new Date(item.createdAt?.toDate()).toLocaleDateString()
                      : "No date"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.published}
                      onCheckedChange={() => togglePublish(item)}
                      aria-readonly
                    />
                    <span>{item.published ? "Published" : "Draft"}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the announcement and its
                          image. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.id, item.imageUrl)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
