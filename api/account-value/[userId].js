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
    / Rolimons player API endpoint
    const url = `https:/www.rolimons.com/player/${userId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = await response.text();
    
    / Parse RAP value from HTML using regex
    / Look for patterns like "total_rap_value":[number] or similar
    const rapMatch = html.match(/"total_rap[^:]*":(\d+)/i) || 
                     html.match(/total[_\s]*rap[^:]*[:=]\s*(\d+)/i) ||
                     html.match(/rap[^:]*[:=]\s*(\d+)/i);
    
    let totalValue = 0;
    
    if (rapMatch && rapMatch[1]) {
      totalValue = parseInt(rapMatch[1]);
    }

    return res.status(200).json({ 
      accountValue: totalValue,
      userId: userId,
      found: totalValue > 0
    });

  } catch (error) {
    return res.status(200).json({ 
      accountValue: 0,
      userId: userId,
      error: 'fetch failed'
    });
  }
}
