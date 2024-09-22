import Head from 'next/head';
import { frames } from '../utils/frameData';

export default function FrameNavigator({ frameIndex = -1 }) {
  const baseUrl = 'https://frames-on-frames.vercel.app';

  const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;

  const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
  const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${currentFrame.url}/${currentFrame.img}`;

  return (
    <div>
      <Head>
        <title>Aaron's Frames</title>
        <meta name="description" content="Explore Farcaster frames created by @aaronv.eth" />
        <meta property="og:title" content="Aaron's Frames" />
        <meta property="og:description" content="Explore different interactive frames." />
        <meta property="og:image" content={`${baseUrl}/aarons_frames.png`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={imageUrl} />
        <meta property="fc:frame:button:1" content={frameIndex === -1 ? "View Frames" : "Previous"} />
        <meta property="fc:frame:button:2" content={frameIndex === -1 ? "Share" : currentFrame ? currentFrame.name : ""} />
        <meta property="fc:frame:button:3" content={frameIndex === -1 ? "" : "Next"} />
        <meta property="fc:frame:post_url" content={`${baseUrl}/api/frame`} />
        <meta property="fc:frame:state" content={frameIndex.toString()} />
        {frameIndex === -1 && (
          <>
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content={shareLink} />
          </>
        )}
      </Head>
      
      <div style={{ textAlign: 'center', backgroundColor: '#121212', color: '#FFFFFF', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src={imageUrl}
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