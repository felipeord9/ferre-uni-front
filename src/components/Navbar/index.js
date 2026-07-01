import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import AuthContext from "../../context/authContext";
import useUser from "../../hooks/useUser";
import { NavBarData } from "./NavbarData";
import Logo from "../../assets/images.png";
import Sidebar from './sideBar';
import Topbar from './topBar';
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ searchResults, setSearchResults ] = useState('');
  const [ activeModuleContent, setActiveModuleContent ] = useState('');
  const navigate = useNavigate();

  const handleClickImg = (e) => {
    if(user.role==='aprobador'){
      return navigate('/solicitudes')
    }else{
      return navigate('/inicio')
    }
  }

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {isLogged && (
        <section className="app-view">
          {/* Panel Lateral */}
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          <main className="main">
            {/* Barra Superior */}
            <Topbar setSidebarOpen={setSidebarOpen} />
            
            {/* Contenedor de Módulos Dinámicos */}
            {/* <section className="content">
              {activeModuleContent}
            </section> */}
          </main>
        </section>
      )}
    </>
  );
}
