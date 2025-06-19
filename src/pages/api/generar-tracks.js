export default async function handler(req, res) {
  console.log('✅ Endpoint reached');

  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    console.log('🧾 Request body:', body);

    return res.status(200).json({ message: 'Test OK', received: body });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}