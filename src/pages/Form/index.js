import { useEffect, useState, useContext, useRef } from "react";
import {
  createLavado,
  deleteLavado,
  findOneLavado,
  updateLavado,
} from "../../services/washService";
import { findBycedula, findDrivers } from '../../services/driverService';
import { findByPlate, findPlates } from '../../services/plateService';
import { sendMail, sendMail2 } from "../../services/mailService";
import AuthContext from "../../context/authContext";
import ComboBox from "../../components/ComboBox";
import { sendEvidence, verificarArchivo } from "../../services/evidence";
import { Modal } from "react-bootstrap";
import Icono from "../../assets/logoRedondo.png";
import Webcam from "react-webcam";
import { useParams } from "react-router-dom";
import { config } from "../../config";
import Swal from "sweetalert2";
import "./styles.css";

export default function Form() {
  const { user, setUser } = useContext(AuthContext);
  const [driverSeleccionado, setDriverSeleccionado] = useState(null);
  const [suggestionsDriver, setSuggestionsDriver] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [plates, setPlates] = useState([]);
  const [platesSeleccionado, setPlateSeleccionado] = useState(null);
  const [suggestionsPlates, setSuggestionsPlate] = useState([]);
  const [typeEvidence, setTypeEvidence] = useState(null);
  const refDriver = useRef();
  const refPlate = useRef();
  const { id } = useParams();

  const [search, setSearch] = useState({
    idDriver: "",
    name: "",
    plate: "",
    observations: "",
    order: "",
    createdAt:'',
  });

  const [info, setInfo] = useState({})

  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState(false);
  const selectBranchRef = useRef();
  const [factura, setFactura] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const webcamRef = useRef(null);
  const ImgFirmaRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Foto en previsualización

  useEffect(() => {
    findDrivers().then(({data}) => (setDrivers(data), setSuggestionsDriver(data)));
    findPlates().then(({data}) => (setPlates(data), setSuggestionsPlate(data)));
    if(id){
      findOneLavado(id)
      .then(async({data})=>{
        var placa = data.plate
        const foto = `bill_${data.id}.jpg`
        const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
        const video = `evidence_${data.id}.webm`
        const directVideo = `${config.apiUrl2}/upload/obtener-archivo/${video}`
        const url = await verificarArchivo(directVideo)
        const url2 = await verificarArchivo(directFoto)
        setPreviewPhoto(url2)
        setPreviewUrl(url)
        setSearch({
          idDriver: data.rowId,
          observations: data.observations,
          createdAt: (data.createdAt),
        })
        findBycedula(data.rowId)
        .then(({data})=>{
          setDriverSeleccionado(data)
          findByPlate(placa)
          .then(async({data})=>{
            setPlateSeleccionado(data)
          })
        })
      })
    }
  }, []);

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener("resize", handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Formatear tiempo como mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  
  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };
  
  //manejador de funciones para drivers
  //encontrar driver por cedula
  const findById = (e) => {
    const { value } = e.target;
    const item = drivers.find((elem) => parseInt(elem.rowId) === parseInt(value));

    if (item) {
      setDriverSeleccionado(item);
    } else {
      setDriverSeleccionado(null);
    }
  };
  //manejador del input para el driver
  const handlerChangeDriver = (e) => {
    const { value } = e.target;
    setDriverSeleccionado(null);
    if (value !== "" && value !== null) {
      const filter = drivers.filter((elem) =>
        elem.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestionsDriver(filter);
    } else {
      setSuggestionsDriver(drivers);
    }
    refDriver.current.selectedIndex = 0;
    setSearch({
      ...search,
      name: value
    })
  };
  //funcion para buscar producto por descripcion cuando lo seleccionen en el select
  const findDriverByDescrip = (e) => {
    const { value } = e.target;
    const item = drivers.find((elem)=> elem.name.toLowerCase() === value.toLowerCase());
    if(item){
      setDriverSeleccionado(item)
    }else{
      setDriverSeleccionado(null)
    }
  }

  //manejador de funciones para placas
  //manejador del input para el driver
  const handlerChangePlate = (e) => {
    const { value } = e.target;
    setPlateSeleccionado(null);
    if (value !== "" && value !== null) {
      const filter = plates.filter((elem) =>
        elem.plate.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestionsPlate(filter);
    } else {
      setSuggestionsPlate(plates);
    }
    refPlate.current.selectedIndex = 0;
    setSearch({
      ...search,
      plate: value
    })
  };
  //funcion para buscar producto por descripcion cuando lo seleccionen en el select
  const findPlaterByDescrip = (e) => {
    const { value } = e.target;
    const item = plates.find((elem)=> elem.plate.toLowerCase() === value.toLowerCase());
    if(item){
      setPlateSeleccionado(item)
    }else{
      setPlateSeleccionado(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      driverSeleccionado !== null && evidence !== null && factura !== null
    ) {
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se registrará el servicio de lavado",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          var body = {
            rowId: driverSeleccionado.rowId,
            driverName: driverSeleccionado.name,
            plate: platesSeleccionado.plate,
            createdAt: new Date(),
            createdBy: user.name,
            observations: search.observations,
          };
          createLavado(body)
            .then(({ data }) => {
              const f = new FormData();
              f.append("factura", factura, "factura.jpg");
              f.append("evidence", evidence, "evidence.webm");
              f.append("id", data.id);
              f.append("info", JSON.stringify(body));
              sendEvidence(f)
                .then(() => {
                  setLoading(false);
                  Swal.fire({
                    title: "¡Creación exitosa!",
                    text: `
                        El servicio de lavado se ha realizado satisfactoriamente.
                      `,
                    icon: "success",
                    confirmButtonText: "Aceptar",
                  }).then(() => {
                    window.location.reload();
                  });
                })
                .catch(() => {
                  setLoading(false);
                  deleteLavado(data.id);
                  Swal.fire({
                    title: "¡Ha ocurrido un error!",
                    text: `
                      Hubo un error al momento de guardar la evidencia o factura del registro de servicio de lavado, intente de nuevo.
                      Si el problema persiste por favor comuniquese con el área de sistemas.`,
                    icon: "error",
                    confirmButtonText: "Aceptar",
                  });
                });
            })
            .catch((err) => {
              setLoading(false);
              /* deleteOrder(data.id); */
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: `
                  Hubo un error al momento de registrar el servicio de lavado, intente de nuevo.
                  Si el problema persiste por favor comuniquese con el área de sistemas.`,
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "¡ATENCIÓN!",
        text: "Debes llenar todos los campos de este formulario para poder hacer el registro del servicio de lavado.",
        timer: 8000,
        showConfirmButton: false,
      });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (
      driverSeleccionado !== null && platesSeleccionado !== null
    ) {
      Swal.fire({
        title: "¿Está seguro?",
        text: "Se actualizará el servicio de lavado",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          setLoading(true);
          var body = {
            rowId: driverSeleccionado.rowId,
            driverName: driverSeleccionado.name,
            plate: platesSeleccionado.plate,
            observations: search.observations,
          };
          updateLavado(id, body)
            .then(({ data }) => {
              setLoading(false);
              Swal.fire({
                title: "¡Actualización exitosa!",
                text: `
                  El servicio de lavado se ha actualizado satisfactoriamente.
                `,
                icon: "success",
                confirmButtonText: "Aceptar",
              }).then(() => {
                window.location.reload();
              });
            })
            .catch((err) => {
              setLoading(false);
              Swal.fire({
                title: "¡Ha ocurrido un error!",
                text: `
                  Hubo un error al momento de actualizar el servicio de lavado, intente de nuevo.
                  Si el problema persiste por favor comuniquese con el área de sistemas.`,
                icon: "error",
                confirmButtonText: "Aceptar",
              });
            });
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "¡ATENCIÓN!",
        text: "Debes llenar todos los campos de este formulario para poder hacer el registro del servicio de lavado.",
        timer: 8000,
        showConfirmButton: false,
      });
    }
  };

  const refreshForm = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) window.location.reload();
    });
  };

  /* Logica para tomar la foto de evidencia */
  //se agrega toda esta parte
  const camaraRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const startCamera = async () => {
    try {
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });
      setStream(backStream);
      if (camaraRef.current) {
        camaraRef.current.srcObject = backStream;
      }
    } catch (err) {
      alert("❌ Cámara trasera no disponible. Probando cámara frontal...");
      try {
        const frontStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setStream(frontStream);
        if (camaraRef.current) {
          camaraRef.current.srcObject = frontStream;
        }
      } catch (fallbackErr) {
        console.error("❌ No se pudo acceder a ninguna cámara:", fallbackErr);
        setError("No se encontró ninguna cámara en el dispositivo.");
      }
    }
  };
  //

  // Abrir el modal para un campo específico
  const openModal = (e) => {
    setShowModal(true);
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Cerrar el modal
  const closeModal = (e) => {
    setShowModal(false);

    /* Se agrega esta parte */
    // 🔴 Detener la cámara después de capturar la imagen
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (camaraRef.current) {
      camaraRef.current.srcObject = null;
    }
    /*  */
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Capturar la foto y guardarla en el estado correspondiente
  const capturePhoto = () => {
    const video = camaraRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && canvas.getContext) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewPhoto(dataUrl);

      // 🔴 Detener la cámara después de capturar la imagen
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };
  /* Version anterior 
    const capturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPreviewPhoto(photo); // Mostrar previsualización
  }; */

  //descartar foto en el modal
  const discardPhoto = () => {
    setPreviewPhoto(null); // Mostrar previsualización
    setFactura(null);
    startCamera();
  };
  // Guardar la foto en el estado correspondiente
  const savePhoto = async () => {
    const response = await fetch(previewPhoto);
    const imageBlob = await response.blob();
    setFactura(imageBlob);
    closeModal();
  };
  // Subir una imagen desde el dispositivo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result); // Mostrar previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  /* logica para cuando es video */
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        /* width: { ideal : '100%' },
        height: { ideal : '100%' }  */
      },
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setElapsedTime(0);

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    clearInterval(timerInterval);
    setRecording(false);
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    const video = new Blob(recordedChunks.current, { type: "video/webm" });
    setEvidence(video);
    closeModal();
  };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <h1 className="text-center fs-5 fw-bold">
        CONTROL DE SERVICIOS DE LAVADOS
      </h1>
      {!isMobile && (
        <section className="row row-cols-sm-2 justify-content-between align-items-center mb-2">
          <div className="d-flex flex-column">
            <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
            <span className="fw-bold">Nit: 835001216</span>
            <span>Tel: 5584982 - 3155228124</span>
          </div>

          <div className="d-flex flex-column align-items-end">
            <img
              src={Icono}
              style={{
                width: "80px",
              }}
            />
          </div>
        </section>
      )}
      {/* <form className="" onSubmit={(e)=>handleSubmit(e)}> */}
      <div className="bg-light rounded shadow-sm p-3 mb-3">
        <div className="d-flex flex-column gap-1">
          <div>
            <div className="mb-2">
              {/* Cliente y vendedor*/}
              <label className="fw-bold">CONDUCTOR</label>
              <div className={`row row-cols-sm-2 ${isMobile && 'gap-2'}`}>
                <div className="d-flex flex-column align-items-start">
                  <label>Cédula:</label>
                  <input
                    id="idDriver"
                    type="number"
                    value={
                      driverSeleccionado
                        ? parseInt(driverSeleccionado.rowId)
                        : search.idDriver
                    }
                    className="form-control form-control-sm"
                    placeholder="Buscar por Cédula"
                    onChange={(e) => {
                      const { value } = e.target;
                      handlerChangeSearch(e);
                      findById(e);
                    }}
                    min={0}
                    required
                  />
                </div>
                <div className="d-flex flex-column align-items-start">
                  <label>Nombre:</label>
                  <div className={`d-flex align-items-center position-relative w-100`}>
                    <input
                      id="name"
                      type="search"
                      autoComplete="off"
                      placeholder="Selecciona un conductor"
                      value={
                        driverSeleccionado ?
                          driverSeleccionado.name :
                          search?.name
                      }
                      onChange={(e)=>handlerChangeDriver(e)}
                      className="form-control form-control-sm input-select"
                      style={{textTransform:'uppercase'}}
                    />
                    <select
                      ref={refDriver}
                      id="name"
                      className="form-select form-select-sm"
                      onChange={(e)=>findDriverByDescrip(e)}
                      required
                    >
                      <option value="" selected disabled>
                        -- SELECCIONE UN CONDUCTOR --
                      </option>
                      {suggestionsDriver
                        ?.sort((a,b)=>a.id - b.id)
                        .map((elem) => (
                          <option key={elem.id} value={elem.name}>
                            {elem.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className={`row row-cols-sm-2 ${isMobile && 'gap-2'}`}>
              <div className="d-flex flex-column align-items-start">
                  <label>PLACA:</label>
                  <div className={`d-flex align-items-center position-relative w-100`}>
                    <input
                      id="plate"
                      type="search"
                      autoComplete="off"
                      placeholder="Selecciona una placa"
                      value={
                        platesSeleccionado ?
                          platesSeleccionado.plate :
                          search?.plate
                      }
                      onChange={(e)=>handlerChangePlate(e)}
                      className="form-control form-control-sm input-select"
                      style={{textTransform:'uppercase'}}
                    />
                    <select
                      ref={refPlate}
                      id="plate"
                      className="form-select form-select-sm"
                      onChange={(e)=>findPlaterByDescrip(e)}
                      required
                    >
                      <option value="" selected disabled>
                        -- SELECCIONE UNA PLACA --
                      </option>
                      {suggestionsPlates
                        ?.sort((a,b)=>a.id - b.id)
                        .map((elem) => (
                          <option key={elem.id} value={elem.plate}>
                            {elem.plate}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              <div className="">
                <label className="fw-bold">FECHA CREACIÓN SOLICITUD</label>
                {!id ?
                  <input
                    id="createdAt"
                    type="date"
                    className="form-control form-control-sm"
                    value={new Date().toISOString().split("T")[0]}
                    onChange={handlerChangeSearch}
                    required
                    disabled
                  />
                  :
                  <input
                    id="createdAt"
                    type="text"
                    className="form-control form-control-sm"
                    value={new Date(search.createdAt).toLocaleDateString()}
                    onChange={handlerChangeSearch}
                    required
                    disabled
                  />
                }
              </div>
            </div>
          </div>
          <hr className="my-1" />
          <div className={`row row-cols-sm-2 ${isMobile && 'gap-2'}`}>
            <div className="">
              <label className="fw-bold">FACTURA DEL SERVICIO</label>
              <div
                style={{
                  width: "100%",
                  height: 30,
                  border: previewPhoto ? "2px solid green" : "2px solid #ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: 5,
                }}
                onClick={(e) => (
                  openModal("factura", "Factura Servicio"),
                  setTypeEvidence("Foto"),
                  !previewPhoto && startCamera(e)
                )}
              >
                {previewPhoto ? (
                  <div style={{ color: "green" }}>
                    Haz Click aquí para ver la foto
                  </div>
                ) : (
                  "Haz Click aquí para tomar la foto"
                )}
              </div>
            </div>
            <div className="">
              <label className="fw-bold">EVIDENCIA</label>
              <div
                style={{
                  width: "100%",
                  height: 30,
                  border: previewUrl ? "2px solid green" : "2px solid #ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: 5,
                }}
                onClick={(e) => (
                  openModal("evicencia", "Evidencia"), 
                  setTypeEvidence("Video"),
                  !previewUrl && startRecording(e)
                )}
              >
                {previewPhoto ? (
                  <div style={{ color: "green" }}>
                    Haz Click aquí para ver el vídeo
                  </div>
                ) : (
                  "Haz Click aquí para tomar el vídeo"
                )}
              </div>
            </div>
          </div>
        </div>
        {/* {JSON.stringify(evidence)} */}
      </div>
      <div className="d-flex flex-column mb-3">
        <label className="fw-bold">OBSERVACIONES</label>
        <textarea
          id="observations"
          className="form-control"
          value={search.observations}
          onChange={handlerChangeSearch}
          style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
        ></textarea>
      </div>
      {/* Modal para tomar fotos */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Capturar evidencia:</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "enviroment", // 'user' para camara delante O 'enviroment' para la cámara trasera
                }}
                style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
              /> */}
          {!previewPhoto && typeEvidence === "Foto" ? (
            <div>
              <video
                ref={camaraRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          ) : (
            typeEvidence === "Foto" && (
              <img
                src={previewPhoto}
                alt="Previsualización"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                }}
              />
            )
          )}
          {!previewUrl && typeEvidence === "Video" ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded border h-full"
              height={"100%"}
              width={"100%"}
              style={{ height: isMobile ? "60vh" : "60vh" }}
            />
          ) : (
            !recording &&
            typeEvidence === "Video" &&
            previewUrl && (
              <div>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded border"
                  height={"100%"}
                  width={"100%"}
                  style={{ height: isMobile ? "60vh" : "60vh" }}
                />
              </div>
            )
          )}
          {recording && (
            <div className="text-red-600 font-bold text-lg mt-2">
              ⏺ Grabando... {formatTime(elapsedTime)}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* {typeEvidence === null && (
            <div className="d-flex gap-2">
              <button
                onClick={(e) => startCamera(e)}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Foto
              </button>
              <button
                onClick={(e) => setTypeEvidence("Video")}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Vídeo
              </button>
            </div>
          )} */}
          {typeEvidence === "Foto" ? (
            <div>
              {!previewPhoto ? (
                <div className="d-flex gap-2">
                  <button
                    onClick={(e) => capturePhoto(e)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Capturar
                  </button>
                  {/* <label
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Subir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      style={{ display: "none" }}
                    />
                  </label> */}
                </div>
              ) : ((previewPhoto && !id) &&
                <div className="div-botons">
                  <button
                    onClick={savePhoto}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => discardPhoto()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Descartar
                  </button>
                </div>
              )}
            </div>
          ) : (
            typeEvidence === "Video" && (
              <div className="d-flex flex-column">
                {(!recording && previewUrl && !id) && (
                  <>
                    <div
                      className={`mt-2 d-flex div-botons justify-content-center ${
                        isMobile ? "gap-2" : "gap-4"
                      } `}
                    >
                      <button
                        onClick={uploadVideo}
                        className="bg-green-600 btn btn-sm btn-success text-black px-4 py-2 rounded"
                      >
                        📤 Guardar
                      </button>
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setEvidence(null);
                          recordedChunks.current = [];
                          startRecording();
                        }}
                        className="bg-gray-500 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                      >
                        🔄 Grabar de nuevo
                      </button>
                    </div>
                  </>
                )}

                {/* {!recording && !previewUrl && (
                  <div
                    className={`mt-2 d-flex div-botons justify-content-center ${
                      isMobile ? "gap-2" : "gap-4"
                    } `}
                  >
                    <button
                      onClick={(e) => startRecording(e)}
                      className="bg-blue-600 btn btn-sm btn-primary text-black px-4 py-2 rounded"
                    >
                      ▶️ Iniciar grabación
                    </button>
                    <button
                      onClick={(e) => setTypeEvidence(null)}
                      className="bg-red-600 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                    >
                      ↩️ Volver
                    </button>
                  </div>
                )} */}

                {recording && (
                  <button
                    onClick={(stopRecording)}
                    className="bg-red-600 btn btn-sm btn-danger text-black px-6 py-2 rounded mt-1"
                  >
                    ⏹️ Detener grabación
                  </button>
                )}
              </div>
            )
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={loading} centered>
        <Modal.Body>
          <div className="d-flex align-items-center">
            <strong className="text-danger" role="status">
              Cargando...
            </strong>
            <div
              className="spinner-grow text-danger ms-auto"
              role="status"
            ></div>
          </div>
        </Modal.Body>
      </Modal>
      <div className="d-flex flex-row gap-3 mb-3 pb-3">
        <button
          type="submit"
          className="btn btn-sm btn-success fw-bold w-100"
          onClick={(e) => id ? handleUpdate(e) : handleSubmit(e)}
        >
          {id ? 'ACTUALIZAR' : 'REGISTRAR'} 
        </button>
        <button
          type="button"
          className="btn btn-sm btn-danger fw-bold w-100"
          onClick={refreshForm}
        >
          CANCELAR
        </button>
      </div>
      {/* </form> */}
    </div>
  );
}
