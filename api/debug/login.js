// Vercel API endpoint for debug authentication
// Path: /api/debug/login

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    // Get debug password from environment variable
    const correctPassword = process.env.DEBUG_PASSWORD;

    if (!correctPassword) {
      console.error('DEBUG_PASSWORD environment variable not set');
      return res.status(500).json({ error: 'Debug not configured' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    if (password === correctPassword) {
      // Log successful authentication (without password)
      console.log('Debug access granted from IP:', req.headers['x-forwarded-for'] || req.connection.remoteAddress);
      
      return res.status(200).json({ 
        success: true,
        message: 'Debug access granted' 
      });
    } else {
      // Log failed attempt (without password)
      console.log('Debug access denied from IP:', req.headers['x-forwarded-for'] || req.connection.remoteAddress);
      
      return res.status(401).json({ 
        error: 'Invalid password' 
      });
    }
  } catch (error) {
    console.error('Debug login error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
