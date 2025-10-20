
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, Users, Trophy, Calendar, Hand } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";
import survey from "@/assets/survey.jpg";
import BlogCard, { BlogCardSkeleton } from "@/components/BlogCard";
import NewsCard, { NewsCardSkeleton } from "@/components/NewsCard";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import Announcements from "@/components/Announcements";
import AnimatedHeading from "@/components/AnimatedHeading";
import ScrollZoom from "@/components/ScrollZoom";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface Personality {
  id: string;
  name: string;
  level: string;
  photo_urls?: string[];
  photo_url?: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  published: boolean;
  createdAt: any;
}


const fetchAnnouncements = async (): Promise<Announcement[]> => {
    const q = query(
      collection(db, 'announcements'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
};


const fetchBlogs = async (): Promise<any[]> => {
    const itemsCollectionRef = collection(db, "blogs");
    const q = query(
      itemsCollectionRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.createdAt.toDate().toISOString(),
        image: data.imageUrl,
        short_description: data.shortDescription,
        author: data.author,
        link: `/blog/${doc.id}`,
      };
    });
};


const fetchNewsEvents = async (): Promise<any[]> => {
    const itemsCollectionRef = collection(db, "news_events");
    const q = query(
      itemsCollectionRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.createdAt.toDate().toISOString(),
        image: data.imageUrl,
        description: data.shortDescription,
        link: `/news-events#${doc.id}`,
      };
    });
};


const fetchPersonality = async (): Promise<Personality | null> => {
    const personalityCollectionRef = collection(db, "personality_of_week");
    const q = query(
      personalityCollectionRef,
      where("is_active", "==", true),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Personality;
    }
    return null;
};


const PersonalityCardSkeleton = () => (
  <Card className="max-w-sm mx-auto mb-8 overflow-hidden shadow-lg rounded-lg">
    <Skeleton className="w-full h-80" />
    <div className="p-6">
      <Skeleton className="h-8 w-3/4 mb-2 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  </Card>
);

