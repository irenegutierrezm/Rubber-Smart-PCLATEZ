import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const G = {
  g9: "#051a06", g8: "#0d3311", g7: "#155219",
  g5: "#268c2d", g1: "#d4f5d7", white: "#ffffff"
};

const menuItems = [
  { path: "/dashboard",   label: "Dashboard",    icon: "📊", roles: ["admin","tecnico","auxiliar"] },
  { path: "/productores", label: "Productores",  icon: "🌿", roles: ["admin","tecnico","auxiliar"] },
  { path: "/usuarios",    label: "Usuarios",     icon: "👥", roles: ["admin"] },
  { path: "/perfil",      label: "Mi Perfil",    icon: "👤", roles: ["admin","tecnico","auxiliar"] },
  { path: "/bitacora",    label: "Bitácora",     icon: "📋", roles: ["admin"] },
];

export default function Sidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/logout/",
        {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("user");
    navigate("/");
  };

  const itemsFiltrados = menuItems.filter(
    item => item.roles.includes(user.rol)
  );

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>🌿</span>
        <div>
          <div style={s.logoTitle}>LatexSmart</div>
          <div style={s.logoSub}>Agro Platform</div>
        </div>
      </div>

      <nav style={s.nav}>
        {itemsFiltrados.map(item => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...s.navItem,
              ...(location.pathname === item.path ? s.navItemOn : {})
            }}
          >
            <span style={s.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.userInfo}>
          <div style={s.avatar}>
            {user.nombre?.charAt(0) || user.username?.charAt(0) || "U"}
          </div>
          <div>
            <div style={s.userName}>{user.nombre || user.username}</div>
            <div style={s.userRol}>{user.rol}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}

const s = {
  sidebar: {
    width: 210, minHeight: "100vh", background: G.g8,
    display: "flex", flexDirection: "column",
    borderRight: `1px solid ${G.g7}`, flexShrink: 0,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "20px 16px", borderBottom: `1px solid ${G.g7}`,
  },
  logoIcon: { fontSize: 28 },
  logoTitle: { color: G.white, fontWeight: 600, fontSize: 15 },
  logoSub:   { color: G.g1,    fontSize: 10, opacity: .7 },
  nav:       { flex: 1, padding: "12px 0" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px", color: "rgba(255,255,255,.5)",
    cursor: "pointer", fontSize: 13, transition: "all .15s",
    borderLeft: "3px solid transparent",
  },
  navItemOn: {
    background: "rgba(45,148,68,.2)", color: G.g1,
    borderLeft: `3px solid ${G.g5}`, fontWeight: 500,
  },
  navIcon: { fontSize: 16 },
  footer: {
    padding: "12px 16px",
    borderTop: `1px solid ${G.g7}`,
  },
  userInfo: {
    display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: G.g5, display: "flex", alignItems: "center",
    justifyContent: "center", color: G.white,
    fontWeight: 600, fontSize: 13, flexShrink: 0,
  },
  userName: { color: G.white, fontSize: 12, fontWeight: 500 },
  userRol:  { color: G.g1,    fontSize: 10, opacity: .7 },
  logoutBtn: {
    width: "100%", padding: "7px 0", background: "rgba(255,0,0,.15)",
    border: "1px solid rgba(255,0,0,.3)", borderRadius: 7,
    color: "#ff9999", fontSize: 12, cursor: "pointer",
  },
};