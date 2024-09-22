import { frames } from '../../utils/frameData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frames-on-frames.vercel.app';
  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;

  let frameIndex = parseInt(untrustedData?.state || '-1');

  // Navigate between frames
  if (buttonIndex === 1) {  // Previous button
    frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
  } else if (buttonIndex === 3) {  // Next button
    frameIndex = (frameIndex + 1) % frames.length;
  } else if (buttonIndex === 2 && frameIndex >= 0 && frameIndex < frames.length) {  // Visit frame
    const targetUrl = frames[frameIndex].url;
    return res.redirect(302, targetUrl);  // Properly handle frame redirection
  }

  const currentFrame = frameIndex >= 0 && frameIndex < frames.length ? frames[frameIndex] : frames[0];
  const imageUrl = `${baseUrl}/${currentFrame.img}`;

  const html = `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="Previous" />
        <meta property="fc:frame:button:2" content="${currentFrame.name}" />
        <meta property="fc:frame:button:3" content="Next" />
        <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
        <meta property="fc:frame:state" content="${frameIndex}" />
      </head>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
