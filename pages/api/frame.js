import { frames } from '../../utils/frameData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { untrustedData } = req.body;
  const buttonIndex = untrustedData?.buttonIndex;
  let frameIndex = parseInt(untrustedData?.state || '0', 10);

  if (buttonIndex === 1) {
    // Previous button pressed
    frameIndex = frameIndex === 0 ? frames.length - 1 : frameIndex - 1;
  } else if (buttonIndex === 3) {
    // Next button pressed
    frameIndex = (frameIndex + 1) % frames.length;
  }

 // Create the share link for the button
 const shareText = encodeURIComponent(currentFrame.sharetext);
 const shareLink = https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(currentFrame.url)};
  // Create the share link for the button
  const shareText = encodeURIComponent(`${currentFrame.sharetext} ${currentFrame.url}`);
  const shareLink = `https://warpcast.com/~/compose?text=${shareText}`;

  // Construct HTML with proper meta tags and share link setup
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
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${shareLink}" />
      </head>
      <body></body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
