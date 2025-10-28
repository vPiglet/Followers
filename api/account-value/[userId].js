module.exports = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required', accountValue: 0 });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    / Import fetch dynamically
    const fetch = (await import('node-fetch')).default;
    
    / Fetch from Rolimons API - player assets endpoint
    const url = `https:/www.rolimons.com/api/playerassets/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    const text = await response.text();
    
    / Try to parse JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
      return res.status(200).json({ accountValue: 0, userId: userId });
    }

    let totalValue = 0;

    / Check various possible response formats from Rolimons
    if (data) {
      if (data.total_rap) {
        totalValue = data.total_rap;
      } else if (data.totalRAP) {
        totalValue = data.totalRAP;
      } else if (data.rap) {
        totalValue = data.rap;
      }
    }

    return res.status(200).json({ 
      accountValue: totalValue,
      userId: userId 
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(200).json({ 
      accountValue: 0,
      userId: userId,
      error: error.message
    });
  }
};
