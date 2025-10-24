export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId parameter', followers: 0 });
  }

  try {
    const robloxUrl = `https:/friends.roblox.com/v1/users/${userId}/followers/count`;
    const response = await fetch(robloxUrl);
    const data = await response.json();
    
    return res.status(200).json({ followers: data.count || 0 });
  } catch (error) {
    return res.status(500).json({ error: error.message, followers: 0 });
  }
}
