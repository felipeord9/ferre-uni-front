import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import AuthContext from '../../context/authContext'; 
import KpiCard from '../../components/KpiCard';
import { NavBarData } from "../../components/Navbar/NavbarData";
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import * as Icons from 'lucide-react';

export default function Inicio() {
  const { 
    findings, 
    allModules
  } = useContext(AppContext);

  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isLogged, logout } = useUser();

  const openFindings = 3; // Puedes conectarlo a un estado de hallazgos si lo requieres
  const allowedModules = allModules.filter(mod => mod.active && user.permissions.includes(mod.title));
  /* const allowedModules = NavBarData.filter(mod => mod.access.includes(user?.role)); */

  // 1. Lógica calculada en cada render (Equivalente al inicio de la función original)
  /* const openFindings = findings.filter(item => item.status !== 'Cerrado').length; */

  // Helper para renderizar iconos dinámicamente desde el string del objeto module
  const DynamicIcon = ({ name }) => {
    const PascalName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const IconComponent = Icons[PascalName] || Icons.Square;
    return <IconComponent size={24} />;
  };

  return (
    <>
      {isLogged && (
        <div className="container-fluid p-2">
          {/* Grid de KPIs superiores */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <KpiCard title="Módulos disponibles" value={allowedModules.length} subtitle="Activos para tu perfil" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KpiCard title="Rol activo" value={user?.role || 'Administrador'} subtitle={user?.permissions} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KpiCard title="Usuario iniciado" value={user.username} subtitle={user.name} />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KpiCard title="Base de datos" value={'Local'} subtitle={'PostgreSql'} />
            </div>
          </div>

          {/* Grid de Accesos Directos a Módulos */}
          <div className="row g-3">
            {allowedModules.map((module, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <button 
                  className="module-card w-100 p-4 text-start rounded shadow-sm position-relative"
                  onClick={() => navigate(module.path)}
                  style={{ transition: 'all 0.2s' }}
                >
                  <div className="d-flex align-items-start mb-3">
                    <div className="p-2 rounded bg-success bg-opacity-10 text-success me-3" style={{fontSize: 24}}>
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="h5 fw-bold mb-1">{module.title}</h3>
                      <p className=" small mb-0">{module.description || 'Módulo disponible'}</p>
                    </div>
                  </div>
                  
                  <span className={`position-absolute bottom-0 end-0 m-3`}>
                    v{module.version}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}