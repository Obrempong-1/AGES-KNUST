import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NewsEvent {
  id: string;
  title: string;
  category: 'news' | 'event';
  content: string;
  imageUrl: string;
  published: boolean;
  createdAt: any; 
  registrationLink?: string;
}

const NewsEvents = () => {
  const [items, setItems] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsCollectionRef = collection(db, "news_events");
        const q = query(
          itemsCollectionRef,
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const itemsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as NewsEvent[];
        setItems(itemsData);
      } catch (err) {
        setError("Failed to fetch news and events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        
        <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center animate-fade-in">
              <span className="bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent">
                News & Events
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-fade-in">
              Stay updated with the latest happenings, achievements, and upcoming events
            </p>
          </div>
        </section>

        
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={item.category === 'event' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}>
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {item.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                      
                      {item.category === 'event' && item.registrationLink ? (
                        <a href={item.registrationLink} target="_blank" rel="noopener noreferrer">
                          <Button>Register</Button>
                        </a>
                      ) : (
                        <Link
                          to={`/news-event/${item.id}`}
                          className="text-primary hover:underline font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          Read More <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewsEvents;
