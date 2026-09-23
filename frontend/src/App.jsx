import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login          from "./pages/Login";
import Dashboard      from "./pages/Dashboard";
import Usuarios       from "./pages/Usuarios";
import Perfil         from "./pages/Perfil";
import Bitacora       from "./pages/Bitacora";
import Productores    from "./pages/Productores";
import MapaParcela    from "./pages/MapaParcela";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        }/>
        <Route path="/productores" element={
          <ProtectedRoute roles={["admin","auxiliar","tecnico"]}>
            <Productores />
          </ProtectedRoute>
        }/>
        <Route path="/mapa-parcela" element={
          <ProtectedRoute roles={["admin","auxiliar","tecnico"]}>
            <MapaParcela />
          </ProtectedRoute>
        }/>
        <Route path="/usuarios" element={
          <ProtectedRoute roles={["admin"]}><Usuarios /></ProtectedRoute>
        }/>
        <Route path="/perfil" element={
          <ProtectedRoute><Perfil /></ProtectedRoute>
        }/>
        <Route path="/bitacora" element={
          <ProtectedRoute roles={["admin"]}><Bitacora /></ProtectedRoute>
        }/>
      </Routes>
    </BrowserRouter>
  );
}