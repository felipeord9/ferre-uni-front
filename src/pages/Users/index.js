import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../../context/AppContext'; // Asegura la ruta de tu contexto general
import { createUser, deleteUserByUsername, findUsers, updateUser } from "../../services/userService";
import { NavBarData } from '../../components/Navbar/NavbarData';
import { getAllAgencies } from '../../services/agencyService';
import AuthContext from '../../context/authContext';
import Chulo from '../../assets/chulo-verde.png'
import { FaUnlock } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import * as Icons from 'lucide-react';
import * as Bs from "react-icons/bs";
import Swal from 'sweetalert2'

export default function Users() {
  // 1. Traemos los datos y funciones globales del AppContext (o simulación del estado antiguo)
  const { 
    allModules,
    toggleModule, 
  } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [agencies, setAgencies] = useState([]);
  const { user, setUser } = useContext(AuthContext);
  const activeAndAllowedModules = allModules.filter(mod => mod.active);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 3. Estados locales para controlar el formulario de "Crear usuario"
  const [userForm, setUserForm] = useState({
    id: '',
    rowId: '',
    name: '',
    username: '',
    role: '',
    password: '',
    permissions: [],
    status: '',
    co:[],
  });

  useEffect(() => {
    getAllUsers();
    getAllAgencies().then((data) => setAgencies(data));
  }, []);

  const getAllUsers = () => {
    setLoading(true)
    findUsers()
      .then(({ data }) => {
        setUsers(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  /* Funcion para crear nuevos usuarios */
  const handleCreateNewUser = (e) => {
    e.preventDefault();
    const info = {
      rowId: userForm.rowId,
      username: userForm.username,
      name: userForm.name,
      password: userForm.password,
      role: userForm.role,
      permissions: userForm.permissions.join(", "),
      status: 'activo',
      co: userForm.co.join(", "),
      createdAt: new Date(),
    }
    createUser(info)
      .then((data) => {
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'El usuario se ha creado correctamente',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
        reloadInfo();
      })
      .catch((error) => {
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de crear el usuario, revisa la información y vuelvelo a intentar.',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK'
        })
        /* setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500) */
      });
  };

  /* Funcion para editar usuarios */
  const handleUpdateUser = (e) => {
    e.preventDefault();
    const info = {
      rowId: userForm.rowId,
      username: userForm.username,
      name: userForm.name,
      password: userForm.password,
      role: userForm.role,
      permissions: userForm.permissions.join(", "),
      status: userForm.status,
      co: userForm.co.join(", "),
    }
    updateUser(userForm.id, info)
      .then((data) => {
        reloadInfo();
        setEditing(false);
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'El usuario se ha editado correctamente',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
      })
      .catch((error) => {
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de editar el usuario, revisa la información y vuelvelo a intentar.',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK'
        })
        /* setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500) */
      });
  };

  const selectedUserToUpdate = (value) => {
    setEditing(true);
    setUserForm({
      ...value,
      co: value.co.split(", "),
      permissions: value.permissions.split(", ")
    })
  }

  const cancelEditUser = (e) => {
    e.preventDefault();
    reloadInfo();
    setEditing(false);
  }

  /* Funcion para eliminar usuarios */
  const deleteUser = (value) => {
    Swal.fire({
      icon:'warning',
      title:'¡Estas segur@?',
      text: `Se va a proceder a borrar el usuario: ${value}`,
      showConfirmButton: true,
      confirmButtonColor: 'red',
      confirmButtonText: 'Borrar',

      showDenyButton: true,
      denyButtonColor: 'blue',
      denyButtonText: 'Cancelar'
    })
    .then(({ isConfirmed, isDenied })=>{
      if(isConfirmed){
        deleteUserByUsername(value)
          .then(()=>{
            Swal.fire({
              imageUrl: Chulo,
              imageWidth: 100,
              title: '¡Correcto!',
              text: 'El usuario se ha eliminado del sistema',
              showConfirmButton: false,
              timer: 5000,
              customClass: {
                image: 'mb-0 mt-3 pb-0',
                title: 'mt-1 pt-0'
              }
            })
            reloadInfo();
          })
          .catch(()=>{
            Swal.fire({
              icon: 'warning',
              title: '¡ERROR!',
              text: 'Ha ocurrido un error al momento de eliminar el usuario, vuelvelo a intentar mas tarde.',
              showConfirmButton: true,
              confirmButtonColor: 'red',
              confirmButtonText: 'OK'
            })
          })
      }
    })
  }

  /* Funcion para borrar los campos */
  const reloadInfo = () => {
    setUserForm({
      id: '',
      rowId:'',
      co: [],
      name: '',
      password: '',
      permissions: [],
      role: '',
      username: '',
    })
    getAllUsers();
  }

  /* Funcion para mostrar el texto de la contraseña */
  const togglePasswordVisibility = useCallback((e) => {
    setShowPassword(!showPassword);
  });

  const handlePermissionChange = (moduleId) => {
    setUserForm(prev => {
      const isChecked = prev.permissions.includes(moduleId);
      const newPermissions = isChecked
        ? prev.permissions.filter(id => id !== moduleId) // Quitar permiso
        : [...prev.permissions, moduleId];              // Añadir permiso
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleCoChange = (moduleId) => {
    setUserForm(prev => {
      const isChecked = prev.co.includes(moduleId);
      const newCo = isChecked
        ? prev.co.filter(id => id !== moduleId) // Quitar permiso
        : [...prev.co, moduleId];              // Añadir permiso
      return { ...prev, co: newCo };
    });
  };

  // Helper para traducir los IDs de permisos a nombres legibles
  const permissionName = (id) => {
    const mod = activeAndAllowedModules.find(m => m.id === id);
    return mod ? mod.name : id;
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
    <div className="p-2 stack gap-2">

      {/* Grid de Formularios */}
      <div className="panel w-100 mb-4">
        <div className="panel-head"><h2>Crear usuario</h2></div>
        <div className="panel-body">
          <form onSubmit={editing ? handleUpdateUser : handleCreateNewUser} className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label w-100">Número identificación
                <input 
                  required 
                  value={userForm.rowId}
                  type='number'
                  inputMode='numeric'
                  pattern="[0-9]"
                  onChange={e => setUserForm({...userForm, rowId: e.target.value})}
                />
              </label>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label w-100">Nombre
                <input 
                  required 
                  value={userForm.name}
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                />
              </label>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label w-100">Rol
                <select 
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value})}
                >
                  <option selected disabled value="">
                    -- Seleccione un rol --
                  </option>
                  <option value='analista'>Analista</option>
                  <option value='consulta'>Consulta</option>
                  <option value='admin'>Administrador</option>
                </select>
              </label>
            </div>

            <div className={`${editing ? 'col-12 col-md-4' : 'col-12 col-md-6'}`}>
              <label className="form-label w-100">Usuario
                <input 
                  required 
                  value={userForm.username}
                  onChange={e => setUserForm({...userForm, username: e.target.value})}
                />
              </label>
            </div>

            <div className={`${editing ? 'col-12 col-md-4' : 'col-12 col-md-6'}`}>
              <label className="form-label w-100">Contraseña
              <div className="d-flex align-items-center position-relative">
                <input
                  value={userForm.password}
                  type={showPassword ? "text" : "password"}
                  className="shadow-sm"
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  style={{ paddingRight: 33 }}
                  minLength={4}
                  placeholder='**********'
                  autoComplete="off"
                  required = {editing ? false : true}
                />
                <span
                  className="position-absolute"
                  onClick={togglePasswordVisibility}
                  style={{ fontSize: 18, right: 10, cursor: "pointer" }}
                >
                  {showPassword ? <Bs.BsEye /> : <Bs.BsEyeSlash />}
                </span>
              </div>
                {/* <input 
                  type="password"
                  required 
                  value={userForm.password}
                  placeholder='**********'
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                /> */}
              </label>
            </div>

            {editing &&
              <div className="col-12 col-md-4">
                <label className="form-label w-100">Estado
                  <select 
                    value={userForm.status}
                    onChange={e => setUserForm({...userForm, status: e.target.value})}
                  >
                    <option selected disabled value="">
                      -- Seleccione el estado --
                    </option>
                    <option value='activo'>Activo</option>
                    <option value='inactivo'>Inactivo</option>
                  </select>
                </label>
              </div>
            }
            
            <div className="col-12 col-md-6">
              <label className="mb-2 d-block fw-bold">Permisos asignados a los módulos</label>
              {/* Contenedor de checkboxes optimizado a lo ancho */}
              <div className={`check-list ${isMobile ? 'p-1' : 'p-3'} rounded`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="row">
                  {activeAndAllowedModules
                    .filter(m => {
                      if (m.title === "Administración") {
                        return userForm.role === 'admin';
                      }
                      return true; // Los demás módulos siempre se muestran
                    })
                    .map(m => (
                      <div key={m.id} className="col-12 col-sm-6 col-md-6 mb-2">
                        <label className="check d-flex align-items-center" style={{ gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            value={m.title} 
                            checked={userForm.permissions.includes(m.title)}
                            onChange={() => handlePermissionChange(m.title)}
                          /> 
                          <span className="small">{m.title}</span>
                        </label>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="mb-2 d-block fw-bold">Permisos asignados por centros de operación</label>
              {/* Contenedor de checkboxes optimizado a lo ancho */}
              <div className={`check-list ${isMobile ? 'p-1' : 'p-3'} rounded`} style={{ maxHeight: '230px', overflowY: 'auto' }}>
                <div className="row">
                  {agencies.map(m => (
                    <div key={m.id} className="col-12 col-sm-6 col-md-4 mb-2">
                      <label className="check d-flex align-items-center" style={{ gap: '8px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          className="form-check-input"
                          value={m.id} 
                          checked={userForm.co.includes(m.id)}
                          onChange={() => handleCoChange(m.id)}
                        /> 
                        <span className="small">{m.id}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {editing ? 
              <div className={`${isMobile ? 'row gap-2 mt-3 w-100 d-flex me-0 pe-0 ms-0 ps-0' : 'row'}`}>
                <div className="col-12 col-md-6" >
                  <button className="btn btn-primary w-100 py-2" type="submit">
                    <Icons.UserCog size={18} className="me-2" /> {isMobile ? 'Editar usuario' : 'Editar usuario en el sistema'} 
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button className="btn btn-danger w-100 py-2" onClick={(e)=>cancelEditUser(e)}>
                    <Icons.X size={18} className="me-2" /> Cancelar 
                  </button>
                </div>
              </div>
              :
              <div className="col-12 mt-0 pt-0">
                <button className="btn btn-primary w-100 py-2" type="submit">
                  <Icons.UserPlus size={18} className="me-2" /> {isMobile ? 'Crear usuario' : 'Crear nuevo usuario en el sistema'} 
                </button>
              </div>
            }
          </form>
        </div>
      </div>

      {/* Tabla 1: Usuarios y permisos */}
      <div className="panel">
        <div className="panel-head d-flex justify-content-between align-items-center">
          <h2>Usuarios y permisos</h2>
          <span className="status badge bg-secondary">{users.length}</span>
        </div>
        <div className="table-wrap table-responsive">
          <table className="v-middle">
            <thead>
              <tr><th>Usuario</th><th>Rol</th><th>Permisos</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.username}>
                  <td>
                    <strong>{u.name}</strong><br/>
                    <span className="muted small">{u.username}</span>
                  </td>
                  <td><span className="badge bg-info text-dark">{u.role}</span></td>
                  <td>
                    {u.permissions ? u.permissions : 'Ninguno'}
                  </td>
                  <td>
                    <span className={`status badge ${u.status === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                      {u.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {u.username !== 'admin' && (
                      <div className='d-flex gap-2'>
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={(e) => selectedUserToUpdate(u)}
                        >
                          <Icons.Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={(e) => deleteUser(u.username)}
                        >
                          <Icons.Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2: Gestión de módulos */}
      <div className="panel mb-4">
        <div className="panel-head d-flex justify-content-between align-items-center">
          <h2>Gestión de módulos</h2>
          <span className="status badge bg-secondary">{allModules.length}</span>
        </div>
        <div className="table-wrap table-responsive">
          <table className="v-middle">
            <thead>
              <tr><th>Módulo</th><th>Versión</th><th>Estado</th><th>Ruta</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {allModules.map(m => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.title}</strong><br/>
                  </td>
                  <td>{m.version || '1.0.0'}</td>
                  <td>
                    <span className={`status badge ${m.active === false ? 'bg-danger' : 'bg-success'}`}>
                      {m.active === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </td>
                  <td><code>{m.path || ''}</code></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={() => toggleModule(m.id)}
                      >
                        {m.active === false ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}