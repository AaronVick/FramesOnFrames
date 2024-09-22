import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { frames } from '../utils/frameData';

export default function Redirect() {
  const router = useRouter();
  const { index } = router.query;

  useEffect(() => {
    if (index !== undefined) {
      const frameIndex = parseInt(index);
      if (frameIndex >= 0 && frameIndex < frames.length) {
        window.location.href = frames[frameIndex].url;
      } else {
        // Redirect back to the main page if the index is invalid
        window.location.href = '/';
      }
    }
  }, [index]);

  return <div>Redirecting...</div>;
}