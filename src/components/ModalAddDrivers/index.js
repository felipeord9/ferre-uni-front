import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  findOneDriver,
  findBycedula,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../../services/driverService";
import Swal from 'sweetalert2'

function ModalAddDrivers({ driver, setDriver, openModal, setOpen, loadData }) {
  const [info, setInfo] = useState({
    rowId: "",
    name: "",
  });
  
  const handlerChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value,
    });
  };

  const handlerSubmit = (e) => {
    e.preventDefault();
    findBycedula(info.rowId)
    .then(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCION!',
        text:'Esta cédula ya se encuentra registrada en nuestra base de datos',
        timmer: 6000
      })
    }).catch(()=>{
      createDriver(info)
      .then((data) => {
          Swal.fire({
            icon:'success',
            title:'¡CORRECTO!',
            text:'Se ha creado con éxito el conductor',
            timer: 5000
          })
          .then(()=>{
            loadData();
            closeModal();
          })
      })
      .catch(()=>{
        Swal.fire({
          icon:'error',
          title:'¡ERROR!',
          text:'Ha ocurrido un error al momento de crear el conductor. Intentalo mas tarde. Si el problema persiste comunícate con el área de sistemas.',
          timer: 5000
        })
      })
    })
  };

  const handlerUpdate = (e) => {
    e.preventDefault();
    findBycedula(driver.rowId)
    .then(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCION!',
        text:'Esta cédula ya se encuentra registrada en nuestra base de datos',
        timmer: 6000
      })
    })
    .catch(()=>{
      updateDriver(driver.id, driver)
      .then((data) => {
        Swal.fire({
          icon:'success',
          title:'¡CORRECTO!',
          text:'Se ha actualizado con éxito el conductor',
          timer: 5000
        })
        .then(()=>{
          loadData();
          closeModal();
        })
      })
      .catch(()=>{
        Swal.fire({
          icon:'error',
          title:'¡ERROR!',
          text:'Ha ocurrido un error al momento de actualizar el conductor. Intentalo mas tarde. Si el problema persiste comunícate con el área de sistemas.',
          timer: 5000
        })
      })
    })
  };

  const closeModal = () => {
    setOpen(!openModal);
    setInfo({
      rowId: "",
      name: "",
    });
  };

  return (
    <Modal show={openModal} onHide={closeModal} centered>
      <Modal.Header className="bg-primary text-light">
        <Modal.Title className="fs-5">
          {driver ? "Actualizar" : "Crear Nuevo"} Conductor
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form
          encType="multipart/form-data"
          onSubmit={driver ? handlerUpdate : handlerSubmit}
        >
          <div className="d-flex flex-column">
            <label>Cédula</label>
            <input
              id="rowId"
              type="number"
              value={driver ? driver.rowId : info.rowId}
              className="form-control form-control-sm"
              min={10000000}
              max={9999999999}
              onChange={(e) => driver ? setDriver({...driver, rowId: e.target.value}) : handlerChange(e)}
              autoComplete="off"
              required
            />
          </div>
          <div className="d-flex flex-column">
            <label>Nombre</label>
            <input
              id="name"
              type="text"
              value={driver ? driver.name : info.name}
              autoComplete="off"
              className="form-control form-control-sm"
              onChange={(e) =>
                driver ?
                setDriver({...driver, name: e.target.value.toUpperCase()}) :
                setInfo({
                  ...info,
                  name: e.target.value.toUpperCase(),
                })
              }
              required
            />
          </div>
          <hr />
          <div className="d-flex flex-row justify-content-end gap-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default ModalAddDrivers;
