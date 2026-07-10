import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Topbar({ setSidebarOpen, selectedOption }) {
  /* const { currentModule, config, toggleTheme, reloadActiveModule } = useContext(AppContext); */
  const { theme, toggleTheme } = useContext(AppContext); 
  const location = useLocation();

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
    <header className="topbar">
      {/* Botón para abrir el menú en responsive */}
      {isMobile &&
        <button 
          className="icon-btn" 
          title="Menú" 
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <Icons.Menu size={20} />
        </button>
      }

      <div>
        <h4 className='mb-0'>{selectedOption ? selectedOption.title : 'Inicio'}</h4>
        <p>{selectedOption ? selectedOption.description : 'Resumen ejecutivo del portal.'}</p>
      </div>

      <div className="top-actions">
        {/* BOTÓN DE CAMBIO DE TEMA */}
        <button 
          className="icon-btn" 
          title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"} 
          onClick={toggleTheme}
        >
          {/* Si el tema actual es oscuro muestra el sol, si es claro muestra la luna */}
          {theme === 'dark' ? (
            <Icons.Sun size={20} color="#f59e0b" /> 
          ) : (
            <Icons.Moon size={20} color="#475569" />
          )}
        </button>

        <button className="btn secondary" onClick={(e)=> window.location.reload()}>
          <Icons.RefreshCw size={16} /> Actualizar
        </button>
      </div>
    </header>
  );
}