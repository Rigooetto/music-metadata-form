import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import EditTrackModal from '../components/EditTrackModal';

export default function CatalogPage() {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'CatalogDB'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTracks(data);
      setFilteredTracks(data);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = tracks.filter(
      (track) =>
        track['Recording TITLE']?.toLowerCase().includes(term) ||
        track['Recording ISRC']?.toLowerCase().includes(term) ||
        track['UPC']?.toLowerCase().includes(term)
    );
    setFilteredTracks(filtered);
  }, [search, tracks]);

  const handleEdit = (track) => {
    setSelectedTrack(track);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Catalog</h2>

      <input
        type="text"
        placeholder="Search by Title, ISRC or UPC"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">ISRC</th>
              <th className="p-2 border">UPC</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map((track) => (
              <tr key={track.id} className="border-t">
                <td className="p-2 border">{track['Recording TITLE']}</td>
                <td className="p-2 border">{track['Recording ISRC']}</td>
                <td className="p-2 border">{track['UPC']}</td>
                <td className="p-2 border">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => handleEdit(track)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedTrack && (
        <EditTrackModal
          track={selectedTrack}
          onClose={() => setModalOpen(false)}
          onSave={fetchCatalog}
        />
      )}
    </div>
  );
}