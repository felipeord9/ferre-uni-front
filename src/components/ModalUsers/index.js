import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from 'sweetalert2'
import { createUser, updateUser } from "../../services/userService";

export default function ModalUsers({
  user,
  setUser,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [info, setInfo] = useState({
    rowId: "",
    username:'',
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState('')
 
  useEffect(() => {
    if(user) {
      setInfo({
        rowId: user?.rowId,
        username:user?.username,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value,
    });
  };

  const handleCreateNewUser = (e) => {
    e.preventDefault();
    createUser(info)
      .then((data) => {
        setShowModal(!showModal)
        reloadInfo();
        Swal.fire({
          title: '¡Correcto!',
          text: 'El usuario se ha creado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
        cleanForm()
      })
      .catch((error) => {
        setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500)
      });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    updateUser(user.id, info)
      .then((data) => {
        cleanForm()
        setShowModal(!showModal)
        reloadInfo();
        Swal.fire({
          title: '¡Correcto!',
          text: 'El usuario se ha actualizado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      })
      .catch((error) => {
        setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500)
      });
  };

  const cleanForm = () => {
    setInfo({
      rowId: "",
      name: "",
      email: "",
      username: '',
      password: "",
      role: "",
    })
  }

  return (
    <Modal show={showModal} style={{ fontSize: 11 }} centered>
      <Modal.Header>
        <Modal.Title className="text-danger">
          {user ? "Actualizar" : "Crear"} Usuario
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="container h-100">
          <form onSubmit={user ? handleUpdateUser : handleCreateNewUser}>
            <div>
              <div>
                <label className="fw-bold">Rol</label>
                <select
                  id="role"
                  value={info.role}
                  className="form-select form-select-sm"
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value="">
                    -- Seleccione un rol --
                  </option>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="fw-bold">Identificador</label>
                <input
                  id="rowId"
                  type="text"
                  value={info.rowId}
                  className="form-control form-control-sm"
                  maxLength={10}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Nombre</label>
                <input
                  id="name"
                  type="text"
                  value={info.name.toUpperCase()}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Correo</label>
                <input
                  id="email"
                  type="email"
                  value={info.email}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Username</label>
                <input
                  id="username"
                  type="text"
                  value={info.username}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              {!user && (
                <div>
                  <label className="fw-bold">Contraseña</label>
                  <input
                    id="password"
                    type="text"
                    value={info.password}
                    className="form-control form-control-sm"
                    minLength={4}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
              )}
            </div>
            <div className="d-flex w-100 mt-2">
              <span 
                className="text-center text-danger w-100 m-0"
                style={{height: 15}}
              >
                {error}
              </span>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button type="submit" variant="success">
                {user ? "Guardar Cambios" : "Guardar"}
              </Button>
              <Button variant="secondary" onClick={(e) => {
                setShowModal(false)
                cleanForm()
                setUser(null)
              }}>
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
}
