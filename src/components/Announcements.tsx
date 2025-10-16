import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  published: boolean;
  createdAt: any;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, 'announcements'),
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[];
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const nextAnnouncement = () => {
    setDirection(1);
    setCurrentIndex(prevIndex => (prevIndex + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setDirection(-1);
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    );
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  const slideVariants: Variants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? '100%' : '-100%',
      scale: 0.98,
    }),
    visible: {
      opacity: 1,
      x: '0%',
      scale: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction < 0 ? '100%' : '-100%',
      scale: 0.98,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-12" aria-live="polite">
        <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <Card className="overflow-hidden shadow-lg rounded-2xl">
                    <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/2 aspect-video sm:aspect-auto">
                        <img 
                            src={announcements[currentIndex].imageUrl} 
                            alt={announcements[currentIndex].title} 
                            className="object-cover w-full h-full"
                            loading="lazy"
                        />
                        </div>
                        <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-4">{announcements[currentIndex].title}</h3>
                        <p className="text-muted-foreground">{announcements[currentIndex].body}</p>
                        </div>
                    </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>

        {announcements.length > 1 && (
        <>
          <button 
            onClick={prevAnnouncement} 
            className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 bg-card/50 backdrop-blur-sm rounded-full p-2 z-10 hover:bg-card/80 transition-colors"
            aria-label="Previous announcement"
            >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextAnnouncement} 
            className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 bg-card/50 backdrop-blur-sm rounded-full p-2 z-10 hover:bg-card/80 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {announcements.map((_, index) => (
                <button 
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-primary scale-125' : 'bg-muted/50'}`}
                    aria-label={`Go to announcement ${index + 1}`}
                />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Announcements;
