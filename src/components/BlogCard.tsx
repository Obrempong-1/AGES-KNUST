
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
    >
      <Link to={post.link} className="block">
        <div className="relative h-48">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">{new Date(post.date).toLocaleDateString()}</p>
          <h3 className="text-xl font-bold mb-2 h-14 overflow-hidden">{post.title}</h3>
          <p className="text-gray-600 mb-4 h-20 overflow-hidden">{post.short_description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{post.author}</span>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
