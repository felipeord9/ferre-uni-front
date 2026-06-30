import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import {
  findOnePlate,
  findByPlate,
  createPlate,
  updatePlate,
  deletePlate,
} from "../../services/plateService";
import Swal from 'sweetalert2'

function ModalAddPlates({ plate, setPlate, openModal, setOpen, loadData }) {
  const [info, setInfo] = useState({
    plate: "",
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
    findByPlate(info.plate)
    .then(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCION!',
        text:'Esta placa ya se encuentra registrada en nuestra base de datos',
        timmer: 6000
      })
    }).catch(()=>{
      createPlate(info)
      .then((data) => {
          Swal.fire({
            icon:'success',
            title:'¡CORRECTO!',
            text:'Se ha creado con éxito la placa',
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
          text:'Ha ocurrido un error al momento de crear la placa. Intentalo mas tarde. Si el problema persiste comunícate con el área de sistemas.',
          timer: 5000
        })
      })
    })
  };

  const handlerUpdate = (e) => {
    e.preventDefault();
    findByPlate(plate.plate)
    .then(()=>{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCION!',
        text:'Esta placa ya se encuentra registrada en nuestra base de datos',
        timmer: 6000
      })
    })
    .catch(()=>{
      updatePlate(plate.id, plate)
      .then((data) => {
        Swal.fire({
          icon:'success',
          title:'¡CORRECTO!',
          text:'Se ha actualizado con éxito la placa',
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
          text:'Ha ocurrido un error al momento de actualizar la placa. Intentalo mas tarde. Si el problema persiste comunícate con el área de sistemas.',
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
          {plate ? "Actualizar" : "Crear Nueva"} placa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form
          encType="multipart/form-data"
          onSubmit={plate ? handlerUpdate : handlerSubmit}
        >
          <div className="d-flex flex-column">
            <label>Placa</label>
            <input
              id="plate"
              type="text"
              value={plate ? plate.plate : info.plate}
              autoComplete="off"
              className="form-control form-control-sm"
              onChange={(e) =>
                plate ?
                setPlate({...plate, plate: e.target.value.toUpperCase()}) :
                setInfo({
                  ...info,
                  plate: e.target.value.toUpperCase(),
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

export default ModalAddPlates;
