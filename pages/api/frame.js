import { frames } from '../../utils/frameData';

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
      if (frameIndex === -1) {
        frameIndex = 0;
      } else {
        frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
      }
    } else if (buttonIndex === 3) {
      frameIndex = (frameIndex + 1) % frames.length;
    } else if (buttonIndex === 2 && frameIndex !== -1) {
      // Redirect to our intermediate page
      const redirectUrl = `${baseUrl}/redirect?index=${frameIndex}`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(302, redirectUrl);
      return;
    }

    console.log('New frameIndex:', frameIndex);

    if (frameIndex >= frames.length) {
      console.error('Frame index out of bounds:', frameIndex);
      frameIndex = 0;
    }

    const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
    const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${currentFrame.url}/${currentFrame.img}`;

    console.log('Image URL:', imageUrl);

    let html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="${frameIndex === -1 ? "View Frames" : "Previous"}" />
    `;

    if (frameIndex === -1) {
      const shareText = encodeURIComponent(`Check out the frames built by @aaronv.eth`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(baseUrl)}`;
      html += `
          <meta property="fc:frame:button:2" content="Share" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${shareLink}" />
      `;
    } else {
      html += `
          <meta property="fc:frame:button:2" content="${currentFrame.name}" />
      `;
    }

    html += `
          <meta property="fc:frame:button:3" content="${frameIndex === -1 ? "" : "Next"}" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex.toString()}" />
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