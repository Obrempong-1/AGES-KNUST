import { useState, useEffect, useCallback } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/useImageUpload";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  shortDescription: string;
  imageUrl: string;
  published: boolean;
  createdAt: any;
}

const postsCollectionRef = collection(db, "blogs");

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { uploading, uploadImage, deleteImage } = useImageUpload({ path: 'blogs' });

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

  const fetchPosts = useCallback(async () => {
    const q = query(postsCollectionRef, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setPosts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as BlogPost[]);
  }, []);

  useEffect(() => {
    fetchPosts();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [fetchPosts, previewUrl]);

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.author || !currentPost.content) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      let imageUrl = currentPost.imageUrl;

      if (imageFile) {
        if (isEditing && currentPost.imageUrl) {
          await deleteImage(currentPost.imageUrl);
        }
        const newImageUrl = await uploadImage(imageFile);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        } else {
          return;
        }
      }

      if (!imageUrl) {
        toast.error("Image upload failed or no image was provided.");
        return;
      }

      const { id, ...postData } = { ...currentPost, imageUrl, published: currentPost.published ?? false };

      if (isEditing && currentPost.id) {
        const postDoc = doc(db, "blogs", currentPost.id);
        await updateDoc(postDoc, { ...postData, updatedAt: serverTimestamp() });
        toast.success("Post updated successfully!");
      } else {
        await addDoc(postsCollectionRef, { ...postData, createdAt: serverTimestamp() });
        toast.success("Post created successfully!");
      }
      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error("Error saving post: ", error);
      toast.error(error.message || "Failed to save post.");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
    setImageFile(null);
    setPreviewUrl(post.imageUrl);
  };

  const handleDelete = async (post: BlogPost) => {
    try {
        if (post.imageUrl) {
            await deleteImage(post.imageUrl);
        }
      const postDoc = doc(db, "blogs", post.id);
      await deleteDoc(postDoc);
      toast.success("Post deleted successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post: ", error);
      toast.error("Failed to delete post.");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const postDoc = doc(db, "blogs", post.id);
      await updateDoc(postDoc, { published: !post.published });
      toast.success(`Post ${!post.published ? 'published' : 'unpublished'} successfully!`);
      fetchPosts();
    } catch (error) {
      console.error("Error toggling publish status: ", error);
      toast.error("Failed to update publish status.");
    }
  }

  const resetForm = () => {
    setCurrentPost({});
    setIsEditing(false);
    setImageFile(null);
    if(previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={currentPost.title || ''}
            onChange={(e) => setCurrentPost(prev => ({ ...prev, title: e.target.value }))}
          />
          <Input
            placeholder="Author"
            value={currentPost.author || ''}
            onChange={(e) => setCurrentPost(prev => ({ ...prev, author: e.target.value }))}
          />
           <Textarea
            placeholder="Short Description"
            value={currentPost.shortDescription || ''}
            onChange={(e) => setCurrentPost(prev => ({ ...prev, shortDescription: e.target.value }))}
            rows={3}
          />
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
            <input {...getInputProps()} />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto" />
            ) : (
              <p>{isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select one"}</p>
            )}
          </div>

          <ReactQuill
            theme="snow"
            value={currentPost.content || ''}
            onChange={(content) => setCurrentPost(prev => ({ ...prev, content }))}
          />

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? 'Uploading...' : (isEditing ? "Update Post" : "Create Post")}
            </Button>
            {isEditing && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img src={post.imageUrl} alt={post.title} className="w-24 h-24 object-cover rounded"/>
                  <div>
                    <h3 className="font-bold">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">By {post.author} on {new Date(post.createdAt?.toDate()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={post.published}
                      onCheckedChange={() => togglePublish(post)}
                      aria-readonly
                    />
                    <span>{post.published ? "Published" : "Draft"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post)}>Delete</AlertDialogAction>
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
};

export default BlogManager;
