import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCardSkeleton } from "@/components/BlogCard";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  shortDescription: string;
  content: string;
  imageUrl: string;
  published: boolean;
  createdAt: any;
}

const Blogs = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollectionRef = collection(db, "blogs");
        const q = query(
          postsCollectionRef,
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as BlogPost[];
        setBlogPosts(postsData);
      } catch (err) {
        setError("Failed to fetch blog posts. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        
        <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center animate-fade-in">
              <span className="bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent">
                Our Blog
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-fade-in">
              Insights, tutorials, and stories from the world of geomatic engineering
            </p>
          </div>
        </section>

        
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <BlogCardSkeleton key={index} />
                    ))}
                </div>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : blogPosts.length === 0 ? (
              <p className="text-center text-muted-foreground mt-8">
                No blog posts have been published yet. Check back later!
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post, index) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"} // Fallback image
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                      />
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.shortDescription}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
                        </div>
                        
                        <Link
                          to={`/blog/${post.id}`}
                          className="text-primary hover:underline font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          Read More <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;
