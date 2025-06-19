import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReportGenerator = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endpoint = '/api/generar-tracks'; // Se llama a la ruta interna de Vercel

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(endpoint, {
          reportType: 'MLC',
        });

        console.log('🎯 Datos recibidos:', res.data);

        const receivedTracks = res.data?.tracks || [];

        if (!Array.isArray(receivedTracks)) {
          throw new Error('Formato de tracks inválido');
        }

        // Filtro para evitar mostrar los que ya fueron reportados
        const filtered = receivedTracks.filter(
          (t) => !t['Reportado MLC'] || t['Reportado MLC'].trim() === ''
        );

        setTracks(filtered);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>🔄 Generando reporte, espera...</p>;
  if (error) return <p>❌ Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">🎧 Tracks a reportar</h2>

      {tracks.length === 0 ? (
        <p>No hay tracks para mostrar.</p>
      ) : (
        <ul className="space-y-2">
          {tracks.map((track, index) => (
            <li key={index} className="border p-3 rounded bg-gray-100 shadow-sm">
              <strong>{track['Primary Title'] || 'Sin título'}</strong><br />
              ISRC: {track.ISRC || 'N/A'}<br />
              UPC: {track.UPC || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportGenerator;