import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReportGenerator = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reportType, setReportType] = useState('All Reports');

  const endpoint = '/api/generar-tracks';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(endpoint, {
          reportType: 'MLC',
        });

        console.log('🎯 Datos recibidos:', res.data);

        const receivedTracks = Array.isArray(res.data) ? res.data : [];

        const filtered = receivedTracks.filter(
          (t) => !t['Reportado MLC'] || t['Reportado MLC'].trim() === ''
        );

        setTracks(filtered);
        setSelectedTracks(filtered.map((_, index) => false));
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setSelectedTracks(tracks.map(() => newValue));
  };

  const toggleTrackSelection = (index) => {
    const updatedSelections = [...selectedTracks];
    updatedSelections[index] = !updatedSelections[index];
    setSelectedTracks(updatedSelections);
    setSelectAll(updatedSelections.every(Boolean));
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    // Aquí podrías filtrar `tracks` si decides hacer lógica por tipo
  };

  if (loading) return <p>🔄 Generando reporte, espera...</p>;
  if (error) return <p>❌ Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">🎧 Tracks a reportar</h2>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <label htmlFor="reportType" className="mr-2 font-medium">Tipo de reporte:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            className="border p-1 rounded"
          >
            <option>All Reports</option>
            <option>MLC</option>
            <option>Music Reports</option>
            <option>HFA</option>
            <option>Sound Exchange</option>
            <option>RegDig</option>
          </select>
        </div>

        <button
          onClick={toggleSelectAll}
          className="ml-4 bg-blue-600 text-white px-3 py-1 rounded"
        >
          {selectAll ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {tracks.length === 0 ? (
        <p>No hay tracks para mostrar.</p>
      ) : (
        <ul className="space-y-4">
          {tracks.map((track, index) => (
            <li key={index} className="border p-4 rounded bg-gray-50 shadow-sm">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={selectedTracks[index] || false}
                  onChange={() => toggleTrackSelection(index)}
                />
                <div>
                  <p><strong>{track['Primary Title'] || 'Sin título'}</strong></p>
                  <p>ISRC: {track.ISRC || 'N/A'}</p>
                  <p>UPC: {track.UPC || 'N/A'}</p>
                  {track.Composers && (
                    <div className="mt-1">
                      <p className="font-medium">Composers:</p>
                      {(() => {
                        try {
                          const composers = JSON.parse(track.Composers);
                          return composers.map((c, i) => (
                            <p key={i} className="text-sm">- {c['First Name']} {c['Middle Name']} {c['Last Name']} ({c.PRO})</p>
                          ));
                        } catch (e) {
                          return <p className="text-sm italic text-red-500">Formato inválido</p>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportGenerator;