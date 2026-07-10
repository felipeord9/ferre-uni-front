import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/authContext';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from '../../context/AppContext';
import Logo from "../../assets/logoRedondo.png";
import useUser from '../../hooks/useUser';
import { NavBarData } from "./NavbarData";
import * as Icons from 'lucide-react';
import "./styles.css";

export default function Sidebar({isOpen, setIsOpen, selectedOption, setSelectedOption}) {
  const { allModules } = useContext(AppContext);
  const { user, setUser } = useContext(AuthContext);
  const { isLogged, logout } = useUser();
  const location = useLocation();
  const [ globalSearch, setGlobalSearch ] = useState('');
  const [ options, setOptions ] = useState(allModules.filter(mod => mod.active && user.permissions.includes(mod.title)));
  const activeAndAllowedModules = allModules.filter(mod => mod.active && user.permissions.includes(mod.title));
  const navigate = useNavigate();

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

    //funcion para editar el sidebar cada que se cambia un modulo de estado
    useEffect(() => {
      const filtro = allModules.filter(mod => mod.active && user.permissions.includes(mod.title))
      setOptions(filtro)
    },[allModules]);

    const handleChange = (e) => {
        const { value } = e.target
        if(value !== "") {
          const filter = activeAndAllowedModules.filter((elem) => {
            if(
              elem.title.toLowerCase().includes(value.toLowerCase())
            ) {
              return elem
            }
          })
          if(filter.length > 0) {
            setOptions(filter)
          } else {
            setOptions([])
         }
        } else {
          setOptions(activeAndAllowedModules)
        }
        setGlobalSearch(value)
    }

  return (
    <>
      {isLogged && (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <header className="sidebar-header">
                <span className="brand-icon ms-1">
                    {/* <Icons.ScanLine size={20} /> */}
                    <img src={Logo} className='w-100'/>
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
                    value={globalSearch} 
                    onChange={(e) => handleChange(e)} 
                    placeholder="Buscar módulo" 
                />
            </div>

            <nav className="module-menu">
                {options.map((module) => {
                    const isActive = location.pathname === module.path;
                    const IconComponent = Icons[module.icon] || Icons.Square;
                    return (
                        <button
                        key={module.id}
                        className={`gap-0 module-menu-item ${isActive ? 'active' : ''} gap-0 text-decoration-none`}
                        onClick={() => {
                            navigate(module.path)
                            setSelectedOption(module)
                            setIsOpen(false); // Cierra el sidebar en móviles al dar click
                        }}
                        >
                          <label
                            className='fw-blod'
                            style={{fontSize: 24, color: 'white'}}
                          >{module.icon}</label>
                          <span className='fw-bold'>{module.title}</span>
                          <span className={`bottom-0 end-0`} style={{fontSize: 13}}>
                            v{module.version}
                          </span>
                      </button>
                    );
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
                <button className="btn btn-primary" onClick={(e) => logout()}>
                    <Icons.LogOut size={16} /> Salir
                </button>
            </footer>
        </aside>
      )}
    </>
  );
}