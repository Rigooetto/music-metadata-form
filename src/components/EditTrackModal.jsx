// src/components/EditTrackModal.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function EditTrackModal({ track, onClose, onSave }) {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (track) {
      setFormData(track);
    }
  }, [track]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        action: "updateTrack",
        user: user?.displayName || user?.email,
        updatedAt: new Date().toISOString(),
        track: formData
      };

      const response = await fetch("https://api.n8n.labelmind.ai/updateCatalogTrack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Update failed");

      onClose();
      onSave();
    } catch (err) {
      console.error("Error updating track:", err);
    }
  };

  if (!track) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-4xl overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Edit Track Metadata</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Metadata General */}
          <input name="UPC" value={formData["UPC"] || ''} onChange={handleChange} placeholder="UPC" className="input" />
          <input name="Recording TITLE" value={formData["Recording TITLE"] || ''} onChange={handleChange} placeholder="Recording TITLE" className="input" />
          <input name="Recording ARTIST NAME" value={formData["Recording ARTIST NAME"] || ''} onChange={handleChange} placeholder="Recording ARTIST NAME" className="input" />
          <input name="Recording ISRC" value={formData["Recording ISRC"] || ''} onChange={handleChange} placeholder="Recording ISRC" className="input" />
          <input name="Work TITLE" value={formData["Work TITLE"] || ''} onChange={handleChange} placeholder="Work TITLE" className="input" />

          {/* Compositor */}
          <input name="PRIMARY WRITER" value={formData["PRIMARY WRITER"] || ''} onChange={handleChange} placeholder="PRIMARY WRITER" className="input" />
          <input name="WRITER IPI NUMBER" value={formData["WRITER IPI NUMBER"] || ''} onChange={handleChange} placeholder="WRITER IPI NUMBER" className="input" />
          <input name="WRITER ROLE CODE" value={formData["WRITER ROLE CODE"] || ''} onChange={handleChange} placeholder="WRITER ROLE CODE" className="input" />

          {/* Publisher */}
          <input name="PUBLISHER NAME" value={formData["PUBLISHER NAME"] || ''} onChange={handleChange} placeholder="PUBLISHER NAME" className="input" />
          <input name="PUBLISHER IPI NUMBER" value={formData["PUBLISHER IPI NUMBER"] || ''} onChange={handleChange} placeholder="PUBLISHER IPI NUMBER" className="input" />

          {/* Share */}
          <input name="COLLECTION SHARE" value={formData["COLLECTION SHARE"] || ''} onChange={handleChange} placeholder="COLLECTION SHARE" className="input" />

          {/* Estado de Reportes (opcional) */}
          <input name="Reportado MLC" value={formData["Reportado MLC"] || ''} onChange={handleChange} placeholder="Reportado MLC" className="input" />
          <input name="Reportado MR" value={formData["Reportado MR"] || ''} onChange={handleChange} placeholder="Reportado MR" className="input" />
          <input name="Reportado ISRC" value={formData["Reportado ISRC"] || ''} onChange={handleChange} placeholder="Reportado ISRC" className="input" />
          <input name="Reportado ESong" value={formData["Reportado ESong"] || ''} onChange={handleChange} placeholder="Reportado ESong" className="input" />

          {/* Control */}
          <input name="Validado" value={formData["Validado"] || ''} onChange={handleChange} placeholder="Validado" className="input" />
          <input name="Ultima Edicion" value={formData["Ultima Edicion"] || user?.email || ''} disabled className="input bg-gray-100" />
          <input name="Fecha Edicion" value={new Date().toISOString().split('T')[0]} disabled className="input bg-gray-100" />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}