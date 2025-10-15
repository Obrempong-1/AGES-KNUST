import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const useContent = (page: string, section?: string) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const contentRef = collection(db, 'content_blocks');
      let contentQuery = query(contentRef, where('page', '==', page));
      if (section) {
        contentQuery = query(contentQuery, where('section', '==', section));
      }

      try {
        const querySnapshot = await getDocs(contentQuery);
        const contentData: Record<string, string> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.published) {
            contentData[data.key] = data.content;
          }
        });
        setContent(contentData);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [page, section]);

  return { content, loading };
};

export default useContent;