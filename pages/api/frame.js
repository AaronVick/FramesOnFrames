import { frames } from '../../utils/frameData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;
  let frameIndex = parseInt(untrustedData?.state || '0', 10);  // Start from index 0 by default

  // Handle navigation
  if (buttonIndex === 1) {
    frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;  // Previous
  } else if (buttonIndex === 3) {
    frameIndex = (frameIndex + 1) % frames.length;  // Next
  } else if (buttonIndex === 2 && frameIndex !== -1) {
    // Share link
    const shareText = encodeURIComponent(frames[frameIndex].sharetext);
    const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(frames[frameIndex].url)}`;
    return res.redirect(302, shareLink);
  }

  const currentFrame = frames[frameIndex];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frames-on-frames.vercel.app';

  // Ensure proper formatting of image URL
  const imageUrl = `${currentFrame.url.replace(/\/$/, '')}/${currentFrame.img.replace(/^\//, '')}`;

  const html = `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="Previous" />
        <meta property="fc:frame:button:2" content="Share ${currentFrame.name}" />
        <meta property="fc:frame:button:3" content="Next" />
        <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
        <meta property="fc:frame:state" content="${frameIndex}" />
      </head>
      <body></body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
