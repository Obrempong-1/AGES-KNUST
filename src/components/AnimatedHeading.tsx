
import { useRef, useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  underlineClassName?: string;
}

const AnimatedHeading = ({ children, className, underlineClassName }: AnimatedHeadingProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const headingElement = headingRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (headingElement) {
      observer.observe(headingElement);
    }

    return () => {
      if (headingElement) {
        observer.unobserve(headingElement);
      }
    };
  }, []);

  return (
    <div ref={headingRef} className="text-center mb-16">
      <h2 className={`text-5xl md:text-6xl font-bold mb-4 transition-all duration-1000 ${className}`}>
        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-fade-in">
          {children}
        </span>
      </h2>
      <div
        className={`h-1 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 delay-200 ${underlineClassName} ${
          isVisible ? 'w-32' : 'w-0'
        }`}
      ></div>
    </div>
  );
};

export default AnimatedHeading;
