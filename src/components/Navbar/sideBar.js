import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/authContext';
import { Link, useNavigate } from "react-router-dom";
import useUser from '../../hooks/useUser';
import { NavBarData } from "./NavbarData";
import * as Icons from 'lucide-react';
import "./styles.css";

export default function Sidebar({isOpen, setIsOpen}) {
  const { user, setUser } = useContext(AuthContext);
  const { isLogged, logout } = useUser();

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
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <header className="sidebar-header">
                <span className="brand-icon2">
                    <Icons.ScanLine size={20} />
                </span>
                <div className='d-flex flex-column'>
                    <strong>Analítica & Control</strong>
                    <small>{user?.role || 'Administrador'}</small>
                </div>
            </header>

            {/* Buscador Global Reactivo */}
            <div className="search-box">
                <Icons.Search size={16} />
                <input 
                /* value={globalSearch} 
                onChange={(e) => setGlobalSearch(e.target.value)}  */
                placeholder="Buscar módulo, usuario o hallazgo" 
                />
            </div>

            {/* Menú de Módulos */}
            <nav className="module-menu">
                {NavBarData.map((item, index) => {
                    if (item.access.includes(user.role)) {
                        return (
                            <li 
                                key={index} 
                                className={item.cName} 
                                onClick={() => {
                                    setIsOpen(false); // Cierra el sidebar en móviles al dar click
                                }}
                            >
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    }
                })}
            </nav>

            {/* Footer con información de sesión */}
            <footer className="sidebar-footer">
                <div className="user-chip">
                    <span className="avatar">
                        {user?.name ? user.name.slice(0, 1).toUpperCase() : 'A'}
                    </span>
                    <div className='ms-3'>
                        <strong>{user?.name}</strong>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setUser(null)}>
                    <Icons.LogOut size={16} /> Salir
                </button>
            </footer>
        </aside>
      )}
    </>
  );
}