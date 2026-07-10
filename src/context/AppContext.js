import React, { createContext, useState, useEffect } from 'react';
// 1. Importamos el array estático de módulos como la base inicial de datos
import { NavBarData as staticModules } from '../components/Navbar/NavbarData'; 

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- SECCIÓN 1: LÓGICA DEL TEMA (LIGHT / DARK) ---
  const [theme, setTheme] = useState(() => {
    // Inicializar buscando en LocalStorage, por defecto es 'light'
    const savedTheme = localStorage.getItem('paici.theme');
    return savedTheme ? savedTheme : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement; // Accede a la etiqueta <html>
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('paici.theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };


  // --- SECCIÓN 2: LÓGICA DE MÓDULOS DINÁMICOS (ACTIVAR/DESACTIVAR) ---
  // Inicializamos el estado dinámico. Si el usuario ya apagó/encendió módulos antes, 
  // los recuperamos de LocalStorage; si es la primera vez, usamos el archivo estático.
  const [allModules, setAllModules] = useState(() => {
    const savedModules = localStorage.getItem('paici.modules');
    if (savedModules) {
      try {
        const parsed = JSON.parse(savedModules);
        
        // ⚠️ TRUCO AVANZADO RECT-ROUTER/JSX:
        // Como JSON.stringify borra los componentes de iconos (<FiHome />, etc.),
        // hacemos un mapeo veloz para re-inyectar los iconos originales desde staticModules.
        return parsed.map(savedMod => {
          const original = staticModules.find(m => m.id === savedMod.id);
          return original ? { ...savedMod, icon: original.icon } : savedMod;
        });
      } catch (e) {
        return staticModules;
      }
    }
    return staticModules;
  });

  // Cada vez que cambie el estado de un módulo, guardamos la configuración en LocalStorage
  useEffect(() => {
    // Almacenamos la estructura básica (sin romper los objetos del JSX del Icono)
    const secureModulesToSave = allModules.map(({ icon, ...rest }) => rest);
    localStorage.setItem('paici.modules', JSON.stringify(secureModulesToSave));
  }, [allModules]);

  // 🎯 Función encargada de buscar el módulo por ID e invertir su propiedad 'active'
  const toggleModule = (moduleId) => {
    setAllModules((prevModules) =>
      prevModules.map((mod) => {
        if (mod.id === moduleId) {
          return { ...mod, active: !mod.active };
        }
        return mod;
      })
    );
  };


  // --- RETORNO DEL CONTEXTO ---
  return (
    <AppContext.Provider value={{ 
      theme, 
      toggleTheme, 
      allModules,     // 👈 Expuesto para Sidebar, Inicio y Users
      toggleModule    // 👈 Expuesto para que el botón de Users lo ejecute
    }}>
      {children}
    </AppContext.Provider>
  );
};

/* import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Inicializar el tema buscando en LocalStorage, si no existe por defecto es 'light'
  const [theme, setTheme] = useState('light');

  // 2. Cada vez que el tema cambie, añadimos/quitamos la clase en el HTML y guardamos en LocalStorage
  useEffect(() => {
    const root = window.document.documentElement; // Accede a la etiqueta <html>
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('paici.theme', theme);
  }, [theme]);

  // 3. Función para alternar el estado
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}; */