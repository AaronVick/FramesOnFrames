import { useState } from 'react';
import Head from 'next/head';

const frames = [
  {
    name: "Empower Goal",
    img: "empower.png",  
    url: "https://empower-goal-tracker.vercel.app"
  },
  {
    name: "War - Card Game",
    img: "cardwar.png",
    url: "https://war-of-cards-seven.vercel.app"
  },
  {
    name: "Guess Who Said It",
    img: "guessQuote.png",
    url: "https://guess-the-quote-mauve.vercel.app"
  },
  {
    name: "Plot Twist - Guess the Movie",
    img: "plotTwist.png",
    url: "https://plot-twist-nine.vercel.app"
  },
  {
    name: "This Day in History",
    img: "onthisday.png",
    url: "https://time-capsule-jade.vercel.app"
  },
  {
    name: "Flowers Galore",
    img: "flower_flip_img.png",
    url: "https://flower-flip.vercel.app"
  },
  {
    name: "Dad Jokes",
    img: "dad_jokes.png",
    url: "https://dad-jokes-vert.vercel.app"
  },
  {
    name: "Your Daily Inspo",
    img: "zen.png",
    url: "https://daily-inspo.vercel.app"
  },
  {
    name: "Find Frens - Meme Channel",
    img: "success.png",
    url: "https://find-meme-frens.vercel.app"
  },
  {
    name: "Trivia Game",
    img: "trivia.png",
    url: "https://farcaster-trivia-one.vercel.app"
  },
  {
    name: "Fun Facts",
    img: "funfacts.png",
    url: "https://funfacts-xi.vercel.app"
  },
  {
    name: "Find Frens - Success Channel",
    img: "success.png",
    url: "https://success-omega.vercel.app"
  },
  {
    name: "Coindesk News",
    img: "coindeskrss.png",
    url: "https://coin-desk-news-frame.vercel.app"
  },
  {
    name: "AP News Headlines",
    img: "trending-news-placeholder.png",
    url: "https://ap-news.vercel.app"
  }
];

export default function FrameNavigator({ frameIndex = -1 }) {
  const baseUrl = 'https://frames-on-frames.vercel.app';

  const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;

  const currentFrame = frameIndex === -1 ? null : frames[frameIndex];

  return (
    <div>
      <Head>
        <title>Aaron's Frames</title>
        <meta name="description" content="Explore Farcaster frames created by @aaronv.eth" />
        <meta property="og:title" content="Aaron's Frames" />
        <meta property="og:description" content="Explore different interactive frames." />
        <meta property="og:image" content={`${baseUrl}/aarons_frames.png`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={
          frameIndex === -1
            ? `${baseUrl}/aarons_frames.png`
            : `${baseUrl}/${currentFrame.img}`
        } />
        <meta property="fc:frame:button:1" content={
          frameIndex === -1 ? "View Frames" : "Previous"
        } />
        <meta property="fc:frame:button:2" content={
          frameIndex === -1 ? "Share" : currentFrame ? currentFrame.name : ""
        } />
        <meta property="fc:frame:button:3" content={
          frameIndex === -1 ? "" : "Next"
        } />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/frame`} />
        <meta property="fc:frame:state" content={frameIndex.toString()} />
      </Head>
      
      <div style={{ textAlign: 'center', backgroundColor: '#121212', color: '#FFFFFF', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src={frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${baseUrl}/${currentFrame.img}`} 
          alt={frameIndex === -1 ? "Aaron's Frames" : currentFrame.name} 
          style={{ maxWidth: '80%', marginBottom: '20px' }} 
        />
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const frameIndex = parseInt(context.query.frameIndex || '-1');
  return { props: { frameIndex } };
}