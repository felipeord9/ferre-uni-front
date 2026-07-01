import React, { createContext, useState, useEffect } from 'react';

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
};