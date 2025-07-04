export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Body recibido:', req.body);
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook/getCatalogPending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Webhook call failed',
        status: response.status,
        body: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: 'Invalid JSON from webhook',
        raw: text,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error en API route:', err.message);
    return res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}