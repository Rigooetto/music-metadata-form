export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 👇 puedes agregar logs aquí también
    console.log('📥 Recibido:', req.body);

    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook-test/getCatalogPending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}: ${text}`);
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
    console.error('❌ Error en API route:', err.message);
    return res.status(500).json({ error: 'Proxy failed', message: err.message });
  }
}