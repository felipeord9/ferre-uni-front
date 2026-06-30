import { useState, useEffect, useContext } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { updateLavado } from "../../services/washService";
import { Modal , Button , Form, Table } from "react-bootstrap";
import AuthContext from "../../context/authContext";
import DataTable from "react-data-table-component";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TfiTicket } from "react-icons/tfi";
import { GrDeliver } from "react-icons/gr";
import Checkbox from '@mui/material/Checkbox';
import * as FaIcons from "react-icons/fa";
import DocLavadosPDF from "../DocLavadosPDF";
import { FaEdit } from "react-icons/fa";
import FormControlLabel from '@mui/material/FormControlLabel';
import { sendMailCollect, sendMailEnd } from "../../services/mailService";
import { GiCancel } from "react-icons/gi";
import { FiEdit2 } from "react-icons/fi";
import Swal from "sweetalert2";
import "./styles.css";

function TableLavados({ washes, getAllWashes, loading }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [docAsociado, setDocAsociado] = useState('');
  const [nameReceiver, setNameReceiver] = useState('');
  const [nameDriver, setNameDriver] = useState('');
  const [recogiendo, setRecogiendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const navigate = useNavigate();
  const columns = [
    {
      id: "editar",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          {user.role === 'admin' &&
            <button 
              title="Editar registro" className='btn btn-sm btn-primary'
              style={{color:'white'}}
              onClick={(e) => {
                navigate(`/form/${row.id}`)
              }}
            >
              <FiEdit2 />
            </button>
          }
        </div>
      ),
      width: '50px'
    },
    {
      id: "id",
      name: "id",
      selector: (row) => `${row.id}`,
      width: "50px",
    },
    {
      id: "driverName",
      name: "Conductor",
      selector: (row) => `${row.driverName}`,
      width: "240px",
    },
    {
      id: "plate",
      name: "Placa",
      selector: (row) => `${row.plate}`,
      width: "110px",
    },
    {
      id: "bill",
      name: isMobile ? 'Factura' : "Foto factura",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.bill} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'155px'
    },
    {
      id: "evidence",
      name: isMobile ? 'Evidencia' : "Vídeo evidencia",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            control={<Checkbox checked={row.evidence} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'155px'
    },
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: "200px",
    },
    {
      id: "created_by",
      name: "Creado por",
      selector: (row) => row?.createdBy,
      sortable: true,
      width: "220px",
    },
    {
      id: "notes",
      name: "Observaciones",
      selector: (row) => row?.observations,
      width: "550px",
    },
    
    
  ];

  const customStyles = {
    rows: {
      style: {
        height:'15px', // ajusta el alto de las filas según tus necesidades
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        color:'white',
        backgroundColor:'#007bff',
        paddingLeft:10,
        paddingRight:10
      },
    },
    cells: {
      style: {
        paddingLeft:10,
        paddingRight:10
      },
    },
    columns:{
      style: {
        borderLeft:'5px black solid'
      }
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0 table-orders"
      style={{ width: "100%" }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={washes}
        customStyles={customStyles}
        fixedHeaderScrollHeight={200}
        defaultSortField="id"           // Campo a ordenar por defecto
        defaultSortAsc={false}                  // false = descendente
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />

    </div>
  );
}

export default TableLavados;
