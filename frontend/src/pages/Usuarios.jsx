import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const G = { g8: "#0d3311", g5: "#268c2d", g1: "#d4f5d7", white: "#ffffff" };

const formVacio = {
  username: "", password: "", first_name: "", last_name: "",
  email: "", rol: "auxiliar", telefono: "", localidad: "", activo: true,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm]         = useState(formVacio);
  const [editId, setEditId]     = useState(null);
  const [modal, setModal]       = useState(false);
  const [msg, setMsg]           = useState("");
  const [buscar, setBuscar]     = useState("");

  const cargar = async () => {
    try {
      const r = await axios.get("http://127.0.0.1:8000/api/auth/usuarios/",
        { withCredentials: true });
      setUsuarios(r.data);
    } catch { setMsg("❌ Error al cargar usuarios"); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setForm(formVacio); setEditId(null); setModal(true); setMsg("");
  };

  const abrirEditar = (u) => {
    setForm({ ...u, password: "" });
    setEditId(u.id); setModal(true); setMsg("");
  };

  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(
          `http://127.0.0.1:8000/api/auth/usuarios/${editId}/`,
          form, { withCredentials: true });
        setMsg("✅ Usuario actualizado");
      } else {
        await axios.post("http://127.0.0.1:8000/api/auth/usuarios/",
          form, { withCredentials: true });
        setMsg("✅ Usuario creado");
      }
      setModal(false); cargar();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Error al guardar"));
    }
  };

  const filtrados = usuarios.filter(u =>
    u.username.toLowerCase().includes(buscar.toLowerCase()) ||
    (u.first_name + " " + u.last_name).toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1efe8" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: "#2c2c2a", margin: 0 }}>
            👥 Gestión de Usuarios
          </h1>
          <button onClick={abrirNuevo} style={{
            padding: "8px 16px", background: G.g5, border: "none",
            borderRadius: 8, color: G.white, cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", fontWeight: 500,
          }}>+ Nuevo usuario</button>
        </div>

        {msg && <div style={{ padding: "9px 14px", background: "#e8f5e9",
          border: "1px solid #a5d6a7", borderRadius: 8, marginBottom: 14,
          fontSize: 13, color: "#1b5e20" }}>{msg}</div>}

        <div style={{ background: G.white, border: "1px solid #d3d1c7",
          borderRadius: 8, padding: "8px 12px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 8 }}>
          <span>🔍</span>
          <input placeholder="Buscar usuario..."
            value={buscar} onChange={e => setBuscar(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1,
              fontSize: 13, fontFamily: "inherit" }} />
        </div>

        <div style={{ background: G.white, border: "1px solid #d3d1c7",
          borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9f9f7" }}>
                {["Usuario","Nombre completo","Rol","Localidad","Estado","Acciones"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left",
                    color: "#888", fontWeight: 500, fontSize: 11,
                    borderBottom: "1px solid #d3d1c7" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f1efe8",
                  background: i % 2 === 0 ? G.white : "#fafaf8" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                    {u.username}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {u.first_name} {u.last_name}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, fontWeight: 500,
                      background: u.rol === "admin" ? "#e8f5e9" : "#e3f2fd",
                      color: u.rol === "admin" ? "#1b5e20" : "#0d47a1" }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888" }}>
                    {u.localidad || "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20,
                      fontSize: 11, fontWeight: 500,
                      background: u.activo ? "#e8f5e9" : "#ffebee",
                      color: u.activo ? "#1b5e20" : "#c62828" }}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => abrirEditar(u)}
                      style={{ padding: "4px 10px", background: "transparent",
                        border: "1px solid #d3d1c7", borderRadius: 6,
                        cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {modal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100 }}>
            <div style={{ background: G.white, borderRadius: 12, padding: 24,
              width: 420, maxHeight: "90vh", overflowY: "auto" }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: G.g8 }}>
                {editId ? "✏️ Editar usuario" : "➕ Nuevo usuario"}
              </h2>

              {[
                ["Usuario",   "username",   "text",  !editId],
                ["Contraseña", "password",  "password", true],
                ["Nombre",    "first_name", "text",  true],
                ["Apellido",  "last_name",  "text",  true],
                ["Correo",    "email",      "email", true],
                ["Teléfono",  "telefono",   "text",  true],
                ["Localidad", "localidad",  "text",  true],
              ].map(([label, field, type, show]) => show && (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11,
                    color: "#666", marginBottom: 3 }}>
                    {label}{field === "password" && editId ? " (dejar vacío para no cambiar)" : ""}
                  </label>
                  <input type={type} value={form[field] || ""}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px",
                      border: "1px solid #d3d1c7", borderRadius: 7,
                      fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }} />
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, color: "#666", marginBottom: 3 }}>
                  Rol
                </label>
                <select value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    fontSize: 13, fontFamily: "inherit" }}>
                  <option value="admin">Administrador</option>
                  <option value="tecnico">Técnico de campo</option>
                  <option value="auxiliar">Auxiliar</option>
                </select>
              </div>

              {editId && (
                <div style={{ marginBottom: 14, display: "flex",
                  alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={form.activo}
                    onChange={e => setForm({ ...form, activo: e.target.checked })}
                    id="activo" />
                  <label htmlFor="activo" style={{ fontSize: 13, color: "#555" }}>
                    Usuario activo
                  </label>
                </div>
              )}

              {msg && <div style={{ padding: "7px 12px", background: "#ffebee",
                border: "1px solid #ef9a9a", borderRadius: 7, marginBottom: 12,
                fontSize: 12, color: "#c62828" }}>{msg}</div>}

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setModal(false)}
                  style={{ padding: "8px 16px", background: "transparent",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
                <button onClick={guardar}
                  style={{ padding: "8px 16px", background: G.g5,
                    border: "none", borderRadius: 7, color: G.white,
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  {editId ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}