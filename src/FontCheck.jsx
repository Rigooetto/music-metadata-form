export default function FontCheck() {
  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--accent)]">🧪 Font Rendering Test</h1>

      <div>
        <p className="text-xl font-inter">
          Este texto usa LABELMIND LabelMind Ivan Sandoval<strong>Inter</strong> con Tailwind: <code>font-inter</code>
        </p>
      </div>

      <div>
        <p className="text-xl font-sans">
          Este texto usa LABELMIND LabelMind Ivan Sandoval<strong>sans-serif (fallback)</strong> con Tailwind: <code>font-sans</code>
        </p>
      </div>

      <div>
        <p className="text-xl font-ibm">
          Este texto usa LABELMIND LabelMind Ivan Sandoval<strong>IBM Plex Sans</strong> con Tailwind: <code>font-ibm</code>
        </p>
      </div>

      <div className="mt-8 text-sm text-muted">
        Si las tres líneas se ven diferentes entre sí, ¡tu configuración de fuentes funciona correctamente!
      </div>
    </div>
  );
}