// pages/api/generar-tracks.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    console.log('✅ API /api/generar-tracks triggered');

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook-test/getCatalogPending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(`❌ Webhook error: ${response.status}`, text);
      return res.status(response.status).json({ error: `Webhook failed`, raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("⚠️ La respuesta no era JSON:", text);
      return res.status(500).json({ error: "Webhook returned non-JSON response", raw: text });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('❌ Error en API handler:', err.message);
    return res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}