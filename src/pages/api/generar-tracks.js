// /api/generar-tracks.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook/generar-tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await response.text(); // 👀 Captura el cuerpo incluso si no es JSON

    if (!response.ok) {
      console.error(`❌ Webhook error: ${response.status} - ${text}`);
      return res.status(500).json({
        error: `Webhook error: ${response.status}`,
        details: text,
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("⚠️ La respuesta del webhook no es JSON:", text);
      return res.status(500).json({
        error: 'Webhook returned non-JSON response',
        raw: text,
      });
    }

    console.log("✅ Datos del webhook recibidos:", data);
    return res.status(200).json(data);

  } catch (err) {
    console.error('❌ Error en la función API:', err.message);
    return res.status(500).json({
      error: 'Proxy failed',
      message: err.message,
    });
  }
}