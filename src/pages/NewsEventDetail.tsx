
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const NewsEventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const itemDocRef = doc(db, "news_events", id);
        const docSnap = await getDoc(itemDocRef);

        if (docSnap.exists()) {
          setItem({ ...docSnap.data(), id: docSnap.id } as NewsEvent);
        } else {
          setError("Item not found.");
        }
      } catch (err) {
        setError("Failed to fetch the content. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  if (!item) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <Badge className={`mb-4 w-min ${item.category === 'event' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{item.category}</Badge>
              <CardTitle className="text-4xl font-bold mt-4">{item.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg mb-8" />
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
              {item.category === 'event' && item.registrationLink && (
                <div className="mt-8 text-center">
                  <a href={item.registrationLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg">Register for this Event</Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsEventDetail;
