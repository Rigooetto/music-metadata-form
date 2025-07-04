export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { isrc, value } = req.body;

  if (!isrc || typeof value === 'undefined') {
    return res.status(400).json({ error: 'Missing ISRC or value' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook/updateRegisteredPro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isrc, registeredPro: value }),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Webhook call failed',
        status: response.status,
        body: text,
      });
    }

    return res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('❌ Error in update-reported-pro:', error.message);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}