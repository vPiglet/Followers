export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  / Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(
      `https:/inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100`,
      {
        headers: {
          'User-Agent': 'Roblox/WinInet',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Roblox API error: ${response.status} ${response.statusText}`);
      return res.status(200).json({ 
        accountValue: 0,
        userId: userId 
      });
    }

    const data = await response.json();
    let totalValue = 0;

    if (data && data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.recentAveragePrice && item.recentAveragePrice > 0) {
          totalValue += item.recentAveragePrice;
        }
      }
    }

    return res.status(200).json({ 
      accountValue: totalValue,
      userId: userId 
    });

  } catch (error) {
    console.error('Error fetching account value:', error);
    return res.status(200).json({ 
      accountValue: 0,
      userId: userId 
    });
  }
}
