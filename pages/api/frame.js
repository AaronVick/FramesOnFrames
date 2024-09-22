export default function handler(req, res) {
    if (req.method === 'POST') {
      const { untrustedData } = req.body;
      const buttonIndex = untrustedData.buttonIndex;
      const currentFrameIndex = parseInt(untrustedData.inputText || '-1');
      
      let newIndex;
      if (buttonIndex === 1) {
        newIndex = currentFrameIndex === -1 ? 0 : getPreviousIndex(currentFrameIndex);
      } else if (buttonIndex === 3) {
        newIndex = getNextIndex(currentFrameIndex);
      } else {
        newIndex = currentFrameIndex;
      }
  
      res.status(200).json({
        frameIndex: newIndex,
      });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  
  function getNextIndex(current) {
    return (current + 1) % frames.length;
  }
  
  function getPreviousIndex(current) {
    return (current === 0 ? frames.length - 1 : current - 1);
  }