import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";

const G = { g8: "#0d3311", g5: "#268c2d", g1: "#d4f5d7", white: "#ffffff" };

function DibujarPoligono({ puntos, setPuntos, dibujando }) {
  useMapEvents({
    click(e) {
      if (!dibujando) return;
      setPuntos(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
    }
  });
  return null;
}

function BuscadorMapa() {
  const map = useMap();
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [buscando, setBuscando] = useState(false);

const buscar = async () => {
    if (!query.trim()) return;
    setBuscando(true);
    try {
      const r = await fetch(
        `http://127.0.0.1:8000/api/auth/geocoding/?q=${encodeURIComponent(query)}`
      );
      const data = await r.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setBuscando(false);
    }
  };

  const irA = (lat, lon, nombre) => {
    map.setView([parseFloat(lat), parseFloat(lon)], 14);
    setResults([]);
    setQuery(nombre);
  };

  return (
    <div style={{ position: "absolute", top: 10, left: 50,
      zIndex: 1000, width: 280 }}>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && buscar()}
          placeholder="🔍 Buscar localidad..."
          style={{ flex: 1, padding: "7px 10px", border: "1px solid #ccc",
            borderRadius: 7, fontSize: 12, fontFamily: "inherit",
            boxShadow: "0 2px 6px rgba(0,0,0,.2)" }}
        />
        <button onClick={buscar}
          style={{ padding: "7px 12px", background: "#268c2d",
            border: "none", borderRadius: 7, color: "#fff",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            boxShadow: "0 2px 6px rgba(0,0,0,.2)" }}>
          {buscando ? "..." : "Ir"}
        </button>
      </div>
      {results.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #ddd",
          borderRadius: 7, marginTop: 4, overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}>
         {results.map((r, i) => (
  <div key={i}
    onClick={() => irA(r.lat, r.lon, r.nombre)}
    style={{ padding: "8px 12px", fontSize: 11, cursor: "pointer",
      borderBottom: "1px solid #f0f0f0", color: "#333",
      background: "#fff" }}
    onMouseEnter={e => e.currentTarget.style.background = "#f0f8f0"}
    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
    📍 {r.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapaParcela() {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const productorId     = searchParams.get("productor");
  const productorNombre = searchParams.get("nombre") || "Productor";

  const [puntos, setPuntos]       = useState([]);
  const [dibujando, setDibujando] = useState(false);
  const [hectareas, setHectareas] = useState("");
  const [msg, setMsg]             = useState("");
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    nombre: "", clave: "", variedad: "RRIM 600",
    edad_anos: "", densidad_arboles: "",
    localidad: "", municipio: "", observaciones: "",
  });

  const calcularArea = (coords) => {
    if (coords.length < 3) return 0;
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][0];
    }
    return Math.abs(area) / 2 * 111 * 111 * 100;
  };

  useEffect(() => {
    if (puntos.length >= 3) {
      setHectareas(calcularArea(puntos).toFixed(2));
    }
  }, [puntos]);

  const iniciarDibujo = () => {
    setPuntos([]);
    setDibujando(true);
    setMsg("Haz clic en el mapa para agregar vértices del polígono");
  };

  const terminarDibujo = () => {
    setDibujando(false);
    if (puntos.length < 3) {
      setMsg("❌ Necesitas al menos 3 puntos para formar un polígono");
    } else {
      setMsg(`✅ Polígono listo con ${puntos.length} vértices — ${calcularArea(puntos).toFixed(2)} ha`);
    }
  };

  const deshacerUltimo = () => {
    setPuntos(prev => prev.slice(0, -1));
  };

  const limpiar = () => {
    setPuntos([]);
    setHectareas("");
    setMsg("");
    setDibujando(false);
  };

  const guardar = async () => {
    if (puntos.length < 3) {
      setMsg("❌ Dibuja el polígono primero (mínimo 3 puntos)");
      return;
    }
    if (!form.nombre) {
      setMsg("❌ El nombre de la parcela es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      const latCentro = puntos.reduce((s, c) => s + c[0], 0) / puntos.length;
      const lonCentro = puntos.reduce((s, c) => s + c[1], 0) / puntos.length;
      const geojson = {
        type: "Polygon",
        coordinates: [[...puntos.map(c => [c[1], c[0]]),
                        [puntos[0][1], puntos[0][0]]]]
      };
      await axios.post(
        `http://127.0.0.1:8000/api/productores/${productorId}/parcelas/`,
        {
          ...form,
          hectareas:  hectareas || calcularArea(puntos).toFixed(2),
          lat_centro: latCentro.toFixed(7),
          lon_centro: lonCentro.toFixed(7),
          geojson:    JSON.stringify(geojson),
          status:     "produccion",
        },
        { withCredentials: true }
      );
      setMsg("✅ Parcela guardada correctamente");
      setTimeout(() => navigate("/productores"), 1500);
    } catch (e) {
      setMsg("❌ Error: " + (e.response?.data?.error || e.message));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1efe8",
      display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: G.g8, padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/productores")}
          style={{ background: "transparent", border: "1px solid #ffffff44",
            borderRadius: 7, color: G.white, padding: "5px 12px",
            cursor: "pointer", fontSize: 12 }}>
          ← Volver
        </button>
        <div>
          <div style={{ color: G.g1, fontSize: 10 }}>
            Productores · {decodeURIComponent(productorNombre)}
          </div>
          <div style={{ color: G.white, fontSize: 16, fontWeight: 500 }}>
            🗺️ Dibujar parcela en el mapa
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Panel izquierdo */}
        <div style={{ width: 300, background: G.white,
          borderRight: "1px solid #d3d1c7", padding: 16,
          overflowY: "auto", display: "flex",
          flexDirection: "column", gap: 10 }}>

          {/* Instrucciones */}
          <div style={{ background: G.g1, border: `1px solid ${G.g5}`,
            borderRadius: 8, padding: 10, fontSize: 12, color: G.g8 }}>
            <strong>¿Cómo dibujar?</strong><br />
            1. Clic en <strong>Iniciar dibujo</strong><br />
            2. Haz clic en el mapa para cada vértice<br />
            3. Clic en <strong>Terminar</strong> cuando acabes<br />
            4. Llena los datos y guarda
          </div>

          {/* Botones de dibujo */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {!dibujando ? (
              <button onClick={iniciarDibujo}
                style={{ flex: 1, padding: "8px", background: G.g5,
                  border: "none", borderRadius: 7, color: G.white,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                ✏️ Iniciar dibujo
              </button>
            ) : (
              <>
                <button onClick={terminarDibujo}
                  style={{ flex: 1, padding: "8px", background: "#0d47a1",
                    border: "none", borderRadius: 7, color: G.white,
                    cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                  ✓ Terminar
                </button>
                <button onClick={deshacerUltimo}
                  style={{ padding: "8px 10px", background: "#e65100",
                    border: "none", borderRadius: 7, color: G.white,
                    cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                  ↩
                </button>
              </>
            )}
            <button onClick={limpiar}
              style={{ padding: "8px 10px", background: "transparent",
                border: "1px solid #d3d1c7", borderRadius: 7,
                cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
              🗑️
            </button>
          </div>

          {/* Estado del polígono */}
          {puntos.length > 0 && (
            <div style={{ background: "#e3f2fd", border: "1px solid #90caf9",
              borderRadius: 8, padding: 8, fontSize: 11 }}>
              📍 {puntos.length} puntos marcados
              {puntos.length >= 3 && ` · ~${calcularArea(puntos).toFixed(2)} ha`}
              {dibujando && <span style={{ color: G.g5 }}> — sigue haciendo clic</span>}
            </div>
          )}

          {msg && (
            <div style={{ padding: "8px 10px", borderRadius: 7, fontSize: 11,
              background: msg.includes("✅") ? "#e8f5e9" : "#ffebee",
              color: msg.includes("✅") ? "#1b5e20" : "#c62828" }}>
              {msg}
            </div>
          )}

          {/* Formulario */}
          {[
            ["Nombre parcela*", "nombre",           "text"],
            ["Clave/Código",    "clave",            "text"],
            ["Localidad",       "localidad",        "text"],
            ["Municipio",       "municipio",        "text"],
            ["Edad (años)",     "edad_anos",        "number"],
            ["Densidad árboles/ha", "densidad_arboles", "number"],
          ].map(([label, field, type]) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 11,
                color: "#666", marginBottom: 3 }}>{label}</label>
              <input type={type} value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                style={{ width: "100%", padding: "7px 10px",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  fontSize: 12, boxSizing: "border-box",
                  fontFamily: "inherit" }} />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 11,
              color: "#666", marginBottom: 3 }}>Variedad</label>
            <select value={form.variedad}
              onChange={e => setForm({ ...form, variedad: e.target.value })}
              style={{ width: "100%", padding: "7px 10px",
                border: "1px solid #d3d1c7", borderRadius: 7,
                fontSize: 12, fontFamily: "inherit" }}>
              {["RRIM 600","GT-1","PB 260","IAN 873","IAN 710","Otro"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11,
              color: "#666", marginBottom: 3 }}>Observaciones</label>
            <textarea value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              rows={2}
              style={{ width: "100%", padding: "7px 10px",
                border: "1px solid #d3d1c7", borderRadius: 7,
                fontSize: 12, boxSizing: "border-box", resize: "vertical",
                fontFamily: "inherit" }} />
          </div>

          <button onClick={guardar} disabled={guardando}
            style={{ padding: "10px", background: G.g5, border: "none",
              borderRadius: 8, color: G.white, cursor: "pointer",
              fontSize: 13, fontFamily: "inherit", fontWeight: 500,
              opacity: guardando ? 0.7 : 1 }}>
            {guardando ? "Guardando..." : "💾 Guardar parcela"}
          </button>
        </div>

        {/* Mapa */}
        <div style={{ flex: 1, cursor: dibujando ? "crosshair" : "grab" }}>
          <MapContainer
            center={[18.1, -95.2]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <BuscadorMapa />
            <DibujarPoligono
              puntos={puntos}
              setPuntos={setPuntos}
              dibujando={dibujando}
            />
            <DibujarPoligono
              puntos={puntos}
              setPuntos={setPuntos}
              dibujando={dibujando}
            />
            {puntos.length >= 3 && (
              <Polygon
                positions={puntos}
                pathOptions={{
                  color: G.g5,
                  fillColor: G.g1,
                  fillOpacity: 0.4,
                  weight: 2,
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}