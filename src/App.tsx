
import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageSkeleton from "./components/loaders/PageSkeleton";
import SplashAnimation from "./components/SplashAnimation";
import NotificationPrompt from "./components/NotificationPrompt";

// Eager load main pages
import Index from "./pages/Index";
import About from "./pages/About";
import Executives from "./pages/Executives";
import NewsEvents from "./pages/NewsEvents";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import PersonalityOfWeek from "./pages/PersonalityOfWeek";
import Blogs from "./pages/Blogs";

const queryClient = new QueryClient();

// Lazy load other pages
const NewsEventDetail = lazy(() => import("./pages/NewsEventDetail"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const ExecutivesManager = lazy(() => import("./pages/admin/ExecutivesManager"));
const GalleryManager = lazy(() => import("./pages/admin/GalleryManager"));
const PersonalityManager = lazy(
  () => import("./pages/admin/PersonalityManager")
);
const AnnouncementsManager = lazy(
  () => import("./pages/admin/AnnouncementsManager")
);
const BlogManager = lazy(() => import("./pages/admin/BlogManager"));
const NewsEventManager = lazy(() => import("./pages/admin/NewsEventManager"));
const PositionsManager = lazy(() => import("./pages/admin/PositionsManager"));

const App = () => {
  const [isSplashActive, setSplashActive] = useState(true);

  useEffect(() => {
    const splashShown = sessionStorage.getItem("splashShown");

    if (splashShown) {
      setSplashActive(false);
      return;
    }

    sessionStorage.setItem("splashShown", "true");
    const timer = setTimeout(() => {
      setSplashActive(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationPrompt />
        {isSplashActive && <SplashAnimation />}
        <BrowserRouter>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route
                path="/"
                element={<Index />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/executives" element={<Executives />} />
              <Route path="/news-events" element={<NewsEvents />} />
              <Route path="/news-event/:id" element={<NewsEventDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route
                path="/personality-of-week"
                element={<PersonalityOfWeek />}
              />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route
                  path="announcements"
                  element={<AnnouncementsManager />}
                />
                <Route path="blog" element={<BlogManager />} />
                <Route path="news-events" element={<NewsEventManager />} />
                <Route path="executives" element={<ExecutivesManager />} />
                <Route path="gallery" element={<GalleryManager />} />
                <Route
                  path="personality"
                  element={<PersonalityManager />}
                />
                <Route path="positions" element={<PositionsManager />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
