export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(200).json({ accountValue: 0, userId: null });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = `https:/www.rolimons.com/api/playerassets/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ accountValue: 0, userId: userId });
    }

    const data = await response.json();
    let totalValue = 0;

    if (data && data.total_rap) {
      totalValue = data.total_rap;
    }

    return res.status(200).json({ 
      accountValue: totalValue,
      userId: userId 
    });

  } catch (error) {
    return res.status(200).json({ 
      accountValue: 0,
      userId: userId
    });
  }
}
