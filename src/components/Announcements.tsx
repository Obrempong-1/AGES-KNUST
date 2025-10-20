
import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MegaphoneOff } from 'lucide-react';
import AnimatedHeading from './AnimatedHeading';
import { Skeleton } from './ui/skeleton';

interface Announcement {
  id: string;
  title: string;
  body: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  published: boolean;
  createdAt: any;
}

const AnnouncementSkeleton = () => (
    <div className="relative w-full max-w-4xl mx-auto my-12">
        <AnimatedHeading>Announcements</AnimatedHeading>
        <Card className="overflow-hidden shadow-lg rounded-2xl mt-8">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-1/2 aspect-video sm:aspect-[4/3] bg-muted/30">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);


const Announcements = ({ announcements, loading }: { announcements: Announcement[], loading: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

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

  if (loading) {
    return <AnnouncementSkeleton />; 
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="relative w-full max-w-4xl mx-auto my-12" aria-live="polite">
      <AnimatedHeading>Announcements</AnimatedHeading>
      
      {announcements.length === 0 ? (
        <div className="text-center mt-8 bg-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px]">
          <MegaphoneOff className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Announcements Yet</h3>
          <p className="mt-2 text-muted-foreground">
            It's all quiet on the announcement front for now. Please check back later for updates
          </p>
        </div>
      ) : (
        <>
          <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
              >
                  <Card className="overflow-hidden shadow-lg rounded-2xl mt-8">
                      <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/2 aspect-video sm:aspect-[4/3] bg-muted/30">
                          {currentAnnouncement.mediaType === 'video' ? (
                            <video
                              src={currentAnnouncement.mediaUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <img 
                                src={currentAnnouncement.mediaUrl} 
                                alt={currentAnnouncement.title} 
                                className="object-contain w-full h-full"
                            />
                          )}
                          </div>
                          <div className="p-8 sm:w-1/2 flex flex-col justify-center">
                          <h3 className="text-2xl font-bold mb-4">{currentAnnouncement.title}</h3>
                          <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: currentAnnouncement.body }} />
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
        </>
      )}
    </div>
  );
};

export default Announcements;