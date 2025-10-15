
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface NewsCardProps {
  title: string;
  date: string;
  image: string;
  description: string;
  link: string;
}

const NewsCard = ({ item }: { item: NewsCardProps }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl"
    >
      <Link to={item.link} className="block">
        <div className="relative h-48">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">{new Date(item.date).toLocaleDateString()}</p>
          <h3 className="text-xl font-bold mb-2 h-14 overflow-hidden">{item.title}</h3>
          <p className="text-gray-600 h-24 overflow-hidden">{item.description}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default NewsCard;
