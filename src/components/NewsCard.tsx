
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface NewsCardProps {
  title: string;
  date: string;
  image: string;
  description: string;
  link: string;
}

const NewsCard = ({ item }: { item: NewsCardProps }) => {
  return (
    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col">
      <Link to={item.link} className="h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="relative h-48">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 flex-grow">
          <p className="text-sm text-gray-500 mb-2">{new Date(item.date).toLocaleDateString()}</p>
          <h3 className="text-xl font-bold mb-2 h-14 overflow-hidden">{item.title}</h3>
          <p className="text-gray-600 h-24 overflow-hidden">{item.description}</p>
        </CardContent>
        <CardFooter>
          <div className="mt-auto flex justify-end w-full">
            <Button variant="link" className="p-0 h-auto text-primary">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export const NewsCardSkeleton = () => {
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
        <div className="mt-auto flex justify-end w-full">
          <Skeleton className="h-8 w-1/3" />
        </div>
      </CardFooter>
    </Card>
  )
}


export default NewsCard;
