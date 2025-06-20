import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReportGenerator() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endpoint = '/api/generar-tracks';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(endpoint, { reportType: 'MLC' });
        console.log('🎯 Datos recibidos:', res.data);

        const receivedTracks = Array.isArray(res.data) ? res.data : [];

        // Filtra los que no han sido reportados
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🎧 Tracks a reportar</h2>

      {tracks.length === 0 ? (
        <p>No hay tracks para mostrar.</p>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">Track Title</th>
                <th className="p-3">Artist</th>
                <th className="p-3">UPC</th>
                <th className="p-3">ISRC</th>
                <th className="p-3">Composers</th>
                <th className="p-3">Release Date</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{track['Primary Title'] || 'Sin título'}</td>
                  <td className="p-3">{track['Track Artist Name'] || 'N/A'}</td>
                  <td className="p-3">{track.UPC || 'N/A'}</td>
                  <td className="p-3">{track.ISRC || 'N/A'}</td>
                  <td className="p-3">
                    {Array.isArray(track.Composers)
                      ? track.Composers.map((c) => `${c['First Name']} ${c['Last Name']}`).join(', ')
                      : 'N/A'}
                  </td>
                  <td className="p-3">{track['Digital Release Date'] || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}