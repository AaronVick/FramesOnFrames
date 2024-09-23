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
      // Previous button
      frameIndex = frameIndex <= 0 ? frames.length - 1 : frameIndex - 1;
    } else if (buttonIndex === 3) {
      // Next button
      frameIndex = (frameIndex + 1) % frames.length;
    } else if (buttonIndex === 2 && frameIndex !== -1) {
      // Proxy mode: Fetch and embed the target frame's content
      const targetFrame = frames[frameIndex];
      const proxyResponse = await proxyFrame(targetFrame.url);
      if (proxyResponse) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(proxyResponse);
      }
      // If proxy fails, fall back to the main frame view
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
          <meta property="fc:frame:button:2" content="${frameIndex === -1 ? "Share" : currentFrame.name}" />
          <meta property="fc:frame:button:3" content="${frameIndex === -1 ? "" : "Next"}" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex.toString()}" />
    `;

    if (frameIndex === -1) {
      const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;
      html += `
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${shareLink}" />
      `;
    }

    html += `
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

async function proxyFrame(targetUrl) {
  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let html = await response.text();

    // Modify the HTML to update relative URLs to absolute URLs
    html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${targetUrl}/`);

    // Update the post_url to point back to our frame handler
    html = html.replace(
      /<meta property="fc:frame:post_url" content="[^"]*"/,
      `<meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/frame"`
    );

    return html;
  } catch (error) {
    console.error('Error proxying frame:', error);
    return null;
  }
}