import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [buscar, setBuscar]       = useState("");
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/auth/bitacora/",
      { withCredentials: true })
      .then(r => setRegistros(r.data))
      .catch(() => setMsg("❌ Error al cargar bitácora"));
  }, []);

  const filtrados = registros.filter(r =>
    r.usuario.toLowerCase().includes(buscar.toLowerCase()) ||
    r.accion.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1efe8" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: "#2c2c2a", marginBottom: 20 }}>
          📋 Bitácora de accesos
        </h1>

        {msg && <div style={{ padding: "9px 14px", background: "#ffebee",
          borderRadius: 8, marginBottom: 14, fontSize: 13,
          color: "#c62828" }}>{msg}</div>}

        <div style={{ background: "#fff", border: "1px solid #d3d1c7",
          borderRadius: 8, padding: "8px 12px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔍</span>
          <input placeholder="Buscar por usuario o acción..."
            value={buscar} onChange={e => setBuscar(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1,
              fontSize: 13, fontFamily: "inherit" }} />
        </div>

        <div style={{ background: "#fff", border: "1px solid #d3d1c7",
          borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9f9f7" }}>
                {["Fecha","Usuario","Acción","IP","Resultado","Detalle"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left",
                    color: "#888", fontWeight: 500, fontSize: 11,
                    borderBottom: "1px solid #d3d1c7" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 24,
                  textAlign: "center", color: "#888" }}>
                  No hay registros
                </td></tr>
              ) : filtrados.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1efe8",
                  background: i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                  <td style={{ padding: "9px 14px", color: "#555", fontSize: 12 }}>
                    {r.fecha}
                  </td>
                  <td style={{ padding: "9px 14px", fontWeight: 500 }}>
                    {r.usuario}
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, background: "#e3f2fd", color: "#0d47a1" }}>
                      {r.accion}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px", color: "#888", fontSize: 12 }}>
                    {r.ip || "—"}
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, fontWeight: 500,
                      background: r.exitoso ? "#e8f5e9" : "#ffebee",
                      color: r.exitoso ? "#1b5e20" : "#c62828" }}>
                      {r.exitoso ? "✓ Exitoso" : "✗ Fallido"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px", color: "#888", fontSize: 12 }}>
                    {r.detalle || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}