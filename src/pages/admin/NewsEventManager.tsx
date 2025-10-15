import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface NewsEvent {
  id: string;
  title: string;
  category: 'news' | 'event';
  content: string;
  shortDescription: string;
  imageUrl: string;
  published: boolean;
  createdAt: Timestamp;
  registrationLink?: string;
}

export default function NewsEventManager() {
  const [items, setItems] = useState<NewsEvent[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<NewsEvent>>({ category: 'news', published: false });
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { uploading, uploadImage, deleteImage } = useImageUpload({ path: 'news' });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const itemsCollectionRef = collection(db, "news_events");

  const fetchItems = async () => {
    setLoading(true);
    try {
        const q = query(itemsCollectionRef, orderBy("createdAt", "desc"));
        const data = await getDocs(q);
        setItems(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as NewsEvent[]);
    } catch (error) {
        console.error("Error fetching items: ", error);
        toast.error("Failed to load news and events.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!currentItem.title || !currentItem.content) {
        toast.error("Title and content are required.");
        return;
    }

    try {
      let finalImageUrl = currentItem.imageUrl;

      if (imageFile) {
        if (isEditing && currentItem.imageUrl) {
          await deleteImage(currentItem.imageUrl);
        }
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          return;
        }
      }

      if (!finalImageUrl) {
        toast.error("Please provide an image.");
        return;
      }
      
      const itemData = { ...currentItem, imageUrl: finalImageUrl };

      if (isEditing && currentItem.id) {
        const itemDoc = doc(db, "news_events", currentItem.id);
        await updateDoc(itemDoc, { ...itemData, updatedAt: serverTimestamp() });
        toast.success("Item updated successfully!");
      } else {
        await addDoc(itemsCollectionRef, { ...itemData, createdAt: serverTimestamp(), published: false });
        toast.success("Item created successfully!");
      }
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error("Error saving item: ", error);
      toast.error(error.message || "Failed to save item.");
    }
  };

 const handleDelete = async (id: string, imageUrl: string) => {
    try {
        await deleteDoc(doc(db, "news_events", id));
        await deleteImage(imageUrl);
        toast.success("Item and image deleted successfully!");
        fetchItems();
    } catch (error: any) {
        console.error("Error deleting item: ", error);
        toast.error(error.message || "Failed to delete item.");
    }
};

  const togglePublish = async (item: NewsEvent) => {
    try {
      const itemDoc = doc(db, "news_events", item.id);
      await updateDoc(itemDoc, { published: !item.published });
      toast.success(`Item ${!item.published ? 'published' : 'unpublished'} successfully!`);
      fetchItems();
    } catch (error) {
      console.error("Error toggling publish status: ", error);
      toast.error("Failed to update publish status.");
    }
  }

  const handleEdit = (item: NewsEvent) => {
    setCurrentItem(item);
    setIsEditing(true);
    setImageFile(null);
    setPreviewUrl(item.imageUrl);
  };

  const resetForm = () => {
    setCurrentItem({ category: 'news', published: false });
    setIsEditing(false);
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit News/Event" : "Create News/Event"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={currentItem.title || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
            required
          />
          <Select
            value={currentItem.category || 'news'}
            onValueChange={(value) => setCurrentItem({ ...currentItem, category: value as 'news' | 'event' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
            <Textarea
            placeholder="Short Description"
            value={currentItem.shortDescription || ''}
            onChange={(e) => setCurrentItem({ ...currentItem, shortDescription: e.target.value })}
            rows={3}
          />
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
            <input {...getInputProps()} />
             <p>{isDragActive ? "Drop the image..." : "Drag & drop or click to select image"}</p>
            {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto mt-4 rounded"/>}
            {!previewUrl && currentItem.imageUrl && (
              <div className="mt-4">
                 <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                <img src={currentItem.imageUrl} alt="Current" className="max-h-48 mx-auto rounded" />
              </div>
            )}
          </div>

          {currentItem.category === 'event' && (
            <Input
              placeholder="Registration Link (Optional)"
              value={currentItem.registrationLink || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, registrationLink: e.target.value })}
            />
          )}
          <ReactQuill
            theme="snow"
            value={currentItem.content || ''}
            onChange={(content) => setCurrentItem({ ...currentItem, content })}
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? 'Uploading...' : (isEditing ? "Update Item" : "Create Item")}
            </Button>
            {isEditing && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing News & Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category?.toUpperCase()} - {item.createdAt ? new Date(item.createdAt?.toDate()).toLocaleDateString() : 'No date'}</p>
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
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the item and its image. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id, item.imageUrl)}>Delete</AlertDialogAction>
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
