import { motion } from "framer-motion";
import Logo from "@/assets/ages-logo.jpg";

const SplashAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <motion.img
        src={Logo}
        alt="Logo"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-32 h-32"
      />
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        className="text-2xl font-bold mt-4 bg-gradient-to-br from-primary via-foreground to-secondary bg-clip-text text-transparent"
      >
        AGES-KNUST
      </motion.h1>
    </motion.div>
  );
};

export default SplashAnimation;
