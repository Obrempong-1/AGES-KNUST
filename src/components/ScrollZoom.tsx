
import { useRef, useEffect, useState } from 'react';

interface ScrollZoomProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ScrollZoom = ({ children, className, delay = 0 }: ScrollZoomProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
                setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } 
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`${className} transform transition-all duration-700 ease-out ${
        isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      }`}
    >
      {children}
    </div>
  );
};

export default ScrollZoom;
