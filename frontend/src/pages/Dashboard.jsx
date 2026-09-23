import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const G = {
  g9: "#051a06", g8: "#0d3311", g5: "#268c2d",
  g1: "#d4f5d7", white: "#ffffff"
};

function KpiCard({ icon, label, value, sub, color = G.g8 }) {
  return (
    <div style={s.kpi}>
      <div style={s.kpiIcon}>{icon}</div>
      <div style={{ ...s.kpiValue, color }}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
      {sub && <div style={s.kpiSub}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [productores, setProductores] = useState([]);
  const [parcelas, setParcelas]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [buscar, setBuscar]           = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [s, p, parc] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/dashboard/stats/",
            { withCredentials: true }),
          axios.get("http://127.0.0.1:8000/api/dashboard/productores/",
            { withCredentials: true }),
          axios.get("http://127.0.0.1:8000/api/dashboard/parcelas/",
            { withCredentials: true }),
        ]);
        setStats(s.data);
        setProductores(p.data);
        setParcelas(parc.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const filtrados = productores.filter(p =>
    p.nombre_completo.toLowerCase().includes(buscar.toLowerCase()) ||
    (p.localidad || '').toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div style={s.layout}>
      <Sidebar />
      <div style={s.main}>
        <div style={s.header}>
          <div>
            <div style={s.breadcrumb}>Inicio · Dashboard</div>
            <h1 style={s.title}>Panel de control general</h1>
          </div>
          <div style={s.welcome}>
            Bienvenido, <strong>{user.nombre || user.username}</strong>
          </div>
        </div>

        <div style={s.body}>

          {/* KPIs */}
          <div style={s.kpis}>
            <KpiCard icon="👥" label="Productores registrados"
              value={loading ? "..." : stats?.total_productores?.toLocaleString()}
              sub={`${stats?.total_activos || 0} activos`} />
            <KpiCard icon="🗺️" label="Parcelas registradas"
              value={loading ? "..." : stats?.total_parcelas?.toLocaleString()} />
            <KpiCard icon="🌿" label="NDVI Promedio"
              value={loading ? "..." : stats?.ndvi_promedio}
              color={G.g5} />
            <KpiCard icon="⚠️" label="Alertas activas"
              value={loading ? "..." : stats?.total_alertas}
              color={stats?.total_alertas > 0 ? "#c62828" : G.g8} />
          </div>

          {/* Buscador */}
          <div style={s.searchBar}>
            <span>🔍</span>
            <input
              placeholder="Buscar productor o localidad..."
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              style={s.searchInput}
            />
            <button
              onClick={() => navigate('/productores')}
              style={s.searchBtn}>
              Ver todos →
            </button>
          </div>

          <div style={s.grid}>
            {/* Mapa */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span>🗺️ Mapa de parcelas georeferenciadas</span>
                <span style={{ fontSize: 11, color: "#888" }}>
                  {stats?.total_parcelas || 0} parcelas registradas
                </span>
              </div>
              <div style={{ height: 260 }}>
                <MapContainer
                  center={[18.0, -95.0]}
                  zoom={9}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                  {parcelas.map((p, i) =>
                    p.geojson ? (
                      <Polygon
                        key={i}
                        positions={JSON.parse(p.geojson).coordinates[0].map(
                          c => [c[1], c[0]]
                        )}
                        pathOptions={{
                          color: "#268c2d",
                          fillColor: "#d4f5d7",
                          fillOpacity: 0.5
                        }}
                      >
                        <Popup>
                          <strong>{p.nombre}</strong><br />
                          Productor: {p.productor}<br />
                          {p.hectareas} ha
                        </Popup>
                      </Polygon>
                    ) : null
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Lista productores */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span>👥 Productores recientes</span>
                <span style={{ fontSize: 11, color: "#888" }}>
                  Mostrando 10 de {stats?.total_productores || 0}
                </span>
              </div>
              <div style={s.cardBody}>
                {loading ? (
                  <div style={{ padding: 20, textAlign: "center",
                    color: "#888" }}>Cargando...</div>
                ) : filtrados.map(p => (
                  <div key={p.id}
                    onClick={() => navigate('/productores')}
                    style={s.prodRow}>
                    <div style={s.prodAvatar}>
                      {p.nombre_completo?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.prodNombre}>{p.nombre_completo}</div>
                      <div style={s.prodLocal}>
                        {p.localidad || "Sin localidad"} ·
                        {p.total_parcelas} parcela(s)
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 7px",
                      borderRadius: 20,
                      background: p.status === "activo" ? G.g1 : "#ffebee",
                      color: p.status === "activo" ? G.g8 : "#c62828"
                    }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  layout:  { display: "flex", minHeight: "100vh", background: "#f1efe8" },
  main:    { flex: 1, display: "flex", flexDirection: "column" },
  header:  {
    background: "#fff", borderBottom: "1px solid #d3d1c7",
    padding: "12px 20px", display: "flex",
    alignItems: "center", justifyContent: "space-between",
  },
  breadcrumb: { fontSize: 10, color: "#888", marginBottom: 2 },
  title:   { fontSize: 18, fontWeight: 500, color: "#2c2c2a", margin: 0 },
  welcome: { fontSize: 13, color: "#555" },
  body:    { padding: 20, flex: 1, display: "flex",
    flexDirection: "column", gap: 14 },
  kpis:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
  kpi: {
    background: "#fff", border: "1px solid #d3d1c7",
    borderRadius: 10, padding: "14px 16px", textAlign: "center",
  },
  kpiIcon:  { fontSize: 24, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: 600, color: G.g8, marginBottom: 2 },
  kpiLabel: { fontSize: 10, color: "#888", textTransform: "uppercase",
    letterSpacing: ".4px" },
  kpiSub:   { fontSize: 10, color: G.g5, marginTop: 3 },
  searchBar: {
    background: "#fff", border: "1px solid #d3d1c7",
    borderRadius: 9, padding: "8px 14px",
    display: "flex", alignItems: "center", gap: 8,
  },
  searchInput: {
    flex: 1, border: "none", outline: "none",
    fontSize: 13, fontFamily: "inherit", color: "#2c2c2a",
  },
  searchBtn: {
    padding: "5px 12px", background: G.g5, border: "none",
    borderRadius: 7, color: "#fff", cursor: "pointer",
    fontSize: 12, fontFamily: "inherit", fontWeight: 500,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 320px",
    gap: 14, flex: 1 },
  card: {
    background: "#fff", border: "1px solid #d3d1c7",
    borderRadius: 10, overflow: "hidden",
  },
  cardHeader: {
    padding: "10px 14px", borderBottom: "1px solid #e8e6dc",
    fontSize: 13, fontWeight: 500, color: "#2c2c2a",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  cardBody: { padding: "6px 14px", overflowY: "auto", maxHeight: 320 },
  prodRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 0", borderBottom: "1px solid #f1efe8",
    cursor: "pointer",
  },
  prodAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: G.g1, display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: 600, color: G.g8,
    fontSize: 13, flexShrink: 0,
  },
  prodNombre: { fontSize: 12, fontWeight: 500, color: "#2c2c2a" },
  prodLocal:  { fontSize: 10, color: "#888" },
};