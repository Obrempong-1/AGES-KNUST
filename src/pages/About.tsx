import { useRef, ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Check, Users, Target, BookOpen, Handshake, Lightbulb, GraduationCap, Briefcase } from 'lucide-react';
import { motion, useInView, Variants } from "framer-motion";
import Geomatic from "@/assets/survey.jpg";

const VisionMissionCard = ({ icon: Icon, title, content, delay = 0 }: { icon: React.ElementType, title: string, content: ReactNode, delay?: number }) => {
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 40, scale: 0.98 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.8, ease: "easeOut", delay }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
            className="group relative p-8 rounded-2xl shadow-lg bg-white/50 dark:bg-black/30 backdrop-blur-lg overflow-hidden h-full"
        >
            <div className="relative z-10">
                <motion.div
                    className="inline-block mb-4"
                    whileHover={{ y: [0, -5, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
                >
                    <Icon className="h-12 w-12 text-primary" />
                </motion.div>

                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{title}</h3>

                <motion.div
                    className="h-0.5 bg-primary mb-6"
                    initial={{ width: 0 }}
                    whileInView={{ width: "50%" }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />

                <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                    {content}
                </div>
            </div>
        </motion.div>
    );
};

const About = () => {
  const values = [
    { title: "Excellence", description: "Striving for the highest standards in all our endeavors.", icon: Check },
    { title: "Innovation", description: "Fostering a culture of creativity and forward-thinking.", icon: Lightbulb },
    { title: "Community", description: "Building a supportive and collaborative network of students.", icon: Users },
    { title: "Integrity", description: "Upholding ethical principles in all our actions.", icon: Handshake },
  ];

  const courses = [
    "Land Surveying",
    "Engineering Surveying",
    "Large Scale Surveying",
    "GIS",
    "Photogrammetry",
    "Remote Sensing",
    "Cartography",
    "Hydrographic Surveying",
    "And many more...",
  ];

  const jobs = [
    "Land Surveyor",
    "GIS Analyst",
    "Spatial Data Scientist",
    "Cartographer",
    "Photogrammetrist",
    "Mining Surveyor",
    "Remote Sensing Specialist",
    "Hydrographic Surveyor",
    "Civil Engineer",
    "Urban Planner",
    "Construction Manager",
    "Environmental Consultant",
    "Real Estate Developer",
    "Transportation Planner",
    "Disaster Management Specialist",
    "Academia & Research",
  ];

  const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
      <motion.section
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{ 
            hidden: { opacity: 0, y: 20 }, 
            visible: { opacity: 1, y: 0 } 
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.section>
    );
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        
        <motion.section 
          className="relative pt-40 pb-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.3 } }
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              ABOUT AGES
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto" 
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              Association of Geomatic Engineering Students
            </motion.p>
          </div>
        </motion.section>

        
        <Section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="prose prose-lg max-w-none"
              >
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Our Story</h2>
                <p>The Association of Geomatic Engineering Students (AGES) is the student body for all students pursuing a Bachelor of Science in Geomatic Engineering at the Kwame Nkrumah University of Science and Technology.</p><p>Established to foster a vibrant community, AGES is dedicated to the academic and professional development of its members, bridging the gap between classroom theories and real-world applications in the dynamic field of Geomatic Engineering.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <img src={Geomatic} alt="AGES students" className="rounded-lg shadow-xl w-full h-auto object-cover" />
              </motion.div>
            </div>
          </div>
        </Section>

        
        <motion.section 
          className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
        >
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <VisionMissionCard 
                icon={Target} 
                title="Our Vision" 
                content='To be a leading student association that empowers future geomatic engineers with the skills, knowledge, and network to excel and drive innovation in the industry.'
              />
              <VisionMissionCard 
                icon={BookOpen} 
                title="Our Mission" 
                content={<ul><li>To provide a platform for academic and professional growth.</li><li>To foster a strong and supportive community among students.</li><li>To bridge the gap between students and industry professionals.</li><li>To promote the field of geomatic engineering.</li></ul>}
                delay={0.2}
              />
            </div>
          </div>
        </motion.section>

        
        <Section className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              variants={fadeInUp}
              className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Our Core Values
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                >
                  <Card 
                    className="p-6 text-center h-full hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <value.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        
        <Section className="py-20 bg-muted">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="container mx-auto px-4"
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Our Journey
              </h2>
              <div className="prose prose-lg max-w-none mb-12">
                <p>From our humble beginnings, AGES has grown into a dynamic and influential student body. We have a rich history of organizing impactful events, workshops, and seminars, connecting our members with industry leaders, and consistently supporting the academic pursuits of our students. Our journey is one of continuous growth, driven by the passion and dedication of our members and executives.</p>
              </div>
            </div>
          </motion.div>
        </Section>

        
        <Section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                variants={fadeInUp} 
                className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center"><GraduationCap className="h-10 w-10 mr-4 text-primary" /> <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">What You Will Learn</span></h2>
                <p className="text-xl text-muted-foreground mb-12">Our curriculum provides comprehensive training in land surveying, geodetic control, digital mapping, and GIS analysis. Our programs are designed to meet industry standards and prepare students for professional licensure, with hands-on experience using cutting-edge equipment including Total Stations, GPS/GNSS systems, drones, and LiDAR technology.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {courses.map((course, index) => (
                    <motion.div 
                        key={course}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                        className="bg-primary text-primary-foreground font-semibold rounded-lg p-3 text-center"
                    >
                        {course}
                    </motion.div>
                ))}
            </div>
          </div>
        </Section>

        
        <Section className="py-20 bg-muted">
            <div className="container mx-auto px-4">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    variants={fadeInUp}
                    className="text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl font-bold mb-4 flex items-center justify-center"><Briefcase className="h-10 w-10 mr-4 text-primary" /> <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Career Opportunities</span></h2>
                    <p className="text-xl text-muted-foreground mb-12">A degree in Geomatic Engineering from KNUST opens up a world of possibilities. Our graduates are highly sought after in a variety of industries, both in the public and private sectors. With a strong foundation in spatial data science, our alumni are well-prepared for successful careers in land surveying, GIS analysis, and beyond.</p>
                </motion.div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {jobs.map((job, index) => (
                        <motion.div 
                            key={job}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                            className="bg-primary text-primary-foreground font-semibold rounded-lg p-3 text-center"
                        >
                            {job}
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
