module.exports = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fetch = (await import('node-fetch')).default;
    
    / Fetch from Rolimons API
    const response = await fetch(
      `https:/www.rolimons.com/api/playerassets/${userId}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json({ 
        accountValue: 0,
        userId: userId 
      });
    }

    const data = await response.json();
    let totalValue = 0;

    / Rolimons returns { success: true, total_rap: 12345, ... }
    if (data && data.success && data.total_rap) {
      totalValue = data.total_rap;
    }

    return res.status(200).json({ 
      accountValue: totalValue,
      userId: userId 
    });

  } catch (error) {
    console.error('Error fetching from Rolimons:', error);
    return res.status(200).json({ 
      accountValue: 0,
      userId: userId 
    });
  }
};
