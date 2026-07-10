import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import InputPassword from "../../components/InputPassword";
import useUser from "../../hooks/useUser";
import AuthContext from "../../context/authContext";
import Logo from "../../assets/logoRedondo.png";
import Logo2 from "../../assets/images.png";
import { FaUserAlt } from "react-icons/fa";
import * as Icons from 'lucide-react';
import "./styles.css";

export default function Login() {
  const { login, isLoginLoading, hasLoginError, isLogged } = useUser();
  const { user, setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (
      isLogged /* && user.role==='admin' */
     ){
      navigate('/inicio')
    }
  }, [isLogged, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if(email !== '' && password !== ''){
      login({email,password})
    }
  };

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
    <div className='d-flex w-100'>
    {isMobile ?
      <div className="wra d-flex justify-content-center align-items-center h-100 w-100 m-auto">
        <div
          className={`card ${isMobile ? 'p-3':'p-5'} shadow rounded-4 m-auto`}
          style={{ maxWidth: 370, border: '3px solid #018B3D' }}
        >
          <div className="brand-block d-flex flex-column justify-content-center w-100 align-items-center">
            <span className="brand-icon mb-4" style={{width: 200}}>{/* <Icons.ShieldCheck /> */}<img src={Logo2} className='w-100'/></span>
          </div>
          <form
            className="d-flex flex-column gap-2 mt-3"
            style={{ fontSize: 13.5 }}
            onSubmit={handleLogin}
          >
            <div className="input-group ms-0 ps-0 w-100 d-flex">
              <span className="input-group-text ms-0" style={{backgroundColor:'#E64002', color: 'white'}}><i class="bi bi-person-fill"><FaUserAlt  /></i></span>
              <input
                type="text"
                value={email}
                className="form-control form-control-sm shadow-sm border border-2"
                placeholder="Usuario"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <InputPassword
                label="Contraseña"
                password={password}
                setPassword={setPassword}
              />
            </div>
            <button
              type="submit"
              className="text-light btn btn-sm btn-login mt-1 mb-2"
              style={{ backgroundColor: "#018B3D" }}
            >
              <Icons.LogIn size={16} /> Ingresar
            </button>
          </form>
          {isLoginLoading && <div className="loading">Cargando...</div>}
          {hasLoginError && (
            <div className="text-danger text-center mt-2">
              Usuario o contraseña incorrectos
            </div>
          )}
        </div>
      </div>
      :
      <section className="login-view w-100 h-100">
        <div className="login-card">
          <div className="brand-block">
            <span className="brand-icon">{/* <Icons.ShieldCheck /> */}<img src={Logo} className='w-100'/></span>
            <div className='ms-2'>
              <h1>Portal de Analítica y Control Interno</h1>
              <p>Dashboards, control, permisos y módulos en una sola plataforma.</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="stack">
            <div className="input-group ms-0 ps-0 w-100 d-flex">
              <span className="input-group-text ms-0" style={{backgroundColor:'#E64002', color: 'white'}}><i class="bi bi-person-fill"><FaUserAlt  /></i></span>
              <input
                type="text"
                value={email}
                className="form-control form-control-sm shadow-sm border border-2"
                placeholder="Usuario"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <InputPassword
                label="Contraseña"
                password={password}
                setPassword={setPassword}
              />
            </div>
            <button
              type="submit"
              className="text-light btn btn-sm btn-login mt-1"
              style={{ backgroundColor: "#018B3D" }}
            >
              <Icons.LogIn size={16} /> Ingresar
            </button>
          </form>
        </div>
        {isMobile ? 
          <div className='wra'>
  
          </div>
          :
          <div className="login-hero">
            <h2>Una plataforma única para ventas, riesgos, auditoría y seguimiento gerencial.</h2>
            <p></p>
          </div>
        }
      </section>
    }
    </div>
  );
}