const Index = () => {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const isMobile = useIsMobile();

  
  const announcementsQuery = useQuery({ queryKey: ['announcements'], queryFn: fetchAnnouncements, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false });
  const blogsQuery = useQuery({ queryKey: ['blogs'], queryFn: fetchBlogs, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false });
  const newsQuery = useQuery({ queryKey: ['newsEvents'], queryFn: fetchNewsEvents, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false });
  const personalityQuery = useQuery({ queryKey: ['personality'], queryFn: fetchPersonality, staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false });


  const getPersonalityImageUrls = () => {
    const personality = personalityQuery.data;
    if (personality?.photo_urls && personality.photo_urls.length > 0) {
      return personality.photo_urls;
    }
    if (personality?.photo_url) {
      return [personality.photo_url];
    }
    return [];
  };

  const personalityImageUrls = getPersonalityImageUrls();

  const heroSlides = [
    { image: heroBg, title: "WELCOME TO ASSOCIATION OF GEOMATIC ENGINEERING STUDENTS", subtitle: "Mapping the future with precision. Excellence in surveying, GIS, remote sensing, and spatial data science." },
    { image: heroSlide2, title: "Masters of Measurement & Mapping", subtitle: "From field surveys to advanced GIS - developing the skills to shape our spatial world." },
    { image: heroSlide3, title: "Geospatial Innovation & Technology", subtitle: "Leading the way in GPS, LiDAR, photogrammetry, and cutting-edge surveying techniques." },
    { image: heroSlide4, title: "Building Tomorrow's Surveyors", subtitle: "Join a community dedicated to precision, accuracy, and professional excellence in geomatic engineering." },
  ];
  const stats = [
    { icon: Users, label: "Active Members", value: "450+" },
    { icon: BookOpen, label: "Field Surveys", value: "1000+" },
    { icon: Trophy, label: "Projects Completed", value: "1000+" },
    { icon: Calendar, label: "Years Established", value: "30+" },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{ align: "center", loop: true }}
      >
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index} className="relative h-screen flex items-center justify-center overflow-hidden basis-full">
                
                <img 
                    src={slide.image} 
                    alt="" 
                    className="absolute top-0 left-0 w-full h-full object-cover -z-10"
                />
              <div
                className="absolute top-0 left-0 w-full h-full -z-10"
                style={{
                  backgroundImage: `linear-gradient(rgba(30, 64, 175, 0.7), rgba(251, 146, 60, 0.7))`
                }}
              />
              <div className="container mx-auto px-4 text-center relative z-10 pt-20">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p
                  className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  {slide.subtitle}
                </p>
                <div
                  className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
                  style={{ animationDelay: "0.4s" }}
                >
                  <Link to="/about">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 gap-2"
                    >
                      Learn More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/news-events">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                    >
                      Latest News
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-white/80 mt-4">
                  Discover how AGES shapes future leaders in geomatic
                  engineering
                </p>
                {isMobile && (
                  <motion.div
                    className="mt-6 flex flex-col items-center gap-1 text-white/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.8, 1],
                    }}
                  >
                    <motion.div
                      animate={{
                        x: [-10, 10, -10],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                    >
                      <Hand className="h-9 w-9 fill-white/50" />
                    </motion.div>
                    <span className="text-xs font-semibold tracking-widest">
                      SWIPE
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white" />
        <CarouselNext className="hidden md:flex absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white" />
      </Carousel>

      <Announcements announcements={announcementsQuery.data ?? []} loading={announcementsQuery.isLoading} />

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              className={`relative group transition-all duration-1000`}
            >
              <div className="overflow-hidden rounded-lg shadow-xl relative">
                <img
                  src={survey}
                  alt="Students working with surveying equipment"
                  className="w-full h-[600px] object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-1 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/20 to-transparent group-hover:from-secondary/90 group-hover:via-secondary/40 transition-all duration-500 flex items-end p-8">
                  <div className="text-white transform translate-y-0 group-hover:-translate-y-6 transition-all duration-500">
                    <h4 className="text-3xl font-bold mb-3 transform scale-95 group-hover:scale-105 transition-transform duration-500">
                      Hands-On Learning
                    </h4>
                    <p className="text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-all duration-500">
                      Real-world applications of surveying principles with
                      state-of-the-art equipment.
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 border-4 border-secondary/30 group-hover:border-secondary/60 rounded-lg transition-all duration-500 animate-pulse group-hover:animate-none"></div>

                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/50 group-hover:border-white/90 group-hover:w-16 group-hover:h-16 transition-all duration-500"></div>
              </div>
            </div>

            <div
              className={`space-y-6 transition-all duration-1000 delay-300`}
            >
             <AnimatedHeading>What We Do</AnimatedHeading>

              <div className="space-y-4">
                <div
                  className={`transition-all duration-700 delay-200`}
                >
                  <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    Professional Training
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We provide comprehensive training in land surveying, geodetic
                    control, digital mapping, and GIS analysis. Our programs are
                    designed to meet industry standards and prepare students for
                    professional licensure.
                  </p>
                </div>

                <div
                  className={`transition-all duration-700 delay-400`}
                >
                  <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-6 w-6 text-secondary" />
                    Field Experience
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Hands-on experience with Total Stations, GPS/GNSS receivers,
                    drones, and LiDAR systems. Students work on real-world
                    projects from cadastral surveys to topographic mapping.
                  </p>
                </div>

                <div
                  className={`transition-all duration-700 delay-600`}
                >
                  <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Innovation & Research
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We embrace cutting-edge technologies in remote sensing, drone
                    photogrammetry, and spatial data science, preparing our
                    members for the future of geomatic engineering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background text-center">
        <div className="container mx-auto px-4">
          {(personalityQuery.isLoading || personalityQuery.data) && (
            <div className="mb-8">
              {personalityQuery.isLoading ? (
                <PersonalityCardSkeleton />
              ) : (
                personalityQuery.data && (
                  <Link to="/personality-of-week">
                    <Card className="max-w-sm mx-auto overflow-hidden shadow-lg rounded-lg card-lift cursor-pointer">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {personalityImageUrls.length > 0 ? (
                            personalityImageUrls.map((url, index) => (
                              <CarouselItem key={index}>
                                <img
                                  src={url}
                                  alt={`${personalityQuery.data?.name} - Photo ${index + 1}`}
                                  className="w-full h-80 object-cover"
                                />
                              </CarouselItem>
                            ))
                          ) : (
                            <CarouselItem>
                              <img
                                src={survey}
                                alt="Default Survey"
                                className="w-full h-80 object-cover"
                              />
                            </CarouselItem>
                          )}
                        </CarouselContent>
                        {personalityImageUrls.length > 1 && (
                          <>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/75" />
                          </>
                        )}
                      </Carousel>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold mb-2">{personalityQuery.data.name}</h3>
                        <p className="text-muted-foreground">{personalityQuery.data.level}</p>
                      </div>
                    </Card>
                  </Link>
                )
              )}
            </div>
          )}
          <Link to="/personality-of-week">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
            >
              View Personality of the Week
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {(newsQuery.isLoading || (newsQuery.data && newsQuery.data.length > 0)) && (
        <section className="py-20 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <AnimatedHeading>Latest News & Events</AnimatedHeading>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              Stay up-to-date with the latest happenings in the association.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {newsQuery.isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <NewsCardSkeleton key={index} />
                ))
              ) : (
                newsQuery.data?.map((item, index) => (
                    <ScrollZoom key={index} delay={index * 100}>
                    <NewsCard item={item} />
                    </ScrollZoom>
                ))
              )}
            </div>
            <div className="text-center mt-12">
              <Link to="/news-events">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
                >
                  View All News & Events
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {(blogsQuery.isLoading || (blogsQuery.data && blogsQuery.data.length > 0)) && (
      <section
        className="py-20 bg-background relative overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <div
            className={`absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl transition-all duration-1000`}
          ></div>
          <div
            className={`absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl transition-all duration-1000 delay-300`}
          ></div>
        </div>

        <div className="container mx-auto px-4">
        <AnimatedHeading>Latest Blogs</AnimatedHeading>
          <p
              className={`text-lg text-muted-foreground max-w-2xl mx-auto mt-4 transition-all duration-1000 delay-300`}
            >
              Insights, tutorials, and stories from the world of geomatic
              engineering
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {blogsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                    <BlogCardSkeleton key={index} />
                ))
              ) : (
                blogsQuery.data?.map((blog, index) => (
                    <ScrollZoom key={index} delay={index * 100}>
                    <BlogCard post={blog} />
                    </ScrollZoom>
                ))
              )}
            </div>

          <div
            className={`text-center mt-12 transition-all duration-1000 delay-700`}
          >
            <Link to="/blogs">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all duration-300"
              >
                View All Blogs
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <Link to="/about" key={index}>
                    <Card
                        className="p-6 text-center hover:shadow-lg transition-shadow animate-fade-in h-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">
                        {stat.label}
                        </div>
                    </Card>
                </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Welcome, Future Surveyors
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Master the art and science of measurement. From traditional land
            surveying to cutting-edge geospatial technologies, we're here to
            guide your journey in becoming skilled geomatic engineers. Together,
            we map the future with precision and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                Explore Surveying Programs
              </Button>
            </Link>
            <Link to="/news-events">
              <Button
                size="lg"
                variant="ghost"
                className="border-white text-white hover:bg-white/10"
              >
                Upcoming Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
