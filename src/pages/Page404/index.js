import { useState, useEffect } from "react";
import Logo from "../../assets/images.png";
import './styles.css'

export default function Page404() {
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
    <div className="wra d-flex justify-content-center align-items-center h-100 w-100 m-auto">
      <div
        className={`card ${isMobile ? 'p-3':'p-5'} shadow rounded-4 m-auto`}
        style={{ maxWidth: 370, border: '3px solid #018B3D ' }}
      >
        <div className="mb-3 p-2">
          <img src={Logo} className="w-100" alt="logo" />
        </div>
        <div className="d-flex w-100 flex-column align-items-center justify-content-center">
          <h1 className="text-danger">¡¡ERROR!!</h1>
          <h4>404 - Page no found</h4>
        </div>
      </div>
    </div>
  )
}