import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useUser from '../../hooks/useUser';
import { sendRecovery } from '../../services/authService';
import Logo from '../../assets/logo-el-gran-langostino.png'
import { MdOutlineMarkEmailRead } from "react-icons/md";
import './styles.css'

export default function SendRecoveryPassword() {
  const { isLogged } = useUser()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isLogged) navigate('/inicio');
  }, [isLogged, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault()
    sendRecovery(email)
      .then((data) => {
        Swal.fire({
          title: "¡CORECTO!",
          text: "El correo de recuperación fue enviado de manera exitosa",
          icon: 'success',
          confirmButtonText: "Aceptar"
        })
        navigate('/login')
      })
      .catch((error) => {
        setError(error)
        setTimeout(() => setError(''), 2500)
      })
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
    <div className='d-flex justify-content-center align-items-center h-100 w-100 m-auto'>
      <div className={`card ${isMobile ? 'p-3':'p-5'} shadow rounded-4 m-auto`} style={{ maxWidth: 370, border: '3px solid #007bff' }}>
        <div className='mb-3 p-2'>
          <img src={Logo} className='w-100 logo' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-3' style={{fontSize: 13.5}} onSubmit={handleSubmit}>
          <div className="input-group ms-0 ps-0 w-100 d-flex" style={{fontSize: 13.5}}>
            <span className="input-group-text bg-white ms-0"><i class="bi bi-person-fill"><MdOutlineMarkEmailRead /></i></span>
            <input
              type='email'
              value={email}
              placeholder='Email'
              className='form-control form-control-sm shadow-sm'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            type='submit'
            className='text-light btn btn-sm' 
            style={{ backgroundColor: '#007bff'}}
          >
            Obtener token de recuperación
          </button>
        </form>
        <span className='text-center text-danger text-rowrap w-100 m-0 my-2' style={{height: 0}}>{error.message}</span>
        <Link to="/login" className={`text-decoration-none text-center ${isMobile ? 'mt-0' : 'mt-3'} w-100`}>Volver al login</Link>
      </div>
    </div>
  )
}