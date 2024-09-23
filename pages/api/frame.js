import { frames } from '../../utils/frameData';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frames-on-frames.vercel.app';
  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;
  
  console.log('Received POST request:', JSON.stringify({ untrustedData, buttonIndex }, null, 2));

  try {
    let frameIndex = parseInt(untrustedData?.state?.split(',')[0] || '-1');
    let isInFrame = untrustedData?.state?.split(',')[1] === 'inframe';
    console.log('Current frameIndex:', frameIndex, 'Is in frame:', isInFrame);
    
    if (frameIndex === -1) {
      // Main frame logic
      if (buttonIndex === 1) {
        frameIndex = 0; // Start viewing frames
      } else if (buttonIndex === 2) {
        // Share logic (unchanged)
        const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
        const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;
        res.writeHead(302, { Location: shareLink });
        return res.end();
      }
    } else if (!isInFrame) {
      // Frame selection view
      if (buttonIndex === 1) {
        // Previous button
        frameIndex = frameIndex <= 0 ? frames.length - 1 : frameIndex - 1;
      } else if (buttonIndex === 2) {
        // Enter the selected frame
        isInFrame = true;
      } else if (buttonIndex === 3) {
        // Next button
        frameIndex = (frameIndex + 1) % frames.length;
      }
    } else {
      // We're in a frame, handle "Back to Frames" option
      if (buttonIndex === 1) {
        // Go back to frame selection
        isInFrame = false;
      } else {
        // Redirect to the actual frame
        const redirectUrl = frames[frameIndex].url;
        console.log('Redirecting to:', redirectUrl);
        res.writeHead(302, { Location: redirectUrl });
        res.end();
        return;
      }
    }

    // Render main frame, frame selection view, or frame entry point
    const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
    const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${currentFrame.url}/${currentFrame.img}`;

    let html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
    `;

    if (frameIndex === -1) {
      // Main view
      html += `
          <meta property="fc:frame:button:1" content="View Frames" />
          <meta property="fc:frame:button:2" content="Share" />
      `;
    } else if (!isInFrame) {
      // Frame selection view
      html += `
          <meta property="fc:frame:button:1" content="Previous" />
          <meta property="fc:frame:button:2" content="Enter ${currentFrame.name}" />
          <meta property="fc:frame:button:3" content="Next" />
      `;
    } else {
      // Frame entry point
      html += `
          <meta property="fc:frame:button:1" content="Back to Frames" />
          <meta property="fc:frame:button:2" content="Enter ${currentFrame.name}" />
      `;
    }

    html += `
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex},${isInFrame ? 'inframe' : ''}" />
        </head>
      </html>
    `;

    console.log('Sending HTML response:', html);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error in frame handler:', error);
    const errorHtml = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${baseUrl}/error.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
        </head>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(errorHtml);
  }
}