import { motion } from "framer-motion";
import Logo from "@/assets/ages-logo.jpg";

const SplashAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
      <motion.img
        src={Logo}
        alt="Logo"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-32 h-32"
      />
    </motion.div>
  );
};

export default SplashAnimation;
