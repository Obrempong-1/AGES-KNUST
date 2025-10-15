import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, Image, Award, FileText, Newspaper, BookOpen } from "lucide-react";

const dashboardItems = [
    {
        path: "/admin/content",
        label: "Content",
        icon: FileText,
        description: "Manage the textual content of your website's pages.",
    },
    {
        path: "/admin/blog",
        label: "Blog",
        icon: BookOpen,
        description: "Create, edit, and publish blog posts for your audience.",
    },
    {
        path: "/admin/news-events",
        label: "News & Events",
        icon: Newspaper,
        description: "Keep your users informed about the latest news and upcoming events.",
    },
    {
        path: "/admin/executives",
        label: "Executives",
        icon: Users,
        description: "Manage the profiles of the executive members of the association.",
    },
    {
        path: "/admin/gallery",
        label: "Gallery",
        icon: Image,
        description: "Upload and organize images in the website's gallery.",
    },
    {
        path: "/admin/personality",
        label: "Personality",
        icon: Award,
        description: "Feature a 'Personality of the Week' to highlight members.",
    },
];

const AdminDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-8">
                Welcome to the AGES Admin Dashboard. From here you can manage all the content of your website.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link to={item.path} key={item.path} className="block hover:no-underline">
                            <Card 
                                className="hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                    <div className="bg-primary/10 p-3 rounded-lg">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-lg">{item.label}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{item.description}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
