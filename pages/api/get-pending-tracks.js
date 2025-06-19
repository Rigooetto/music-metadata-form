export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook-test/getCatalogPending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), // { reportType: "MLC" }
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
  } catch (error) {
    console.error('[API ERROR]:', error);
    return res.status(500).json({
      error: 'Proxy failed',
      message: error.message,
    });
  }
}


