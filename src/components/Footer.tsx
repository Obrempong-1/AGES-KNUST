import { Link } from "react-router-dom";
import { Linkedin, Facebook, Instagram, Twitter, Send } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import agesLogo from "@/assets/ages-logo.jpg";

const Footer = () => {
  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/company/ages", color: "hover:text-[#0077B5]" },
    { name: "TikTok", icon: FaTiktok, url: "https://tiktok.com/@ages", color: "hover:text-[#000000]" },
    { name: "Facebook", icon: Facebook, url: "https://facebook.com/ages", color: "hover:text-[#1877F2]" },
    { name: "Instagram", icon: Instagram, url: "https://instagram.com/ages", color: "hover:text-[#E4405F]" },
    { name: "Twitter", icon: Twitter, url: "https://twitter.com/ages", color: "hover:text-[#1DA1F2]" },
    { name: "Telegram", icon: Send, url: "https://t.me/ages", color: "hover:text-[#0088cc]" },
  ];

  return (
    <footer className="bg-gradient-to-br from-card via-background to-muted border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={agesLogo} alt="AGES Logo" className="h-20 w-20 object-contain rounded-full shadow-lg hover:scale-110 transition-transform duration-300" />
            <div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                AGES
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Association of Geomatic Engineering Students
              </p>
            </div>
          </div>

          
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-bold mb-4 text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-center">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                Home
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                About Us
              </Link>
              <Link to="/executives" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                Executives
              </Link>
              <Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                Gallery
              </Link>
              <Link to="/news-events" className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                News & Events
              </Link>
            </nav>
          </div>

          
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-bold mb-4 text-foreground">Connect With Us</h4>
            <div className="flex gap-4 flex-wrap justify-center md:justify-end">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 bg-muted rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        
        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Association of Geomatic Engineering Students. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
