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

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { untrustedData } = req.body;
    const buttonIndex = untrustedData?.buttonIndex;
    let frameIndex = parseInt(untrustedData?.state || '-1');
    
    if (buttonIndex === 1) {
      if (frameIndex === -1) {
        frameIndex = 0;
      } else {
        frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
      }
    } else if (buttonIndex === 3) {
      frameIndex = (frameIndex + 1) % frames.length;
    } else if (buttonIndex === 2 && frameIndex !== -1) {
      return res.status(302).setHeader('Location', frames[frameIndex].url).end();
    }

    const baseUrl = 'https://frames-on-frames.vercel.app';
    const currentFrame = frameIndex === -1 ? null : frames[frameIndex];

    const frameMetadata = {
      version: 'vNext',
      image: frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${baseUrl}/${currentFrame.img}`,
      buttons: [
        { label: frameIndex === -1 ? "View Frames" : "Previous" },
        { label: frameIndex === -1 ? "Share" : (currentFrame ? currentFrame.name : "") },
        { label: frameIndex === -1 ? "" : "Next" }
      ],
      postUrl: `${baseUrl}/api/frame`,
      state: frameIndex.toString()
    };

    res.status(200).json({
      flags: ["FULL_FRAME"],
      frame: frameMetadata
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}