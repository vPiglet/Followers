export default async function handler(req, res) {
  / CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  / Get userId from dynamic route
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ 
      error: 'Missing userId parameter',
      accountValue: 0 
    });
  }

  try {
    let cursor = '';
    let totalRAP = 0;
    let pageCount = 0;
    const maxPages = 10;

    / Fetch collectibles using RoProxy
    while (pageCount < maxPages) {
      const url = `https:/inventory.roproxy.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100${cursor ? `&cursor=${cursor}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        / Inventory is private or user doesn't exist
        if (response.status === 400 || response.status === 403) {
          return res.status(200).json({ accountValue: 0 });
        }
        throw new Error(`RoProxy API error: ${response.status}`);
      }

      const data = await response.json();

      / Sum up RAP from all collectible items
      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          if (item.recentAveragePrice && item.recentAveragePrice > 0) {
            totalRAP += item.recentAveragePrice;
          }
        }
      }

      / Check if there are more pages
      if (!data.nextPageCursor) {
        break;
      }

      cursor = data.nextPageCursor;
      pageCount++;
    }

    / Return the total account value
    return res.status(200).json({ 
      accountValue: Math.floor(totalRAP),
      success: true
    });

  } catch (error) {
    console.error('Account value error:', error.message);
    return res.status(200).json({ 
      accountValue: 0,
      error: error.message 
    });
  }
}
