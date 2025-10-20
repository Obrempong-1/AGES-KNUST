
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface BlogCardProps {
  title: string;
  image: string;
  short_description: string;
  date: string;
  author: string;
  link: string;
}

const BlogCard = ({ post }: { post: BlogCardProps }) => {
  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col">
      <Link to={post.link} className="h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <p className="text-sm text-gray-500 mb-2">{new Date(post.date).toLocaleDateString()}</p>
          <h3 className="text-xl font-bold mb-2 h-14 overflow-hidden">{post.title}</h3>
          <p className="text-gray-600 mb-4 h-20 overflow-hidden">{post.short_description}</p>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-500">{post.author}</span>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0">
        <Skeleton className="h-48 w-full" />
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Skeleton className="h-4 w-1/4 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-5" />
        </div>
      </CardFooter>
    </Card>
  )
}

export default BlogCard;
