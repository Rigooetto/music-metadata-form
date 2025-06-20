import React, { useEffect, useState } from 'react';
import axios from 'axios';

const REPORT_OPTIONS = [
  'All Reports',
  'MLC',
  'Music Reports',
  'HFA',
  'Sound Exchange',
  'RegDig',
];

export default function ReportGenerator() {
  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(true);

  const endpoint = '/api/generar-tracks';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(endpoint, { reportType });
        const receivedTracks = Array.isArray(res.data) ? res.data : [];

        const filtered = receivedTracks.filter(
          (t) => !t['Reportado MLC'] || t['Reportado MLC'].trim() === ''
        );

        setTracks(filtered);
        setSelectedTracks([]);
        setSelectAll(false);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType]);

  const toggleTrack = (index) => {
    if (selectedTracks.includes(index)) {
      setSelectedTracks(selectedTracks.filter((i) => i !== index));
      setSelectAll(false);
    } else {
      setSelectedTracks([...selectedTracks, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
      setSelectAll(false);
    } else {
      setSelectedTracks(tracks.map((_, index) => index));
      setSelectAll(true);
    }
  };

  const handleGenerate = async () => {
  const tracksToReport = selectedTracks.map((i) => tracks[i]);

  try {
    const response = await axios.post(
      'https://rigoletto.app.n8n.cloud/webhook/reportGeneratorWebhook',
      {
        reportType,
        tracks: tracksToReport,
      }
    );

    console.log('✅ Reporte enviado exitosamente:', response.data);
    alert('✅ Reporte generado exitosamente');
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error);
    alert('❌ Ocurrió un error al generar el reporte');
  }
};

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          {REPORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt === 'All Reports' ? '' : opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={selectedTracks.length === 0}
          onClick={handleGenerate}
        >
          Generate Report
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tracks.length === 0 ? (
        <p>No hay tracks para mostrar.</p>
      ) : (
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 font-semibold">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3">Track Title</th>
              <th className="p-3">Artist</th>
              <th className="p-3">UPC</th>
              <th className="p-3">ISRC</th>
              <th className="p-3">Composers</th>
              <th className="p-3">Release Date</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(index)}
                    onChange={() => toggleTrack(index)}
                  />
                </td>
                <td className="p-3">{track['Primary Title'] || 'Sin título'}</td>
                <td className="p-3">{track['Track Artist Name'] || 'N/A'}</td>
                <td className="p-3">{track.UPC || 'N/A'}</td>
                <td className="p-3">{track.ISRC || 'N/A'}</td>
                <td className="p-3 whitespace-pre-line">
  {Array.isArray(track.Composers)
    ? track.Composers.map((c) => `${c['First Name']} ${c['Last Name']}`).join('\n')
    : typeof track.Composers === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(track.Composers);
          return parsed.map((c) => `${c['First Name']} ${c['Last Name']}`).join('\n');
        } catch {
          return 'N/A';
        }
      })()
    : 'N/A'}
</td>
                <td className="p-3">{track['Digital Release Date'] || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}