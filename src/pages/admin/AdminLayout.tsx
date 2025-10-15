import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Image, Award, FileText, Home, Newspaper, BookOpen, Megaphone } from "lucide-react";

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { path: "/admin/blog", label: "Blog", icon: BookOpen },
    { path: "/admin/news-events", label: "News & Events", icon: Newspaper },
    { path: "/admin/executives", label: "Executives", icon: Users },
    { path: "/admin/gallery", label: "Gallery", icon: Image },
    { path: "/admin/personality", label: "Personality", icon: Award },
    { path: "/admin/positions", label: "Positions", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AGES Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        
        <aside className="w-64 border-r min-h-[calc(100vh-73px)] bg-card">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/admin' ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
