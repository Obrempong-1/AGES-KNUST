import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Mail, Linkedin, Phone } from "lucide-react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Executive {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  email: string | null;
  linkedin_url: string | null;
  photo_url: string;
}

interface OpenPosition {
  id: string;
  title: string;
}

const Executives = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<string>("");

  const executivesCollectionRef = collection(db, "executives");

  const fetchExecutives = useCallback(async () => {
    try {
      const q = query(
        executivesCollectionRef,
        where("published", "==", true),
        orderBy("display_order", "asc")
      );
      const querySnapshot = await getDocs(q);
      const executivesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Executive[];
      setExecutives(executivesData);
    } catch (error) {
      console.error("Error fetching executives:", error);
      toast.error("Failed to load executives");
    } finally {
      setLoading(false);
    }
  }, [executivesCollectionRef]);

  const fetchOpenPositions = useCallback(async () => {
    try {
      const q = query(
        collection(db, "positions"),
        where("open", "==", true),
        orderBy("title", "asc")
      );
      const querySnapshot = await getDocs(q);
      const positionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      })) as OpenPosition[];
      console.log("Fetched open positions:", positionsData);
      setOpenPositions(positionsData);
    } catch (error) {
      console.error("Error fetching open positions:", error);
    }
  }, []);

  useEffect(() => {
    fetchExecutives();
    fetchOpenPositions();
  }, [fetchExecutives, fetchOpenPositions]);

  return (
    <div className="min-h-screen">
      <Navigation />

      <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center animate-fade-in bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Our Leadership Team
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-fade-in">
            Meet the dedicated student leaders guiding our department towards excellence
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading executives...</p>
            </div>
          ) : executives.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No executives to display</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {executives.map((exec, index) => (
                <Card 
                  key={exec.id} 
                  className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={exec.photo_url} 
                      alt={exec.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-1">{exec.name}</h3>
                    <p className="text-primary font-semibold mb-4">{exec.position}</p>
                    <div className="space-y-2 mb-6">
                      {exec.phone && (
                        <a 
                          href={`tel:${exec.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          {exec.phone}
                        </a>
                      )}
                      {exec.email && (
                        <a 
                          href={`mailto:${exec.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          {exec.email}
                        </a>
                      )}
                      {exec.linkedin_url && (
                        <a 
                          href={exec.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our faculty and staff. If you're passionate about education and excellence, we'd love to hear from you.
          </p>
          <Accordion type="single" collapsible className="w-full max-w-lg mx-auto bg-white/10 rounded-lg">
            <AccordionItem value="item-1">
              <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
                View Open Positions
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {openPositions.length > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    <Select onValueChange={setSelectedPosition}>
                      <SelectTrigger className="w-full text-black">
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {openPositions.map((position) => (
                          <SelectItem key={position.id} value={position.title}>
                            {position.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <a href={`mailto:agesknust26@gmail.com?subject=Application%20for%20${selectedPosition}`} className={`w-full ${!selectedPosition ? 'pointer-events-none' : ''}`}>
                      <Button className="w-full" disabled={!selectedPosition}>
                        Apply Now
                      </Button>
                    </a>
                  </div>
                ) : (
                  <p className="text-white/80">There are currently no open positions. Please check back later.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Executives;
