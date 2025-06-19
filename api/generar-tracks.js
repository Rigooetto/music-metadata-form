export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reportType } = req.body;

    if (!reportType) {
      return res.status(400).json({ error: 'Missing reportType' });
    }

    // Puedes conectar con n8n o hacer lógica aquí
    // Por ejemplo, enviar al webhook de n8n:
    const response = await fetch('https://rigoletto.app.n8n.cloud/webhook/generar-tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Webhook error', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Error in /api/generar-tracks:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}