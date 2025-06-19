// pages/api/generar-tracks.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('✅ API handler triggered');
    const { reportType } = req.body;
    console.log('📦 reportType recibido:', reportType);

    // Solo para prueba: responde con mensaje de éxito
    return res.status(200).json({
      message: 'API funcionando correctamente',
      received: reportType,
    });
  } catch (error) {
    console.error('❌ Error en el handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}