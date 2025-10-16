import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Calendar, Award } from "lucide-react";
import { toast } from "sonner";

interface Personality {
  id: string;
  name: string;
  level: string;
  description: string;
  photo_url: string;
  week_start: string;
  week_end: string;
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
        const personalityData = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as Personality;
        setPersonality(personalityData);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        
        <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
              <Award className="h-12 w-12 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-center">
                <span className="bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent">
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
              <Card className="max-w-5xl mx-auto overflow-hidden animate-fade-in">
                <div className="grid md:grid-cols-2 gap-0">
                  
                  <div className="relative overflow-hidden group">
                    <img
                      src={personality.photo_url}
                      alt={personality.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-white/50 transition-all duration-300 group-hover:w-20 group-hover:h-20"></div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-white/50 transition-all duration-300 group-hover:w-20 group-hover:h-20"></div>
                  </div>

                  
                  <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-card to-muted/30">
                    <div className="mb-6">
                      <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
                        {personality.name}
                      </h2>
                      <div className="flex items-center gap-2 text-primary font-semibold text-lg animate-fade-in" style={{ animationDelay: "0.1s" }}>
                        <Award className="h-5 w-5" />
                        {personality.level}
                      </div>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                      {personality.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(personality.week_start).toLocaleDateString()} - {new Date(personality.week_end).toLocaleDateString()}
                      </span>
                    </div>
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
