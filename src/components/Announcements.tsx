import { useState, useEffect, useRef } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, useInView } from "framer-motion";
import 'react-quill/dist/quill.snow.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  createdAt: any;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const isAnnouncementVisible = useInView(announcementRef, { once: true, amount: 0.2 });
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    setLoading(true);
    const announcementsCollectionRef = collection(db, "announcements");
    const q = query(
      announcementsCollectionRef,
      where("published", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setAnnouncements(
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Announcement[]
      );
      setLoading(false);
    }, (error) => {
      console.error("Error fetching announcements in real-time:", error);
      setError("Failed to fetch announcements. A required Firestore index is likely missing. Check the browser console for a link to create it.");
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading || error) {
    return null;
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section ref={announcementRef} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="relative">
          <CarouselContent>
            {announcements.map((announcement) => (
              <CarouselItem key={announcement.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isAnnouncementVisible ? 1 : 0, scale: isAnnouncementVisible ? 1 : 0.95 }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                  <Card className="shadow-2xl rounded-2xl border-4 border-primary/10 hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <img src={announcement.imageUrl} alt={announcement.title} className="object-cover h-full w-full" />
                      </div>
                      <div className="md:w-1/2 p-10">
                        <h2 className="text-4xl font-extrabold text-primary mb-5">{announcement.title}</h2>
                        <div className="ql-snow">
                          <div
                            className="ql-editor"
                            dangerouslySetInnerHTML={{ __html: announcement.content }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        {announcements.length > 1 && (
          <div className="flex md:hidden items-center justify-center space-x-2 mt-4">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`h-2 w-2 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Announcements;
