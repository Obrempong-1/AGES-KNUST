import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Award,
  Building,
  GraduationCap,
  School,
  Book,
  Trophy,
  Quote,
} from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Personality {
  id: string;
  name: string;
  level: string;
  description: string;
  photo_urls?: string[];
  photo_url?: string;
  week_start: string;
  week_end: string;
  department?: string;
  year?: string;
  highSchool?: string;
  favoriteCourse?: string;
  achievements?: string[];
  favoriteQuote?: string;
}

const personalityCollectionRef = collection(db, "personality_of_week");

const PersonalityOfWeek = () => {
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentPersonality = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(personalityCollectionRef, where("is_active", "==", true));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const personalityData = {
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        } as Personality;
        setPersonality(personalityData);
      } else {
        // No active personality found
      }
    } catch (error: any) {
      console.error("Error fetching personality:", error);
      toast.error("Failed to load personality of the week");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentPersonality();
  }, [fetchCurrentPersonality]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPhotoUrls = () => {
    if (personality?.photo_urls && personality.photo_urls.length > 0) {
      return personality.photo_urls;
    }
    if (personality?.photo_url) {
      return [personality.photo_url];
    }
    return [];
  };

  const photoUrls = getPhotoUrls();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
              <Award className="h-12 w-12 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-center">
                <span className="bg-gradient-to-r from-primary via-orange-400 to-secondary bg-clip-text text-transparent">
                  Personality of the Week
                </span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-fade-in">
              Celebrating outstanding members of our community
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {personality ? (
              <Card className="max-w-6xl mx-auto animate-fade-in shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2">
                  
                  <div className="relative overflow-hidden group">
                    <Carousel className="w-full h-full">
                      <CarouselContent>
                        {photoUrls.length > 0 ? (
                          photoUrls.map((url, index) => (
                            <CarouselItem key={index}>
                              <img
                                src={url}
                                alt={`${personality.name} - ${index + 1}`}
                                className="w-full h-full object-cover min-h-[500px] md:min-h-0"
                              />
                            </CarouselItem>
                          ))
                        ) : (
                          <CarouselItem>
                            <div className="w-full h-full min-h-[500px] bg-muted flex items-center justify-center">
                              <p className="text-muted-foreground">No Image Available</p>
                            </div>
                          </CarouselItem>
                        )}
                      </CarouselContent>
                      {photoUrls.length > 1 && (
                        <>
                          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75" />
                          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75" />
                        </>
                      )}
                    </Carousel>
                  </div>

                  
                  <div className="p-8 md:p-12 flex flex-col">
                    <div className="mb-8">
                      <h2 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {personality.name}
                      </h2>
                      <div className="flex items-center gap-2 text-primary font-semibold text-xl">
                        <Award className="h-6 w-6" />
                        {personality.level}
                      </div>
                    </div>

                    <div className="space-y-5 text-lg mb-8">
                      {personality.department && (
                        <div className="flex items-center gap-3">
                          <Building className="h-7 w-7 text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">Department</p>
                            <p className="text-muted-foreground">{personality.department}</p>
                          </div>
                        </div>
                      )}
                      {personality.year && (
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-7 w-7 text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">Year</p>
                            <p className="text-muted-foreground">{personality.year}</p>
                          </div>
                        </div>
                      )}
                      {personality.highSchool && (
                        <div className="flex items-center gap-3">
                          <School className="h-7 w-7 text-secondary flex-shrink-0" />
                          <div>
                            <p className="font-bold text-foreground">High School</p>
                            <p className="text-muted-foreground">{personality.highSchool}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {personality.favoriteCourse && (
                      <div className="mb-8">
                        <h3 className="font-bold text-xl mb-3 flex items-center gap-3"><Book className="h-6 w-6 text-primary"/> Favorite Course</h3>
                        <p className="text-muted-foreground text-lg ml-9">{personality.favoriteCourse}</p>
                      </div>
                    )}

                    {personality.achievements && personality.achievements.length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-bold text-xl mb-3 flex items-center gap-3"><Trophy className="h-6 w-6 text-primary"/> Achievements</h3>
                        <ul className="space-y-2 ml-9">
                          {personality.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2 text-muted-foreground text-lg">
                              <span className="text-primary font-semibold mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {personality.favoriteQuote && (
                      <div className="mt-auto pt-8">
                        <div className="relative rounded-xl bg-muted/50 p-6 border-l-4 border-primary shadow-inner">
                          <Quote className="absolute -top-3 -left-3 h-12 w-12 text-primary/10" />
                          <blockquote className="text-center italic text-foreground">
                            &ldquo;{personality.favoriteQuote}&rdquo;
                          </blockquote>
                          <Quote className="absolute -bottom-3 -right-3 h-12 w-12 text-primary/10 -scale-x-100" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
                <div className="p-8 md:p-12 border-t">
                  <h3 className="font-bold text-2xl md:text-3xl mb-4">Biography</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {personality.description}
                  </p>
                  <div className="mt-8 pt-6 border-t border-muted/20 flex items-center justify-center gap-2 text-md text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(personality.week_start).toLocaleDateString()} -{" "}
                      {new Date(personality.week_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-20 animate-fade-in">
                <Award className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Personality This Week</h2>
                <p className="text-muted-foreground">Check back soon for our next featured personality!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalityOfWeek;
