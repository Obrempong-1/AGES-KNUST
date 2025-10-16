import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  created_at: string;
}

const galleryCollectionRef = collection(db, "gallery");

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(galleryCollectionRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const imagesData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as GalleryImage[];
      setImages(imagesData);
    } catch (error: any) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        
        <section className="pt-32 pb-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center animate-fade-in">
              <span className="bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent">
                Gallery
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto animate-fade-in">
              Explore our collection of memorable moments and achievements
            </p>
          </div>
        </section>

        
        <section className="py-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading gallery...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-20">
                <ImageIcon className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">No images in gallery yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <Card
                    key={image.id}
                    className="group overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                          {image.caption && (
                            <p className="text-sm opacity-90 line-clamp-2">{image.caption}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <div className="mt-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
              {selectedImage.caption && (
                <p className="text-lg opacity-90">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
