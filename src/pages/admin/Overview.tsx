import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Users, Image, Award, FileText } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    executives: 0,
    gallery: 0,
    personality: 0,
    content: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [executives, gallery, personality, content] = await Promise.all([
      getDocs(collection(db, "executives")),
      getDocs(collection(db, "gallery")),
      getDocs(collection(db, "personality_of_week")),
      getDocs(collection(db, "content_blocks")),
    ]);

    setStats({
      executives: executives.size,
      gallery: gallery.size,
      personality: personality.size,
      content: content.size,
    });
  };

  const statCards = [
    { label: "Executives", value: stats.executives, icon: Users, color: "text-blue-500" },
    { label: "Gallery Images", value: stats.gallery, icon: Image, color: "text-green-500" },
    { label: "Personalities", value: stats.personality, icon: Award, color: "text-purple-500" },
    { label: "Content Blocks", value: stats.content, icon: FileText, color: "text-orange-500" },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`h-12 w-12 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 p-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <p className="text-muted-foreground">
          Use the sidebar to manage your content, executives, gallery, and personality of the week.
        </p>
      </Card>
    </div>
  );
};

export default AdminOverview;
