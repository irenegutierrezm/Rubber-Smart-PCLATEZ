import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const G = { g8: "#0d3311", g5: "#268c2d", g1: "#d4f5d7", white: "#ffffff" };

export default function Perfil() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [tab, setTab]       = useState("perfil");
  const [msg, setMsg]       = useState("");
  const [form, setForm]     = useState({
    first_name: user.nombre?.split(" ")[0] || "",
    last_name:  user.nombre?.split(" ")[1] || "",
    email:      user.email || "",
    telefono:   user.telefono || "",
    localidad:  user.localidad || "",
  });
  const [pass, setPass] = useState({
    password_actual: "", password_nuevo: "", confirmar: ""
  });

  const guardarPerfil = async () => {
    try {
      await axios.put("http://127.0.0.1:8000/api/auth/perfil/",
        form, { withCredentials: true });
      setMsg("✅ Perfil actualizado correctamente");
    } catch { setMsg("❌ Error al actualizar"); }
  };

  const cambiarPass = async () => {
    if (pass.password_nuevo !== pass.confirmar) {
      setMsg("❌ Las contraseñas no coinciden"); return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/password/",
        { password_actual: pass.password_actual,
          password_nuevo:  pass.password_nuevo },
        { withCredentials: true });
      setMsg("✅ Contraseña cambiada correctamente");
      setPass({ password_actual: "", password_nuevo: "", confirmar: "" });
    } catch { setMsg("❌ Contraseña actual incorrecta"); }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1efe8" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: "#2c2c2a", marginBottom: 20 }}>
          👤 Mi Perfil
        </h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["perfil", "password"].map(t => (
            <button key={t} onClick={() => { setTab(t); setMsg(""); }}
              style={{
                padding: "7px 16px", borderRadius: 7, cursor: "pointer",
                border: "1px solid #d3d1c7", fontFamily: "inherit",
                background: tab === t ? G.g5 : G.white,
                color:      tab === t ? G.white : "#555",
                fontWeight: tab === t ? 600 : 400,
              }}>
              {t === "perfil" ? "📋 Datos personales" : "🔒 Cambiar contraseña"}
            </button>
          ))}
        </div>

        {msg && <div style={{ padding: "9px 14px", background: "#e8f5e9",
          border: "1px solid #a5d6a7", borderRadius: 8, marginBottom: 14,
          fontSize: 13, color: "#1b5e20" }}>{msg}</div>}

        <div style={{ background: G.white, border: "1px solid #d3d1c7",
          borderRadius: 10, padding: 20, maxWidth: 500 }}>

          {tab === "perfil" && (
            <>
              {[
                ["Nombre",    "first_name"],
                ["Apellido",  "last_name"],
                ["Correo",    "email"],
                ["Teléfono",  "telefono"],
                ["Localidad", "localidad"],
              ].map(([label, field]) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11,
                    color: "#666", marginBottom: 4 }}>{label}</label>
                  <input
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px",
                      border: "1px solid #d3d1c7", borderRadius: 8,
                      fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <button onClick={guardarPerfil} style={{
                padding: "9px 20px", background: G.g5, border: "none",
                borderRadius: 8, color: G.white, cursor: "pointer",
                fontSize: 13, fontFamily: "inherit",
              }}>Guardar cambios</button>
            </>
          )}

          {tab === "password" && (
            <>
              {[
                ["Contraseña actual",  "password_actual"],
                ["Contraseña nueva",   "password_nuevo"],
                ["Confirmar nueva",    "confirmar"],
              ].map(([label, field]) => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11,
                    color: "#666", marginBottom: 4 }}>{label}</label>
                  <input type="password"
                    value={pass[field]}
                    onChange={e => setPass({ ...pass, [field]: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px",
                      border: "1px solid #d3d1c7", borderRadius: 8,
                      fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <button onClick={cambiarPass} style={{
                padding: "9px 20px", background: G.g5, border: "none",
                borderRadius: 8, color: G.white, cursor: "pointer",
                fontSize: 13, fontFamily: "inherit",
              }}>Cambiar contraseña</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}