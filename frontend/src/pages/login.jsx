import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { key: "admin",    label: "Administrador",    icon: "🛡️" },
  { key: "tecnico",  label: "Técnico de campo", icon: "👷" },
  { key: "auxiliar", label: "Auxiliar",          icon: "📋" },
];

export default function Login() {
  const [rol, setRol]         = useState("admin");
  const [username, setUser]   = useState("");
  const [password, setPass]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.get("http://127.0.0.1:8000/api/auth/csrf/",
        { withCredentials: true });
      const csrfToken = document.cookie
        .split('; ')
        .find(r => r.startsWith('csrftoken='))
        ?.split('=')[1];
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        { username, password },
        {
          withCredentials: true,
          headers: { 'X-CSRFToken': csrfToken }
        }
      );
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoRing}>🌿</div>
          <h1 style={styles.title}>LatexSmart Agro</h1>
          <p style={styles.sub}>Asociación de Productores de Látex</p>
        </div>

        <div style={styles.body}>
          <p style={styles.roleLabel}>Selecciona tu perfil de acceso</p>
          <div style={styles.roles}>
            {ROLES.map((r) => (
              <div
                key={r.key}
                onClick={() => setRol(r.key)}
                style={{
                  ...styles.roleBtn,
                  ...(rol === r.key ? styles.roleBtnOn : {}),
                }}
              >
                <span style={styles.roleIcon}>{r.icon}</span>
                <span style={styles.roleName}>{r.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.field}>
              <label style={styles.label}>Usuario</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const G = {
  g9: "#051a06", g8: "#0d3311", g7: "#155219",
  g6: "#1c6e22", g5: "#268c2d", g4: "#32b03b",
  g1: "#d4f5d7", white: "#ffffff",
};

const styles = {
  bg: {
    minHeight: "100vh", background: G.g9,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  card: {
    width: 380, borderRadius: 16, overflow: "hidden",
    border: `0.5px solid ${G.g7}`, background: G.white,
  },
  header: {
    background: G.g8, padding: "28px 28px 22px",
    textAlign: "center",
  },
  logoRing: {
    width: 52, height: 52, background: G.g5, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26, margin: "0 auto 12px",
  },
  title: { fontSize: 18, fontWeight: 500, color: G.white, margin: 0 },
  sub:   { fontSize: 11, color: G.g1, margin: "4px 0 0", opacity: .8 },
  body:  { padding: "22px 26px" },
  roleLabel: { fontSize: 12, color: "#555", marginBottom: 10 },
  roles: { display: "flex", gap: 8, marginBottom: 18 },
  roleBtn: {
    flex: 1, border: "1px solid #e0ead0", borderRadius: 8,
    padding: "10px 6px", textAlign: "center", cursor: "pointer",
    transition: "all .15s",
  },
  roleBtnOn: { borderColor: G.g5, background: G.g1 },
  roleIcon: { display: "block", fontSize: 18, marginBottom: 4 },
  roleName: { fontSize: 11, fontWeight: 500, color: "#333" },
  field:  { marginBottom: 13 },
  label:  { display: "block", fontSize: 11, color: "#666", marginBottom: 4 },
  input:  {
    width: "100%", padding: "9px 12px", border: "1px solid #d3d1c7",
    borderRadius: 8, fontSize: 13, boxSizing: "border-box",
  },
  error: { color: "#c62828", fontSize: 11, marginBottom: 10 },
  btn: {
    width: "100%", padding: 11, background: G.g5, border: "none",
    borderRadius: 9, color: G.white, fontSize: 14, fontWeight: 500,
    cursor: "pointer",
  },
};