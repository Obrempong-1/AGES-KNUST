import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  imageUrl: string;
  published: boolean;
  createdAt: any;
}

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postDocRef = doc(db, "blogs", id);
        const docSnap = await getDoc(postDocRef);

        if (docSnap.exists()) {
          setPost({ ...docSnap.data(), id: docSnap.id } as BlogPost);
        } else {
          setError("Blog post not found.");
        }
      } catch (err) {
        setError("Failed to fetch the content. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-4xl font-bold mt-4">{post.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img src={post.imageUrl} alt={post.title} className="w-full rounded-lg mb-8" />
              <div className="prose dark:prose-invert max-w-none">
                <p>{post.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
