import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import InputPassword from "../../components/InputPassword";
import useUser from "../../hooks/useUser";
import AuthContext from "../../context/authContext";
import Logo from "../../assets/logo-el-gran-langostino.png";
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
      isLogged && user.role==='admin' || isLogged && user.role==='usuario'
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
    <section className="login-view w-100 h-100">
      <div className="login-card">
        <div className="brand-block">
          <span className="brand-icon"><Icons.ShieldCheck /></span>
          <div className='ms-2'>
            <h1>Portal de Analítica y Control Interno</h1>
            <p>Dashboards, control, permisos y módulos en una sola plataforma.</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="stack">
          <div className="input-group ms-0 ps-0 w-100 d-flex">
            <span className="input-group-text bg-white ms-0"><i class="bi bi-person-fill"><FaUserAlt  /></i></span>
            <input
              type="text"
              value={email}
              className="form-control form-control-sm shadow-sm"
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
            style={{ backgroundColor: "#007bff" }}
          >
            <Icons.LogIn size={16} /> Ingresar
          </button>
        </form>
      </div>
      <div className="login-hero">
        <h2>Una plataforma única para ventas, riesgos, auditoría y seguimiento gerencial.</h2>
        <p></p>
      </div>
    </section>
  );
}