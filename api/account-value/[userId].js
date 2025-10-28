export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter' });
  }

  try {
    let cursor = '';
    let totalRAP = 0;
    let pageCount = 0;
    const maxPages = 10;

    while (pageCount < maxPages) {
      const url = `https:/inventory.roproxy.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100${cursor ? `&cursor=${cursor}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          return res.status(200).json({ accountValue: -1 });
        }
        throw new Error(`RoProxy returned ${response.status}`);
      }

      const data = await response.json();

      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.recentAveragePrice) {
            totalRAP += item.recentAveragePrice;
          }
        }
      }

      if (!data.nextPageCursor) {
        break;
      }

      cursor = data.nextPageCursor;
      pageCount++;
    }

    return res.status(200).json({ accountValue: totalRAP });

  } catch (error) {
    console.error('Account value fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch account value', details: error.message });
  }
}
