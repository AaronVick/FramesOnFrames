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
    let innerState = untrustedData?.state?.split(',')[1] || '';
    console.log('Current frameIndex:', frameIndex, 'Inner state:', innerState);
    
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
    } else {
      // Proxy mode
      const currentFrame = frames[frameIndex];
      if (buttonIndex === 1 && !innerState) {
        // Previous button (only if not in an inner frame state)
        frameIndex = frameIndex <= 0 ? frames.length - 1 : frameIndex - 1;
        innerState = '';
      } else if (buttonIndex === 3 && !innerState) {
        // Next button (only if not in an inner frame state)
        frameIndex = (frameIndex + 1) % frames.length;
        innerState = '';
      } else {
        // Handle inner frame interaction
        const proxyResponse = await proxyFrameInteraction(currentFrame.url, buttonIndex, innerState);
        if (proxyResponse) {
          const modifiedHtml = modifyProxiedHtml(proxyResponse, frameIndex, baseUrl);
          res.setHeader('Content-Type', 'text/html');
          return res.status(200).send(modifiedHtml);
        }
      }
    }

    // Render main frame or frame selection view
    const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
    const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${currentFrame.url}/${currentFrame.img}`;

    let html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="${frameIndex === -1 ? "View Frames" : "Previous"}" />
          <meta property="fc:frame:button:2" content="${frameIndex === -1 ? "Share" : currentFrame.name}" />
          <meta property="fc:frame:button:3" content="${frameIndex === -1 ? "" : "Next"}" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex},${innerState}" />
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

async function proxyFrameInteraction(targetUrl, buttonIndex, state) {
  try {
    const response = await fetch(`${targetUrl}/api/frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        untrustedData: { buttonIndex, state }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error proxying frame interaction:', error);
    return null;
  }
}

function modifyProxiedHtml(html, frameIndex, baseUrl) {
  // Update the post_url to point back to our frame handler
  html = html.replace(
    /<meta property="fc:frame:post_url" content="[^"]*"/,
    `<meta property="fc:frame:post_url" content="${baseUrl}/api/frame"`
  );

  // Modify the state to include our frame index
  html = html.replace(
    /<meta property="fc:frame:state" content="([^"]*)"/,
    `<meta property="fc:frame:state" content="${frameIndex},$1"`
  );

  return html;
}