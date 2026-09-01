import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppContext } from '../../context/AppContext'; // Asegura la ruta de tu contexto general
import { createUser, deleteUserByUsername, findUsers, updateUser } from "../../services/userService";
import { NavBarData } from '../../components/Navbar/NavbarData';
import { getAllAgencies } from '../../services/agencyService';
import AuthContext from '../../context/authContext';
import {  NumericFormat  }  from  'react-number-format' ;
import { createMultipleMargin, findMargins, replaceMargin } from '../../services/marginService';
import { downloadMarginTemplate } from '../../utils/DownloadMargin';
import { exportMarginData } from '../../utils/ExportMargin';
import Chulo from '../../assets/chulo-verde.png'
import { FaUnlock } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { ImInsertTemplate } from "react-icons/im";
import { LuGoal } from "react-icons/lu";
import { FaFileExcel, FaDownload } from 'react-icons/fa';
import { BsCloudUploadFill } from 'react-icons/bs';
import { MdRefresh, MdAddCircle } from 'react-icons/md';
import { LuHistory, LuFileUp } from 'react-icons/lu';
import { FiUpload } from 'react-icons/fi';
import * as Icons from 'lucide-react';
import * as Bs from "react-icons/bs";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'

export default function Margen() {
  // 1. Traemos los datos y funciones globales del AppContext (o simulación del estado antiguo)
  const { 
    allModules,
    toggleModule, 
  } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [agencies, setAgencies] = useState([]);
  const [margins, setMargins] = useState([]);
  const [totalMargins, setTotalMargins] = useState([]);
  const { user, setUser } = useContext(AuthContext);
  const activeAndAllowedModules = allModules.filter(mod => mod.active);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [years, setYears] = useState('');
  const [tablaAnio, setTablaAnio] = useState([]);
  const [columnas, setColumnas] = useState();
  const [record, setRecord] = useState([]);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('replace'); // 'replace' o 'append'
  const inputRef = useRef(null);
  const [isHoveredUpload, setIsHoveredUpload] = useState(false);
  const [margenLista, setMargenLista] = useState([]);
  const [suggestionsMargin, setSuggestionsMargin] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    seller: '',
    line: '',
    city: '',
    year: new Date().getFullYear().toString(),
    month: '',
    startDate: '',
    endDate: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    sellers: [],
    lines: [],
    cities: [],
    years: [],
    months: [],
  });

  useEffect(()=>{
    cargarInfo()
  },[]);

  const cargarInfo = () => {
    findMargins()
      .then(({data})=> {
        setMargenLista(data)
        setSuggestionsMargin(data)
        setCurrentPage(1); 
      
        const uniqueCities = [...new Set(data.map(item => item.co).filter(Boolean))];
        const uniqueYears = [...new Set(data.map(item => item.anio).filter(Boolean))];
        const uniqueMonths = [...new Set(data.map(item => item.mes).filter(Boolean))];
            
        setFilterOptions({
          cities: uniqueCities,
          years: uniqueYears,
          months: uniqueMonths,
        });
      
        if (uniqueYears.length > 0 && !uniqueYears.includes(filters.year)) {
          setFilters(prev => ({ ...prev, year: uniqueYears[0] }));
        }
      })
      .catch(()=>{
        console.log('error')
      })
  }
  
  const rowsPerPage = 100; // Muestra un máximo de 100 filas por vista
  // Cálculos dinámicos de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // Este subconjunto contiene únicamente las 100 filas de la página actual
  const currentRows = suggestionsMargin.slice(indexOfFirstRow, indexOfLastRow);
  const totalMargenes = Math.ceil(suggestionsMargin.length / rowsPerPage);

  // Colores personalizados basados en tu imagen
  const colors = {
    primary: '#7c3aed', // Morado principal
    primaryLight: '#ede9fe', // Morado muy claro para el fondo del botón
    border: '#cbd5e1', // Gris para los bordes
    textMuted: '#64748b' // Gris para el texto secundario
  };

  const handleChangeFilter= (e) => {
    const { id, value } = e.target;
    console.log(value);
    setFilters({
      ...filters,
      [id]: value,
    });

    let filtered = []

    if (id === 'city') {
      filtered = filtered.filter(row => row.co === value);
    }

    setSuggestionsMargin(filtered);
    setCurrentPage(1)
  };

  /* Funcion para borrar los campos */
  const reloadInfo = () => {
    setSelectedFile(null);
    setUploadMode('replace');
    setDragActive(false);
    setFilters({
      seller: '',
      line: '',
      city: '',
      year: new Date().getFullYear().toString(),
      month: '',
      startDate: '',
      endDate: ''
    })
    cargarInfo();
  }

  /* Funcion para mostrar el texto de la contraseña */
  const togglePasswordVisibility = useCallback((e) => {
    setShowPassword(!showPassword);
  });

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

  //funcion para crear las nuevas margenes
  const handleCreateMargin = (e) => {
    e.preventDefault();
    if(margenLista.length > 0){
      Swal.fire({
        title: 'Subiendo información',
        text: `Por favor, espera mientras se guarda la información en nuestra base de datos...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(); 
        }
      });
      createMultipleMargin(margenLista)
      .then(()=>{
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'Se han agregado las nuevas margenes al sistema',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
        reloadInfo()
      })
      .catch(()=>{
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de agregar las nuevas margenes, vuelvelo a intentar mas tarde.',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK'
        })
      })
    }else {
      Swal.fire({
        icon: 'warning',
        title: '¡ATENCION!',
        text: 'no hay información nuevo por agregar',
        showConfirmButton: false,
        timmer: 5000
      })
    }
  }

  const handleReplaceMargin = (e) => {
    e.preventDefault();
    if(margenLista.length > 0){
      Swal.fire({
        title: 'Subiendo información',
        text: `Por favor, espera mientras se guarda la información en nuestra base de datos...`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(); 
        }
      });
      replaceMargin(margenLista)
      .then(()=>{
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'Se han reemplazado las margenes en el sistema',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
        reloadInfo()
      })
      .catch(()=>{
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de reemplazar las margenes, vuelvelo a intentar mas tarde.',
          showConfirmButton: true,
          confirmButtonColor: 'red',
          confirmButtonText: 'OK'
        })
      })
    }else {
      Swal.fire({
        icon: 'warning',
        title: '¡ATENCION!',
        text: 'no hay información nuevo por agregar',
        showConfirmButton: false,
        timmer: 5000
      })
    }
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      handleUploadMarginFile(e.target.files[0])
    }
  };

  //funcion para limpiar la fecha del excel
  const parseExcelDate = (excelValue) => {
    if (!excelValue) return '';

    // Si ya viene como un string (ej. desde el archivo .txt), lo devolvemos tal cual
    if (typeof excelValue === 'string') return excelValue;

    // Si es un número (formato general de Excel), hacemos la conversión
    if (typeof excelValue === 'number') {
      // Excel tiene un bug histórico de año bisiesto en 1900, por lo que restamos 25569 días 
      // para sincronizar con el huso horario estándar de JavaScript Unix Timestamp
      const dateObj = new Date((excelValue - 25569) * 86400 * 1000);
      
      // Validamos que sea una fecha correcta
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const year = dateObj.getFullYear();
        
        return `${day}/${month}/${year}`; // Devuelve "13/11/2025"
      }
    }

    return String(excelValue);
  };

  //funcion para limpiar los numeros del monto
  const parseCurrencyToNumber = (value) => {
    if (value === null || value === undefined) return 0;
    
    // Si ya es un número (porque el Excel a veces lo procesa bien), lo devolvemos directo
    if (typeof value === 'number') return value;

    // Si es un texto, le quitamos el $, los puntos de los miles y cambiamos la coma decimal por un punto
    let cleanValue = String(value)
      .replace(/\$/g, '')       // Quita el símbolo de peso $
      .replace(/\./g, '')       // Quita los puntos de los miles
      .replace(/,/g, '.')       // Cambia la coma decimal por un punto (.) que sí entiende JS
      .trim();                  // Quita espacios en blanco sueltos

    return parseFloat(cleanValue) || 0;
  };

  // Simular clic en el input oculto al hacer clic en la caja
  const onButtonClick = () => {
    inputRef.current.click();
  };

  useEffect(() => {
    let filtered = [...margenLista];
  
    if (filters.city) {
      filtered = filtered.filter(row => row.co === filters.city);
    }

    if (filters.month) {
      filtered = filtered.filter(row => row.mes === filters.month);
    }

    if (filters.year) {
      filtered = filtered.filter(row => row.anio === filters.year);
    }
  
    setSuggestionsMargin(filtered);
    setCurrentPage(1);
  
    }, [filters]);

  // Helper para parsear números limpios desde Excel (monedas o strings con puntos)
  const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remueve puntos, comas de miles y símbolos de moneda
    const cleanStr = String(val).replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanStr) || 0;
  };

  // Helper para limpiar porcentajes (ej: "30%", 30, o 0.3)
  const parsePercent = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') {
      return val > 1 ? val / 100 : val;
    }
    const cleanStr = String(val).replace('%', '').trim();
    const num = parseFloat(cleanStr) || 0;
    return num > 1 ? num / 100 : num;
  };

  const handleUploadMarginFile = (file) => {
    if (!file) return;

    // Detectamos si es un archivo plano de texto o CSV
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv');

    Swal.fire({
      title: 'Procesando archivo',
      text: `Por favor, espera mientras se lee la plantilla de márgenes...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;
        let workbook;

        // 🎯 CONFIGURACIÓN DINÁMICA DE LECTURA SHEETJS
        if (isTextFile) {
          workbook = XLSX.read(data, { type: 'string', codepage: 65001 });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }

        // Tomamos la primera hoja del libro
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonMargin = XLSX.utils.sheet_to_json(sheet);

        if (!jsonMargin || jsonMargin.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Hoja vacía',
            text: 'El archivo suministrado está vacío.',
            showConfirmButton: false,
            timer: 3000,
          });
          return;
        }

        // Funciones auxiliares de limpieza
        const parseValue = (val) => parseCurrencyToNumber ? parseCurrencyToNumber(val) : (parseFloat(String(val).replace(/[^0-9.-]+/g, '')) || 0);
        const formatCO = (val) => val !== undefined && val !== null ? String(val).trim().padStart(3, '0') : '';

        // 🎯 TRANSFORMATION DE LAS FILAS DE MARGEN ESPERADO
        const transformedRows = [];

        jsonMargin.forEach(row => {
          // Extraemos los campos contemplando posibles variaciones de nombre en las columnas
          const co = formatCO(row.co || row.CO || row.Cod_CO || row.punto);
          const presupuesto = parseValue(row.budget || row.BUDGET || row.presupuesto || row.monto);
          const expectedMargin = parseValue(row.ren_esperada || row.REN_ESPERADA || row.expectedMargin || row.expected_margin || row.rentabilidad);
          const mes = formatCO(row.mes || row.MES);
          const anio = formatCO(row.anio || row.ANIO || row.año || row.AÑO);

          // Validamos que al menos exista el C.O.
          if (co) {
            transformedRows.push({
              co,
              budget: presupuesto,
              expectedMargin: expectedMargin,
              mes,
              anio,
            });
          }
        });

        if (transformedRows.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Estructura inválida',
            text: 'No se encontraron registros válidos de C.O. y Margen Esperado.',
          });
          return;
        }

        // 🎯 ACTUALIZACIÓN DE ESTADOS CON LA INFORMACIÓN EXTRAÍDA
        setMargenLista(transformedRows); // Guarda el listado para el cálculo de semáforos y KPIs
        setSuggestionsMargin(transformedRows);
        setCurrentPage(1);

        // Extraer los C.O. únicos para las opciones de filtros
        const uniqueCities = [...new Set(transformedRows.map(item => item.co).filter(Boolean))];
        const uniqueYears = [...new Set(transformedRows.map(item => item.anio).filter(Boolean))];
        const uniqueMonths = [...new Set(transformedRows.map(item => item.mes).filter(Boolean))];
            
        
        if (uniqueYears.length > 0 && !uniqueYears.includes(filters.year)) {
          setFilters(prev => ({ ...prev, year: uniqueYears[0] }));
        }

        setFilterOptions({
          cities: uniqueCities,
          years: uniqueYears,
          months: uniqueMonths,
        });

        setTimeout(() => {
          Swal.close();
        }, 800);

      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error de lectura',
          text: 'Ocurrió un error al procesar la plantilla de margen.',
        });
      }
    };

    // 🎯 ACTIVACIÓN DEL LECTOR SEGÚN EL TIPO DE ARCHIVO
    if (isTextFile) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="container-fluid p-2 stack gap-2" style={{width: isMobile ? '' : '78vw'}}>

      {/* sesion para subir documentos */}
      <div className="panel shadow-sm rounded-4 p-3 w-100">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2 w-100">
          <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
            <FaFileExcel className="me-2" style={{ color: colors.primary }} />
            Cargar archivo de rentabilidades
          </h5>
  
        </div>

        {/* Zona de Drag & Drop */}
        <div 
          className="text-center rounded-3 mb-4 d-flex flex-column align-items-center justify-content-center w-100"
          style={{
            border: `2px dashed ${dragActive ? colors.primary : colors.border}`,
            padding: '20px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <BsCloudUploadFill size={48} style={{ color: colors.primary, marginBottom: '15px' }} />
          
          <h6 className="fw-semibold text-dark mb-2">
            {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : "Arrastra tu archivo Excel aquí o haz clic para seleccionar"}
          </h6>

          {/* Input oculto real */}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleChange(e)}
            style={{ display: "none" }}
          />
        </div>

        {/* Botones de Acción */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

          {/* Botón para descargar la plantilla */}
          <div className={`${isMobile ? 'flex-column' : 'flex-row'} d-flex gap-2`}>
            <button 
              onClick={(e) => exportMarginData(suggestionsMargin)}
              className="btn d-flex align-items-center fw-bold btn-sm btn-outline-success"
              style={{ 
                border: `1px solid ${colors.success}`,
                borderRadius: '6px',
                fontSize: '0.85rem',
                padding: '6px 12px'
              }}
            >
              <LuGoal className="me-2" />
                Descargar margenes (.xlsx)
            </button>
            <button 
              onClick={downloadMarginTemplate}
              className="btn d-flex align-items-center fw-bold btn-sm btn-outline-success"
              onMouseEnter={() => setIsHoveredUpload(true)}
              onMouseLeave={() => setIsHoveredUpload(false)}
              className="btn fw-semibold"
              style={{
                color: isHoveredUpload ? '#ffffff' : '#475569',
                backgroundColor: isHoveredUpload ? '#9fa8da' : 'transparent',
                borderColor: '#9fa8da',
                borderRadius: '8px',
                transition: 'all 0.2s ease', // Suaviza la transición al pasar el cursor
                fontSize: '0.9rem'
              }}
            >
              <ImInsertTemplate className="me-2" />
                Descargar plantilla (.xlsx)
            </button>
          </div>

          {/* Botón principal de Subir */}
          <div className={`${isMobile ? 'flex-column' : 'flex-row'} d-flex gap-2`}>
            <button 
              className="btn d-flex align-items-center fw-semibold px-3 py-2"
              style={{ 
                backgroundColor: uploadMode === 'replace' ? colors.primaryLight : 'transparent',
                color: uploadMode === 'replace' ? colors.primary : colors.textMuted,
                border: `1px solid ${uploadMode === 'replace' ? colors.primary : colors.border}`,
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
              onClick={(e)=>handleReplaceMargin(e)}
            >
              <MdRefresh className="me-2" size={18} /> Reemplazar todo
            </button>

            <button 
              className="btn d-flex align-items-center fw-semibold px-3 py-2"
              style={{ 
                backgroundColor: uploadMode === 'append' ? '#f1f5f9' : 'transparent',
                color: uploadMode === 'append' ? '#475569' : colors.textMuted,
                border: `1px solid ${uploadMode === 'append' ? '#94a3b8' : colors.border}`,
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
              onClick={(e)=>handleCreateMargin(e)}
            >
              <MdAddCircle className="me-2" size={18} /> Agregar / Actualizar
            </button>
          </div>
        </div>

      </div>

      {/* filtros del margenes */}
      <div className="">
        <div className={`panel-head d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-between align-items-center`}>
          <h2>Gestión de rentabilidad</h2>

          {/* Filtros */}
          <div className={`${isMobile ? 'd-flex flex-column' : 'd-flex flex-row gap-2'}`}>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label fw-semibold small mb-1">C.O.</label>
              <select 
                id='city'
                className=""
                value={filters.city}
                onChange={e => (
                  handleChangeFilter(e)
                )}
              >
                <option value="">Todas</option>
                {filterOptions.cities.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label fw-semibold small mb-1">Mes</label>
              <select 
                id='month'
                className=""
                value={filters.month}
                onChange={e => (
                  handleChangeFilter(e)
                )}
              >
                <option value="">Todos</option>
                {filterOptions.months.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label fw-semibold small mb-1">Año</label>
              <select 
                id='year'
                className=""
                value={filters.year}
                onChange={e => (
                  handleChangeFilter(e)
                )}
              >
                <option value="">Todos</option>
                {filterOptions.years.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* tabla de margenes */}
        <div className={`table-wrap table-responsive w-100 justify-content-center align-items-center d-flex`} style={{ maxHeight: '500px', overflowY: 'auto'}}>
          {/* 1. Validamos que tengamos datos para el año seleccionado antes de mapear */}
            <div className={` ${isMobile ? 'w-100' : 'w-100'}`}>
              <table className="v-middle">
                <thead>
                  <tr >
                    <th>C.O.</th>
                    <th style={{textAlign: 'center'}}>Presupuesto</th>
                    <th style={{textAlign: 'center'}}>Rentabilidad esperada</th>
                    <th>Mes</th>
                    <th>Año</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestionsMargin.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="text-center py-4 text-muted small">
                        Cargue un archivo Excel para procesar los datos de venta.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((fila) => (
                      <tr>
                        <td className='fw-bold'>{fila.co}</td>
                        <td className='' style={{textAlign: 'center'}}>{Number(fila.budget).toLocaleString()}</td>
                        <td className='' style={{textAlign: 'center'}}>{fila.expectedMargin} %</td>
                        <td className='fw-bold'>{fila.mes}</td>
                        <td className='fw-bold'>{fila.anio}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* 🎯 BOTONERA DE PAGINACIÓN DE BOOTSTRAP */}
        </div>
        
        {suggestionsMargin.length > 0 && (
          <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center mt-3 px-2`}>
            <small className="text-muted">
              Mostrando <b>{indexOfFirstRow + 1}</b> - <b>{Math.min(indexOfLastRow, suggestionsMargin.length)}</b> de <b>{suggestionsMargin.length}</b> registros
            </small>

            <nav aria-label="Navegación de tabla">
              <ul className="pagination pagination-sm m-0">
                {/* Botón Anterior */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>

                {/* Renderizado de números de página */}
                {Array.from({ length: totalMargenes }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalMargenes || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, array) => {
                    const showEllipsis = idx > 0 && page - array[idx - 1] > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <li className="page-item disabled"><span className="page-link">...</span></li>}
                        <li className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(page)}>
                            {page}
                          </button>
                        </li>
                      </React.Fragment>
                    );
                  })}

                {/* Botón Siguiente */}
                <li className={`page-item ${currentPage === totalMargenes ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalMargenes))} 
                    disabled={currentPage === totalMargenes}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
    </div>
  );
}