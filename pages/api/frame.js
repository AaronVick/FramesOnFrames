import { frames } from '../../utils/frameData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frames-on-frames.vercel.app';
  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;

  try {
    let frameIndex = parseInt(untrustedData?.state || '-1');
    console.log('Current frameIndex:', frameIndex);

    // Handle navigation between frames
    if (buttonIndex === 1) {  // Previous button
      frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
    } else if (buttonIndex === 3) {  // Next button
      frameIndex = (frameIndex + 1) % frames.length;
    } else if (buttonIndex === 2 && frameIndex >= 0 && frameIndex < frames.length) {  // Visit frame
      const targetUrl = frames[frameIndex].url;
      console.log('Redirecting to:', targetUrl);
      return res.redirect(302, targetUrl);
    }

    console.log('New frameIndex after button press:', frameIndex);

    // Catch out of bounds index
    if (frameIndex >= frames.length || frameIndex < 0) {
      console.error('Frame index out of bounds:', frameIndex);
      frameIndex = 0;  // Reset to 0
    }

    const currentFrame = frames[frameIndex];
    const imageUrl = `${baseUrl}/${currentFrame.img}`;

    console.log('Image URL:', imageUrl);

    const html = `
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageUrl}" />
          <meta property="fc:frame:button:1" content="Previous" />
          <meta property="fc:frame:button:2" content="${currentFrame.name}" />
          <meta property="fc:frame:button:3" content="Next" />
          <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
          <meta property="fc:frame:state" content="${frameIndex.toString()}" />
        </head>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error in frame handler:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
}
