export default async function handler(req, res) {
  try {
    const response = await fetch("https://rigoletto.app.n8n.cloud/webhook-json/generar-tracks", {
      method: "POST", // O "GET" si fuera el caso
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Puedes cambiar "*" por "https://app.labelmind.ai" si quieres limitarlo solo a tu dominio
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error en proxy:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
}