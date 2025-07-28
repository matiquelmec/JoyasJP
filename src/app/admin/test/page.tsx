"use client";

export default function AdminTest() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Panel Admin Funcionando!
      </h1>
      <p className="mt-4 text-lg">
        Si puedes ver esta página, el routing está funcionando correctamente.
      </p>
      <div className="mt-8 space-y-2">
        <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        <p><strong>URL:</strong> /admin/test</p>
        <p><strong>Estado:</strong> Funcionando ✓</p>
      </div>
    </div>
  );
}