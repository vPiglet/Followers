export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(200).json({ accountValue: 0 });
  }

  try {
    / Use the standard Roblox API with a simple proxy header
    const url = `https:/inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Roblox/WinInet',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ accountValue: 0 });
    }

    const data = await response.json();
    let totalRAP = 0;

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.recentAveragePrice) {
          totalRAP += item.recentAveragePrice;
        }
      }
    }

    return res.status(200).json({ accountValue: Math.floor(totalRAP) });

  } catch (error) {
    return res.status(200).json({ accountValue: 0 });
  }
}
