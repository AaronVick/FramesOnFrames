import { useState } from 'react';
import Head from 'next/head';

const frames = [
  {
    name: "Empower Goal",
    img: "/empower.png",  
    url: "https://empower-goal-tracker.vercel.app"
  },
  {
    name: "War - Card Game",
    img: "/cardwar.png",
    url: "https://war-of-cards-seven.vercel.app"
  },
  {
    name: "Guess Who Said It",
    img: "/guessQuote.png",
    url: "https://guess-the-quote-mauve.vercel.app"
  },
  {
    name: "Plot Twist - Guess the Movie",
    img: "/plotTwist.png",
    url: "https://plot-twist-nine.vercel.app"
  },
  {
    name: "This Day in History",
    img: "/onthisday.png",
    url: "https://time-capsule-jade.vercel.app"
  },
  {
    name: "Flowers Galore",
    img: "/flower_flip_img.png",
    url: "https://flower-flip.vercel.app"
  },
  {
    name: "Dad Jokes",
    img: "/dad_jokes.png",
    url: "https://dad-jokes-vert.vercel.app"
  },
  {
    name: "Your Daily Inspo",
    img: "/zen.png",
    url: "https://daily-inspo.vercel.app"
  },
  {
    name: "Find Frens - Meme Channel",
    img: "/success.png",
    url: "https://find-meme-frens.vercel.app"
  },
  {
    name: "Trivia Game",
    img: "/rivia.png",
    url: "https://farcaster-trivia-one.vercel.app"
  },
  {
    name: "Fun Facts",
    img: "/funfacts.png",
    url: "https://funfacts-xi.vercel.app"
  },
  {
    name: "Find Frens - Success Channel",
    img: "/success.png",
    url: "https://success-omega.vercel.app"
  },
  {
    name: "Coindesk News",
    img: "/coindeskrss.png",
    url: "https://coin-desk-news-frame.vercel.app"
  },
  {
    name: "AP News Headlines",
    img: "/trending-news-placeholder.png",
    url: "https://ap-news.vercel.app"
  }
];

export default function FrameNavigator() {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(-1);  // Initialize with -1 for the opening screen

  const handleNext = () => {
    setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % frames.length);
  };

  const handlePrevious = () => {
    setCurrentFrameIndex((prevIndex) =>
      prevIndex === 0 ? frames.length - 1 : prevIndex - 1
    );
  };

  const handleVisitFrame = () => {
    window.location.href = frames[currentFrameIndex].url;
  };

  const handleShare = () => {
    const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
    const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent('https://your-vercel-url.com')}`;
    window.location.href = shareLink;
  };

  const baseUrl = 'https://your-vercel-url.com';

  return (
    <div>
      <Head>
        <title>Aaron's Frames</title>
        <meta name="description" content="Explore Farcaster frames created by @aaronv.eth" />
        <meta property="og:title" content="Aaron's Frames" />
        <meta property="og:description" content="Explore different interactive frames." />
        <meta property="og:image" content="/aarons_frames.png" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="/aarons_frames.png" />
        <meta property="fc:frame:button:1" content="View Frames" />
        <meta property="fc:frame:button:2" content="Share" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content={`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`} />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/frame`} />
      </Head>
      
      {currentFrameIndex === -1 ? (
        <div style={{ textAlign: 'center', backgroundColor: '#121212', color: '#FFFFFF', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/aarons_frames.png" alt="Aaron's Frames" style={{ maxWidth: '80%', marginBottom: '20px' }} />
          <div>
            <button onClick={() => setCurrentFrameIndex(0)} style={{ margin: '10px', padding: '10px', fontSize: '16px', cursor: 'pointer' }}>View Frames</button>
            <button onClick={handleShare} style={{ margin: '10px', padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Share</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', backgroundColor: '#121212', color: '#FFFFFF', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <img src={frames[currentFrameIndex].img} alt={frames[currentFrameIndex].name} style={{ maxWidth: '80%', marginBottom: '20px' }} />
          <div>
            <button onClick={handlePrevious} style={{ margin: '10px', padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Previous</button>
            <button onClick={handleVisitFrame} style={{ margin: '10px', padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Go to {frames[currentFrameIndex].name}</button>
            <button onClick={handleNext} style={{ margin: '10px', padding: '10px', fontSize: '16px', cursor: 'pointer' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
