import { frames } from '../../utils/frameData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frames-on-frames.vercel.app';
  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;

  let frameIndex = parseInt(untrustedData?.state || '-1');

  if (buttonIndex === 1) {
    frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
  } else if (buttonIndex === 3) {
    frameIndex = (frameIndex + 1) % frames.length;
  } else if (buttonIndex === 2 && frameIndex !== -1 && frameIndex < frames.length) {
    const targetUrl = frames[frameIndex].url;
    return res.redirect(302, targetUrl);
  }

  const currentFrame = frameIndex === -1 ? null : frames[frameIndex];
  const imageUrl = frameIndex === -1 ? `${baseUrl}/aarons_frames.png` : `${baseUrl}/${currentFrame.img}`;

  const html = `
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="fc:frame:button:1" content="${frameIndex === -1 ? 'View Frames' : 'Previous'}" />
        <meta property="fc:frame:button:2" content="${frameIndex === -1 ? 'Share' : currentFrame ? currentFrame.name : ''}" />
        <meta property="fc:frame:button:3" content="${frameIndex === -1 ? '' : 'Next'}" />
        <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
        <meta property="fc:frame:state" content="${frameIndex.toString()}" />
      </head>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
