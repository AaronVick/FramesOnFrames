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
    let frameIndex = parseInt(untrustedData?.state || '-1');
    console.log('Current frameIndex:', frameIndex);
    
    if (buttonIndex === 1) {
      frameIndex = frameIndex === -1 ? frames.length - 1 : (frameIndex - 1 + frames.length) % frames.length;
    } else if (buttonIndex === 3) {
      frameIndex = frameIndex === -1 ? 0 : (frameIndex + 1) % frames.length;
    } else if (buttonIndex === 2 && frameIndex !== -1) {
      const targetFrame = frames[frameIndex];
      const frameResponse = await interactWithFrame(targetFrame);
      if (frameResponse) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(frameResponse);
      }
      // If interaction fails, fall back to the main frame view
    }

    console.log('New frameIndex:', frameIndex);

    const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
    const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${currentFrame.url}/${currentFrame.img}`;

    console.log('Image URL:', imageUrl);

    let html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="${frameIndex === -1 ? "View Frames" : "Previous"}" />
          <meta property="fc:frame:button:2" content="${frameIndex === -1 ? "Share" : "Enter " + currentFrame.name}" />
          <meta property="fc:frame:button:3" content="${frameIndex === -1 ? "" : "Next"}" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex.toString()}" />
        </head>
      </html>
    `;

    if (frameIndex === -1) {
      const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;
      html += `
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${shareLink}" />
      `;
    }

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

async function interactWithFrame(frame) {
  try {
    // First, fetch the frame's initial HTML
    const initialResponse = await fetch(frame.url);
    if (!initialResponse.ok) {
      throw new Error(`HTTP error! status: ${initialResponse.status}`);
    }
    let html = await initialResponse.text();

    // Extract the post_url from the HTML
    const postUrlMatch = html.match(/<meta property="fc:frame:post_url" content="([^"]*)">/);
    if (!postUrlMatch) {
      throw new Error("Couldn't find post_url in frame HTML");
    }
    const postUrl = postUrlMatch[1];

    // Extract the initial state from the HTML
    const stateMatch = html.match(/<meta property="fc:frame:state" content="([^"]*)">/);
    const initialState = stateMatch ? stateMatch[1] : '';

    // Simulate a POST request to the frame's API
    const apiResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        untrustedData: {
          buttonIndex: 1,
          state: initialState,
        },
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`API HTTP error! status: ${apiResponse.status}`);
    }

    // Return the HTML response from the frame's API
    return await apiResponse.text();
  } catch (error) {
    console.error('Error interacting with frame:', error);
    return null;
  }
}