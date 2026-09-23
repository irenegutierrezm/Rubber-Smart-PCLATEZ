import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const G = { g8: "#0d3311", g5: "#268c2d", g1: "#d4f5d7", white: "#ffffff" };

const formVacio = {
  nombre: "", apellido_paterno: "", apellido_materno: "",
  curp: "", rfc: "", telefono: "", telefono_alt: "", correo: "",
  calle: "", numero: "", localidad: "", municipio: "",
  estado: "VER", codigo_postal: "", status: "activo",
  historial_productivo: "", observaciones: "",
};

const parcelaVacia = {
  nombre: "", clave: "", localidad: "", municipio: "",
  variedad: "RRIM 600", hectareas: "", edad_anos: "",
  densidad_arboles: "", status: "produccion",
  lat_centro: "", lon_centro: "", observaciones: "",
};

export default function Productores() {
  const [productores, setProductores]   = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [form, setForm]                 = useState(formVacio);
  const [parcelaForm, setParcelaForm]   = useState(parcelaVacia);
  const [editId, setEditId]             = useState(null);
  const [editParcelaId, setEditParcelaId] = useState(null);
  const [modal, setModal]               = useState(false);
  const [modalParcela, setModalParcela] = useState(false);
  const [tab, setTab]                   = useState("info");
  const [buscar, setBuscar]             = useState("");
  const [msg, setMsg]                   = useState("");
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      const r = await axios.get(
        `http://127.0.0.1:8000/api/productores/?q=${buscar}`,
        { withCredentials: true });
      setProductores(r.data);
    } catch { setMsg("❌ Error al cargar productores"); }
  };

  const cargarDetalle = async (id) => {
    try {
      const r = await axios.get(
        `http://127.0.0.1:8000/api/productores/${id}/`,
        { withCredentials: true });
      setSeleccionado(r.data);
      setTab("info");
    } catch {}
  };

  useEffect(() => { cargar(); }, [buscar]);

  const abrirNuevo = () => {
    setForm(formVacio); setEditId(null);
    setModal(true); setMsg("");
  };

  const abrirEditar = (p) => {
    setForm({
      nombre: p.nombre, apellido_paterno: p.apellido_paterno,
      apellido_materno: p.apellido_materno, curp: p.curp,
      rfc: p.rfc, telefono: p.telefono, telefono_alt: p.telefono_alt,
      correo: p.correo, calle: p.calle, numero: p.numero,
      localidad: p.localidad, municipio: p.municipio,
      estado: p.estado, codigo_postal: p.codigo_postal,
      status: p.status, historial_productivo: p.historial_productivo,
      observaciones: p.observaciones,
    });
    setEditId(p.id); setModal(true); setMsg("");
  };

  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(
          `http://127.0.0.1:8000/api/productores/${editId}/`,
          form, { withCredentials: true });
        setMsg("✅ Productor actualizado");
        cargarDetalle(editId);
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/productores/",
          form, { withCredentials: true });
        setMsg("✅ Productor creado");
      }
      setModal(false); cargar();
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Error al guardar"));
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este productor?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/productores/${id}/`,
        { withCredentials: true });
      setSeleccionado(null); cargar();
    } catch { setMsg("❌ Error al eliminar"); }
  };

  const abrirNuevaParcela = () => {
    setParcelaForm(parcelaVacia);
    setEditParcelaId(null);
    setModalParcela(true);
  };

  const abrirEditarParcela = (p) => {
    setParcelaForm({ ...p });
    setEditParcelaId(p.id);
    setModalParcela(true);
  };

  const guardarParcela = async () => {
    try {
      if (editParcelaId) {
        await axios.put(
          `http://127.0.0.1:8000/api/productores/parcelas/${editParcelaId}/`,
          parcelaForm, { withCredentials: true });
      } else {
        await axios.post(
          `http://127.0.0.1:8000/api/productores/${seleccionado.id}/parcelas/`,
          parcelaForm, { withCredentials: true });
      }
      setModalParcela(false);
      cargarDetalle(seleccionado.id);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Error al guardar parcela"));
    }
  };

  const eliminarParcela = async (id) => {
    if (!window.confirm("¿Eliminar esta parcela?")) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/productores/parcelas/${id}/`,
        { withCredentials: true });
      cargarDetalle(seleccionado.id);
    } catch { setMsg("❌ Error al eliminar parcela"); }
  };

  const irAMapa = () => {
    navigate(`/mapa-parcela?productor=${seleccionado.id}&nombre=${encodeURIComponent(seleccionado.nombre_completo)}`);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1efe8" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: G.white, borderBottom: "1px solid #d3d1c7",
          padding: "12px 20px", display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#888" }}>Módulos · Productores</div>
            <h1 style={{ fontSize: 18, fontWeight: 500, color: "#2c2c2a", margin: 0 }}>
              👥 Módulo de Productores
            </h1>
          </div>
          <button onClick={abrirNuevo} style={{
            padding: "8px 16px", background: G.g5, border: "none",
            borderRadius: 8, color: G.white, cursor: "pointer",
            fontSize: 13, fontFamily: "inherit", fontWeight: 500 }}>
            + Nuevo productor
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Lista izquierda */}
          <div style={{ width: 300, background: G.white,
            borderRight: "1px solid #d3d1c7", display: "flex",
            flexDirection: "column" }}>
            <div style={{ padding: "10px 12px",
              borderBottom: "1px solid #e8e6dc" }}>
              <input placeholder="🔍 Buscar productor..."
                value={buscar}
                onChange={e => setBuscar(e.target.value)}
                style={{ width: "100%", padding: "7px 10px",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  fontSize: 12, boxSizing: "border-box",
                  fontFamily: "inherit" }} />
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {productores.length === 0 && (
                <div style={{ padding: 20, textAlign: "center",
                  color: "#888", fontSize: 13 }}>
                  No hay productores registrados
                </div>
              )}
              {productores.map(p => (
                <div key={p.id}
                  onClick={() => cargarDetalle(p.id)}
                  style={{
                    padding: "10px 14px", cursor: "pointer",
                    borderBottom: "1px solid #f1efe8",
                    background: seleccionado?.id === p.id
                      ? "#eaf3de" : "transparent",
                    borderLeft: seleccionado?.id === p.id
                      ? `3px solid ${G.g5}` : "3px solid transparent",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%",
                      background: G.g1, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontWeight: 600, color: G.g8, fontSize: 13,
                      flexShrink: 0 }}>
                      {p.apellido_paterno?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500,
                        color: "#2c2c2a" }}>{p.nombre_completo}</div>
                      <div style={{ fontSize: 10, color: "#888" }}>
                        {p.folio} · {p.total_parcelas} parcela(s)
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: "1px 6px",
                      borderRadius: 20,
                      background: p.status === "activo" ? "#e8f5e9" : "#ffebee",
                      color: p.status === "activo" ? "#1b5e20" : "#c62828" }}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho */}
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
            {!seleccionado ? (
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "center", height: "100%",
                color: "#888", fontSize: 14 }}>
                ← Selecciona un productor para ver su información
              </div>
            ) : (
              <>
                {/* Encabezado del productor */}
                <div style={{ background: G.white, borderRadius: 10,
                  border: "1px solid #d3d1c7", padding: "16px 20px",
                  marginBottom: 16, display: "flex",
                  justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%",
                      background: G.g1, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontWeight: 700, color: G.g8, fontSize: 20 }}>
                      {seleccionado.apellido_paterno?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600,
                        color: "#2c2c2a" }}>{seleccionado.nombre_completo}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                        Folio: {seleccionado.folio} ·
                        Ingreso: {seleccionado.fecha_ingreso}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px",
                          borderRadius: 20, background: "#e3f2fd",
                          color: "#0d47a1" }}>
                          {seleccionado.total_parcelas} parcela(s)
                        </span>
                        <span style={{ fontSize: 11, padding: "2px 8px",
                          borderRadius: 20, background: "#e8f5e9",
                          color: "#1b5e20" }}>
                          {seleccionado.superficie_total} ha
                        </span>
                        <span style={{ fontSize: 11, padding: "2px 8px",
                          borderRadius: 20,
                          background: seleccionado.status === "activo"
                            ? "#e8f5e9" : "#ffebee",
                          color: seleccionado.status === "activo"
                            ? "#1b5e20" : "#c62828" }}>
                          {seleccionado.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => abrirEditar(seleccionado)}
                      style={{ padding: "7px 14px", background: "transparent",
                        border: "1px solid #d3d1c7", borderRadius: 7,
                        cursor: "pointer", fontSize: 12,
                        fontFamily: "inherit" }}>
                      ✏️ Editar
                    </button>
                    {user.rol === "admin" && (
                      <button onClick={() => eliminar(seleccionado.id)}
                        style={{ padding: "7px 14px",
                          background: "transparent",
                          border: "1px solid #ffcdd2", borderRadius: 7,
                          cursor: "pointer", fontSize: 12,
                          color: "#c62828", fontFamily: "inherit" }}>
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {[
                    ["info",     "📋 Información"],
                    ["parcelas", "🗺️ Parcelas"],
                    ["historial","📈 Historial"],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                      style={{ padding: "7px 14px", borderRadius: 7,
                        border: "1px solid #d3d1c7", cursor: "pointer",
                        fontFamily: "inherit", fontSize: 12,
                        background: tab === key ? G.g5 : G.white,
                        color:      tab === key ? G.white : "#555",
                        fontWeight: tab === key ? 600 : 400 }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab: Información */}
                {tab === "info" && (
                  <div style={{ display: "grid",
                    gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[
                      ["CURP",      seleccionado.curp        || "—"],
                      ["RFC",       seleccionado.rfc         || "—"],
                      ["Teléfono",  seleccionado.telefono    || "—"],
                      ["Tel. Alt.", seleccionado.telefono_alt || "—"],
                      ["Correo",    seleccionado.correo      || "—"],
                      ["Localidad", seleccionado.localidad   || "—"],
                      ["Municipio", seleccionado.municipio   || "—"],
                      ["Estado",    seleccionado.estado      || "—"],
                      ["C.P.",      seleccionado.codigo_postal || "—"],
                      ["Dirección", `${seleccionado.calle} ${seleccionado.numero}`.trim() || "—"],
                    ].map(([label, value]) => (
                      <div key={label} style={{ background: G.white,
                        border: "1px solid #d3d1c7", borderRadius: 8,
                        padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#888",
                          marginBottom: 3, textTransform: "uppercase",
                          letterSpacing: ".4px" }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500,
                          color: "#2c2c2a" }}>{value}</div>
                      </div>
                    ))}
                    {seleccionado.observaciones && (
                      <div style={{ background: G.white,
                        border: "1px solid #d3d1c7", borderRadius: 8,
                        padding: "10px 14px", gridColumn: "span 2" }}>
                        <div style={{ fontSize: 10, color: "#888",
                          marginBottom: 3, textTransform: "uppercase" }}>
                          Observaciones
                        </div>
                        <div style={{ fontSize: 13, color: "#2c2c2a" }}>
                          {seleccionado.observaciones}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Parcelas */}
                {tab === "parcelas" && (
                  <div>
                    <div style={{ display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 500,
                        color: "#2c2c2a" }}>
                        {seleccionado.total_parcelas} parcela(s) · {" "}
                        {seleccionado.superficie_total} ha totales
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={abrirNuevaParcela}
                          style={{ padding: "6px 12px",
                            background: "transparent",
                            border: `1px solid ${G.g5}`, borderRadius: 7,
                            color: G.g5, cursor: "pointer", fontSize: 12,
                            fontFamily: "inherit" }}>
                          + Manual
                        </button>
                        <button onClick={irAMapa}
                          style={{ padding: "6px 12px", background: G.g5,
                            border: "none", borderRadius: 7, color: G.white,
                            cursor: "pointer", fontSize: 12,
                            fontFamily: "inherit", fontWeight: 500 }}>
                          🗺️ Dibujar en mapa
                        </button>
                      </div>
                    </div>

                    {seleccionado.parcelas?.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center",
                        color: "#888", background: G.white,
                        borderRadius: 10, border: "1px solid #d3d1c7" }}>
                        No hay parcelas registradas.<br />
                        <span style={{ fontSize: 12 }}>
                          Usa "+ Manual" o "🗺️ Dibujar en mapa"
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: "flex",
                        flexDirection: "column", gap: 10 }}>
                        {seleccionado.parcelas?.map(p => (
                          <div key={p.id} style={{ background: G.white,
                            border: "1px solid #d3d1c7", borderRadius: 10,
                            padding: "12px 16px" }}>
                            <div style={{ display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start" }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600,
                                  color: "#2c2c2a", marginBottom: 4 }}>
                                  {p.nombre}
                                  {p.clave && (
                                    <span style={{ fontSize: 11,
                                      color: "#888", marginLeft: 8 }}>
                                      ({p.clave})
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 8,
                                  flexWrap: "wrap" }}>
                                  {[
                                    [`🌿 ${p.variedad}`,       "#e8f5e9", "#1b5e20"],
                                    [`📐 ${p.hectareas} ha`,   "#e3f2fd", "#0d47a1"],
                                    [`🌳 ${p.edad_anos} años`, "#fff3e0", "#e65100"],
                                    [`🌱 ${p.total_arboles} árboles`, "#f3e5f5", "#6a1b9a"],
                                  ].map(([txt, bg, col]) => (
                                    <span key={txt} style={{ fontSize: 11,
                                      padding: "2px 8px", borderRadius: 20,
                                      background: bg, color: col }}>
                                      {txt}
                                    </span>
                                  ))}
                                </div>
                                {p.localidad && (
                                  <div style={{ fontSize: 11, color: "#888",
                                    marginTop: 4 }}>
                                    📍 {p.localidad}, {p.municipio}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => abrirEditarParcela(p)}
                                  style={{ padding: "4px 10px",
                                    background: "transparent",
                                    border: "1px solid #d3d1c7",
                                    borderRadius: 6, cursor: "pointer",
                                    fontSize: 11, fontFamily: "inherit" }}>
                                  ✏️
                                </button>
                                {user.rol === "admin" && (
                                  <button onClick={() => eliminarParcela(p.id)}
                                    style={{ padding: "4px 10px",
                                      background: "transparent",
                                      border: "1px solid #ffcdd2",
                                      borderRadius: 6, cursor: "pointer",
                                      fontSize: 11, color: "#c62828",
                                      fontFamily: "inherit" }}>
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Historial */}
                {tab === "historial" && (
                  <div style={{ background: G.white,
                    border: "1px solid #d3d1c7", borderRadius: 10,
                    padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 500,
                      color: "#2c2c2a", marginBottom: 12 }}>
                      📈 Historial productivo
                    </div>
                    <textarea readOnly
                      value={seleccionado.historial_productivo ||
                        "Sin historial registrado."}
                      style={{ width: "100%", minHeight: 200, padding: 12,
                        border: "1px solid #d3d1c7", borderRadius: 8,
                        fontSize: 13, resize: "vertical", color: "#555",
                        background: "#f9f9f7", boxSizing: "border-box",
                        fontFamily: "inherit" }} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal productor */}
      {modal && (
        <div style={{ position: "fixed", inset: 0,
          background: "rgba(0,0,0,.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: G.white, borderRadius: 12, padding: 24,
            width: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16,
              color: G.g8 }}>
              {editId ? "✏️ Editar productor" : "➕ Nuevo productor"}
            </h2>
            <div style={{ display: "grid",
              gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Nombre(s)*",        "nombre",           "text"],
                ["Apellido paterno*", "apellido_paterno", "text"],
                ["Apellido materno",  "apellido_materno", "text"],
                ["CURP",              "curp",             "text"],
                ["RFC",               "rfc",              "text"],
                ["Teléfono",          "telefono",         "tel"],
                ["Tel. alternativo",  "telefono_alt",     "tel"],
                ["Correo",            "correo",           "email"],
                ["Calle",             "calle",            "text"],
                ["Número",            "numero",           "text"],
                ["Localidad",         "localidad",        "text"],
                ["Municipio",         "municipio",        "text"],
                ["Código postal",     "codigo_postal",    "text"],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 11,
                    color: "#666", marginBottom: 3 }}>{label}</label>
                  <input type={type} value={form[field] || ""}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px",
                      border: "1px solid #d3d1c7", borderRadius: 7,
                      fontSize: 13, boxSizing: "border-box",
                      fontFamily: "inherit" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11,
                  color: "#666", marginBottom: 3 }}>Estado</label>
                <select value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    fontSize: 13, fontFamily: "inherit" }}>
                  <option value="VER">Veracruz</option>
                  <option value="OAX">Oaxaca</option>
                  <option value="PUE">Puebla</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11,
                  color: "#666", marginBottom: 3 }}>Status</label>
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    fontSize: 13, fontFamily: "inherit" }}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 11,
                color: "#666", marginBottom: 3 }}>Historial productivo</label>
              <textarea value={form.historial_productivo || ""}
                onChange={e => setForm({ ...form,
                  historial_productivo: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "8px 12px",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  fontSize: 13, boxSizing: "border-box", resize: "vertical",
                  fontFamily: "inherit" }} />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 11,
                color: "#666", marginBottom: 3 }}>Observaciones</label>
              <textarea value={form.observaciones || ""}
                onChange={e => setForm({ ...form,
                  observaciones: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "8px 12px",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  fontSize: 13, boxSizing: "border-box", resize: "vertical",
                  fontFamily: "inherit" }} />
            </div>
            {msg && <div style={{ padding: "7px 12px", background: "#ffebee",
              borderRadius: 7, marginTop: 12, fontSize: 12,
              color: "#c62828" }}>{msg}</div>}
            <div style={{ display: "flex", gap: 8,
              justifyContent: "flex-end", marginTop: 16 }}>
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
                {editId ? "Guardar cambios" : "Crear productor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal parcela manual */}
      {modalParcela && (
        <div style={{ position: "fixed", inset: 0,
          background: "rgba(0,0,0,.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: G.white, borderRadius: 12, padding: 24,
            width: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16,
              color: G.g8 }}>
              {editParcelaId ? "✏️ Editar parcela" : "➕ Nueva parcela manual"}
            </h2>
            <div style={{ display: "grid",
              gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Nombre parcela*", "nombre",           "text"],
                ["Clave/Código",    "clave",            "text"],
                ["Localidad",       "localidad",        "text"],
                ["Municipio",       "municipio",        "text"],
                ["Hectáreas",       "hectareas",        "number"],
                ["Edad (años)",     "edad_anos",        "number"],
                ["Densidad árboles/ha", "densidad_arboles", "number"],
                ["Latitud centro",  "lat_centro",       "number"],
                ["Longitud centro", "lon_centro",       "number"],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 11,
                    color: "#666", marginBottom: 3 }}>{label}</label>
                  <input type={type} value={parcelaForm[field] || ""}
                    onChange={e => setParcelaForm({
                      ...parcelaForm, [field]: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px",
                      border: "1px solid #d3d1c7", borderRadius: 7,
                      fontSize: 13, boxSizing: "border-box",
                      fontFamily: "inherit" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11,
                  color: "#666", marginBottom: 3 }}>Variedad</label>
                <select value={parcelaForm.variedad}
                  onChange={e => setParcelaForm({
                    ...parcelaForm, variedad: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    fontSize: 13, fontFamily: "inherit" }}>
                  {["RRIM 600","GT-1","PB 260","IAN 873","IAN 710","Otro"].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11,
                  color: "#666", marginBottom: 3 }}>Status</label>
                <select value={parcelaForm.status}
                  onChange={e => setParcelaForm({
                    ...parcelaForm, status: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px",
                    border: "1px solid #d3d1c7", borderRadius: 7,
                    fontSize: 13, fontFamily: "inherit" }}>
                  {[
                    ["produccion","En producción"],
                    ["establecimiento","Establecimiento"],
                    ["vivero","Vivero"],
                    ["renovacion","Renovación"],
                    ["abandonada","Abandonada"],
                  ].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 11,
                color: "#666", marginBottom: 3 }}>Observaciones</label>
              <textarea value={parcelaForm.observaciones || ""}
                onChange={e => setParcelaForm({
                  ...parcelaForm, observaciones: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "8px 12px",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  fontSize: 13, boxSizing: "border-box", resize: "vertical",
                  fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", gap: 8,
              justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setModalParcela(false)}
                style={{ padding: "8px 16px", background: "transparent",
                  border: "1px solid #d3d1c7", borderRadius: 7,
                  cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button onClick={guardarParcela}
                style={{ padding: "8px 16px", background: G.g5,
                  border: "none", borderRadius: 7, color: G.white,
                  cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                {editParcelaId ? "Guardar cambios" : "Agregar parcela"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}