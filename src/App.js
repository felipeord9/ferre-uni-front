import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Users from "./pages/Users";
import Inicio from './pages/Inicio';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import ControlInterno from './pages/ControlInterno';
import Presupuesto from './pages/Presupuesto';
import Margen from './pages/Margen';
import Page404 from "./pages/Page404";
import Navbar from './components/Navbar';
import PrivateRoute from "./components/PrivateRoute";
import Inactivity from './components/Inactivity';
import { AuthContextProvider } from './context/authContext';
import { ClientContextProvider } from "./context/clientContext";
import { AppProvider } from './context/AppContext';
import { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const limitCounter = 3585; 
  const limitInactive = 15;
  const [counter, setCounter] = useState(0);
  const [inactiveCounter, setInactiveCounter] = useState(limitInactive);

  useEffect(() => {
    const timer = setInterval(() => {
      if (window.location.pathname !== "/login" ) {
        /* setCounter((prevCount) => prevCount + 1); */
        if (counter < limitCounter) {
          setCounter((prevCount) => prevCount + 1);
        }else if (counter >= limitCounter) {
          setInactiveCounter((prev) => prev - 1);
        }
      }
      if (inactiveCounter <= 1) {
        window.localStorage.removeItem("token")
        window.localStorage.removeItem("user")
        window.localStorage.removeItem("paici.theme")
        window.localStorage.removeItem("paici.modules")
        window.location.replace("/login");
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [counter, inactiveCounter]);
  
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        {counter >= limitCounter && (
          <Inactivity
            inactiveCounter={inactiveCounter}
            setCounter={setCounter}
            setInactiveCounter={setInactiveCounter}
            limitInactive={limitInactive}
          />
        )}
        <AppProvider>
          <Router>
            <div id='wrapper' className="d-flex vh-100 overflow-auto p-0">
              <Routes>
                {/* 1. Rutas Públicas (No llevan Navbar) */}
                <Route path='/' element={<Navigate to="/login" />} />
                <Route path='/login' element={<Login />} />

                {/* 2. CONFIGURACIÓN MAESTRA: Rutas Privadas Anidadas dentro del Navbar */}
                {/* Envolvemos todo el grupo con el PrivateRoute guardando el contenedor Navbar */}
                <Route element={<PrivateRoute component={Navbar} />}>
                  {/* Todas las rutas aquí dentro se renderizarán en el <Outlet /> de Navbar.jsx */}
                  <Route path='/inicio' element={<Inicio />} />
                  <Route path='/ventas' element={<Ventas />} />
                  <Route path='/inventario' element={<Inventario />} />
                  <Route path='/control/interno' element={<ControlInterno />} />
                  <Route path='/presupuesto' element={<Presupuesto />} />
                  <Route path='/margen' element={<Margen />} />
                  <Route path='/administracion' element={<Users />} />
                </Route>

                {/* 3. Ruta de error */}
                <Route path='*' element={<Page404 />} />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
