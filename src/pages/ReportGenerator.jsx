import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import axios from 'axios';

const REPORT_OPTIONS = [
  'All',
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
  const [reportType, setReportType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const endpoint = '/api/generar-tracks';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const typeToSend = reportType === 'All' ? 'MLC' : reportType;
        const res = await axios.post(endpoint, { reportType: typeToSend });

        const receivedTracks = Array.isArray(res.data) ? res.data : [];

        // Selecciona la columna de reporte correcta
        const reportColumn =
          reportType === 'All'
            ? 'Reportado MLC'
            : `Reportado ${reportType}`;

        const filtered = receivedTracks.filter(
          (t) => !t[reportColumn] || t[reportColumn].trim() === ''
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
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Inicia sesión primero");
    return;
  }

  const email = user.email || "";
  let name = "Usuario"; // Valor por defecto

  // 🔥 Obtenemos nombre desde Firestore
  try {
    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      if (userData.name) {
        name = userData.name;
      }
    }
  } catch (err) {
    console.warn("⚠️ No se pudo obtener el nombre desde Firestore:", err);
  }

  const tracksToReport = selectedTracks.map((i) => tracks[i]);
  setGenerating(true);

  const reportTypesToGenerate =
    reportType === '' ? ['MLC', 'Music Reports', 'ESong', 'SoundExchange'] : [reportType];

  try {
    for (const type of reportTypesToGenerate) {
      const response = await axios.post(
        'https://rigoletto.app.n8n.cloud/webhook/reportGeneratorWebhook',
        {
          user: { name, email },
          reportType: type,
          tracks: tracksToReport,
        }
      );
      console.log(`✅ Reporte ${type} generado exitosamente:`, response.data);
    }

    alert(
      `✅ Reporte${reportTypesToGenerate.length > 1 ? 's' : ''} generado${
        reportTypesToGenerate.length > 1 ? 's' : ''
      } exitosamente`
    );
  } catch (error) {
    console.error('❌ Error al generar el reporte:', error);
    alert('❌ Ocurrió un error al generar el reporte');
  } finally {
    setGenerating(false);
  }
};

 return (
  <div className="transition-colors duration-300 ease-in-out bg-white text-black dark:bg-gray-900 dark:text-white border dark:border-gray-700 p-4">
    <h2 className="text-xl font-semibold mb-4">🎧 Tracks a reportar</h2>

    {/* Dropdown + Button Row */}
    <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-4">
      <select
        className="border border-[--border] bg-[--input-bg] text-[--text] p-2 rounded w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-[--focus-ring] transition-colors duration-200"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        {REPORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <button
        className="bg-[--accent] text-[--bg] dark:text-white hover:bg-opacity-90 px-4 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-[--focus-ring]"
        disabled={selectedTracks.length === 0 || generating}
        onClick={handleGenerate}
      >
        {generating ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            {reportType === ''
              ? 'Generate All'
              : `Generate ${reportType} Reports`}
          </>
        )}
      </button>
    </div>
      

      {loading ? (
        <p>Loading...</p>
      ) : tracks.length === 0 ? (
        <p>No hay tracks para mostrar.</p>
      ) : (
        <table className="w-full text-sm text-left border border-[--border] bg-[--bg-card] text-[--text]">
  <thead className="bg-[--highlight] text-[--text]">
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
      <tr
        key={index}
        className="border-t border-[--border] hover:bg-[--details-bg] transition-colors"
      >
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
        <td className="p-3">{track.PRO || 'N/A'}</td>
        <td className="p-3">{track.IPI || 'N/A'}</td>
        <td className="p-3 whitespace-pre-line">
          {Array.isArray(track.Composers)
            ? track.Composers.map((c) => `${c['First Name']} ${c['Last Name']}-${c['PRO']}-${c['IPI']}`).join('\n')
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