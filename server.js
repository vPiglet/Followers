const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

/ Enable CORS for all origins (including Roblox)
app.use(cors());

/ Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Roblox Follower Proxy - ONLINE ✅',
    version: '1.0.0',
    endpoints: {
      followers: '/api/followers/:userId',
      example: '/api/followers/1'
    }
  });
});

/ Follower count endpoint
app.get('/api/followers/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  console.log('📥 Request for userId:', userId);
  
  / Validate userId
  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID'
    });
  }
  
  try {
    / Call Roblox Friends API
    const response = await axios.get(
      `https:/friends.roblox.com/v1/users/${userId}/followers/count`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    const followerCount = response.data.count;
    console.log('✅ Success! User', userId, 'has', followerCount, 'followers');
    
    res.json({
      success: true,
      userId: parseInt(userId),
      followerCount: followerCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    / Detailed error response
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Failed to fetch follower count',
      details: error.message,
      userId: parseInt(userId)
    });
  }
});

/ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

/ Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`🌐 Test at: http:/localhost:${PORT}/api/followers/1`);
});
