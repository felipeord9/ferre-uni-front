import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppContext } from '../../context/AppContext'; // Asegura la ruta de tu contexto general
import { createUser, deleteUserByUsername, findUsers, updateUser } from "../../services/userService";
import { NavBarData } from '../../components/Navbar/NavbarData';
import { getAllAgencies } from '../../services/agencyService';
import AuthContext from '../../context/authContext';
import { createBudget, createMultipleBudget, findBudgets, findBudgetsByYear, updateMultiple } from '../../services/budgetService';
import { findRecords } from '../../services/recordBudgetService'
import {  NumericFormat  }  from  'react-number-format' ;
import Chulo from '../../assets/chulo-verde.png'
import { FaUnlock } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { FaFileExcel, FaDownload } from 'react-icons/fa';
import { BsCloudUploadFill } from 'react-icons/bs';
import { MdRefresh, MdAddCircle } from 'react-icons/md';
import { LuHistory, LuFileUp } from 'react-icons/lu';
import { FiUpload } from 'react-icons/fi';
import * as Icons from 'lucide-react';
import * as Bs from "react-icons/bs";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'

export default function Presupuesto() {
  // 1. Traemos los datos y funciones globales del AppContext (o simulación del estado antiguo)
  const { 
    allModules,
    toggleModule, 
  } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [agencies, setAgencies] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState([]);
  const [newBudget, setNewBudget] = useState([]);
  const [updateBudget, setUpdateBudget] = useState([]);
  const [editBudget, setEditBudget] = useState(false);
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
  const [presupuestoListo, setPresupuestoListo] = useState([]);
  const [suggestionsBudget, setSuggestionsBudget] = useState([]);
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
  });

  useEffect(()=>{
    findBudgets()
      .then(({data})=> {
        setPresupuestoListo(data)
        setSuggestionsBudget(data)
        setCurrentPage(1); 
      
        const uniqueSellers = [...new Set(data.map(item => item.rzsVendedor).filter(Boolean))];
        const uniqueLines = [...new Set(data.map(item => item.descripLinea).filter(Boolean))];
        const uniqueCities = [...new Set(data.map(item => item.co).filter(Boolean))];
        const uniqueYears = [...new Set(data.map(item => item.anio).filter(Boolean))];
            
        setFilterOptions({
          sellers: uniqueSellers,
          lines: uniqueLines,
          cities: uniqueCities,
          years: uniqueYears,
        });
      
        if (uniqueYears.length > 0 && !uniqueYears.includes(filters.year)) {
          setFilters(prev => ({ ...prev, year: uniqueYears[0] }));
        }
      })
      .catch(()=>{
        console.log('error')
      })
    findRecords().then(({data})=>setRecord(data))
  },[]);
  
  const rowsPerPage = 100; // Muestra un máximo de 100 filas por vista
  // Cálculos dinámicos de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // Este subconjunto contiene únicamente las 100 filas de la página actual
  const currentRows = presupuestoListo.slice(indexOfFirstRow, indexOfLastRow);
  const totalPresupuestos = Math.ceil(presupuestoListo.length / rowsPerPage);

  // Colores personalizados basados en tu imagen
  const colors = {
    primary: '#7c3aed', // Morado principal
    primaryLight: '#ede9fe', // Morado muy claro para el fondo del botón
    border: '#cbd5e1', // Gris para los bordes
    textMuted: '#64748b' // Gris para el texto secundario
  };

  /* useEffect(() => {
    getAllAgencies().then((data) => setAgencies(data));
    getBudgets();
  }, []); */

  const mesesOrden = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const cos = [
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
    "009",
    "010",
    "020",
    "100",
  ];

  const construirTabla = (data) => {
    const anios = [...new Set(data.map(x => x.anio))];
    /* setYears(anios) */
    const tablas = {};
    anios.forEach(anio => {
        tablas[anio] = mesesOrden.map(mes => {
            const fila = {
                mes
            };
            cos.forEach(co => {
                fila[co] = "";
            });
            return fila;
        });
    });

    data.forEach(item => {
        const fila = tablas[item.anio]
            .find(x => x.mes === item.mes)
        if (fila) {
            fila[item.co] = item.monto;
        }
    });

    return tablas;
}

  const agruparDatos = (datos) => {
    const resultado = {};
    datos.forEach(item => {
        if (!resultado[item.anio]) {
            resultado[item.anio] = {};
        }
        if (!resultado[item.anio][item.mes]) {
            resultado[item.anio][item.mes] = {
                mes: item.mes
            };
        }
        resultado[item.anio][item.mes][item.co] = `$ ${Number(item.monto).toLocaleString()}`;
    });

    // convertir a arreglo ordenado por meses
    Object.keys(resultado).forEach(anio => {
        resultado[anio] = mesesOrden
            .filter(mes => resultado[anio][mes])
            .map(mes => resultado[anio][mes]);
    });

    return resultado;
  }

  const getBudgets = () => {
    findBudgets()
    .then(({data})=>{
      setTotalBudget(data);

      const anios = [...new Set(data.map(x => x.anio))];
      setYears(anios)

      //filtro de las columnas
      const column = [...new Set(data.map(x => x.co))].sort();
      setColumnas(column)

      //el primer filtro de los presupuestos por año
      const datosFiltrados = data.filter(item => Number(item.anio) === anio);
      const fillBudget = construirTabla(datosFiltrados);
      setBudgets(fillBudget)
    })
    .catch(()=>{
      console.log('error')
    })
  }

  useEffect(()=>{
    const datosFiltrados = totalBudget.filter(item => Number(item.anio) === anio);
    const fillBudget = construirTabla(datosFiltrados);
    setBudgets(fillBudget)
  },[anio])

  const handleChangeFilter= (e) => {
    const { id, value } = e.target;
    console.log(value);
    setFilters({
      ...filters,
      [id]: value,
    });

    let filtered = [...presupuestoListo];
    if(id === 'year'){
      filtered = filtered.filter(row => {
        if (!row.anio) return false;
        return row.anio === value;
      });
    }
    if(id === 'month'){
      filtered = filtered.filter(row => {
        if (!row.mes) return false;
        return row.mes === value;
      });
    }
    if (id === 'seller'){
      filtered = filtered.filter(row => row.rzsVendedor === value);
    }
    if (id === 'line'){
      filtered = filtered.filter(row => row.descripLinea === value);
    }
    if (id === 'city') {
      filtered = filtered.filter(row => row.co === value);
    }

    setSuggestionsBudget(filtered);
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

  //funcion para identificar los nuevos presupuestos
  const handleCellChange = (anioCelda, mesCelda, coCelda, nuevoValor) => {
    // Convertimos el valor de string a número (si es vacío, lo dejamos como 0 o vacío según tu backend)
    const montoNumerico = nuevoValor === "" || nuevoValor === null ? "" : Number(nuevoValor);

    setNewBudget((prevTotalBudget) => {
      // 1. Buscamos si ya existe un registro con este año, mes y co
      const indiceExistente = prevTotalBudget.findIndex(
        (item) =>
          Number(item.anio) === Number(anioCelda) &&
          item.mes === mesCelda &&
          item.co === coCelda
      );

      if (indiceExistente !== -1) {
        // 2. Si existe, creamos una copia del array y actualizamos el monto
        const nuevoBudget = [...prevTotalBudget];
        nuevoBudget[indiceExistente] = {
          ...nuevoBudget[indiceExistente],
          monto: montoNumerico.toString() // o montoNumerico directamente, según tu backend
        };
        return nuevoBudget;
      } else {
        // 3. Si no existe (era una celda vacía y nueva), agregamos un nuevo objeto al array
        const nuevoRegistro = {
          co: coCelda,
          mes: mesCelda,
          anio: Number(anioCelda),
          monto: montoNumerico.toString()
        };
        return [...prevTotalBudget, nuevoRegistro];
      }
    });
  };

  //funcion para crear los nuevos presupuestos
  const handleCreateBudget = (e) => {
    e.preventDefault();
    if(presupuestoListo.length > 0){
      createMultipleBudget(presupuestoListo)
      .then(()=>{
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'Se han agregado los nuevos presupuestos al sistema',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
        reloadInfo()
        /* setNewBudget([]) */
        /* getBudgets(); */
      })
      .catch(()=>{
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de agregar los nuevos presupuestos, vuelvelo a intentar mas tarde.',
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

  //funcion para optener los que se van a editar
  const handleCellEdit = (anioCelda, mesCelda, coCelda, nuevoValor) => {
    // Convertimos el valor de string a número (si es vacío, lo dejamos como 0 o vacío según tu backend)
    const montoNumerico = nuevoValor === "" || nuevoValor === null ? "" : Number(nuevoValor);

    setUpdateBudget((prevTotalBudget) => {
      // 1. Buscamos si ya existe un registro con este año, mes y co
      const indiceExistente = prevTotalBudget.findIndex(
        (item) =>
          Number(item.anio) === Number(anioCelda) &&
          item.mes === mesCelda &&
          item.co === coCelda
      );

      if (indiceExistente !== -1) {
        // 2. Si existe, creamos una copia del array y actualizamos el monto
        const nuevoBudget = [...prevTotalBudget];
        nuevoBudget[indiceExistente] = {
          ...nuevoBudget[indiceExistente],
          monto: montoNumerico.toString() // o montoNumerico directamente, según tu backend
        };
        return nuevoBudget;
      } else {
        // 3. Si no existe (era una celda vacía y nueva), agregamos un nuevo objeto al array
        const nuevoRegistro = {
          co: coCelda,
          mes: mesCelda,
          anio: Number(anioCelda),
          monto: montoNumerico.toString()
        };
        return [...prevTotalBudget, nuevoRegistro];
      }
    });
  };

  //funcion para carcelar la edición
  const cancelEditBudget = (e) => {
    e.preventDefault();
    setEditBudget(false);
    setUpdateBudget([]);
    window.location.reload();
  }

  //funcion para crear los nuevos presupuestos
  const handleUpdateBudget = (e) => {
    e.preventDefault();
    if(updateBudget.length > 0){
      updateMultiple(updateBudget)
      .then(()=>{
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'Se han actualizado los presupuestos en el sistema',
          showConfirmButton: false,
          timer: 5000,
          customClass: {
            image: 'mb-0 mt-3 pb-0',
            title: 'mt-1 pt-0'
          }
        })
        setEditBudget(false);
        setUpdateBudget([]);
        getBudgets();
      })
      .catch(()=>{
        Swal.fire({
          icon: 'warning',
          title: '¡ERROR!',
          text: 'Ha ocurrido un error al momento de actualizar los presupuestos, vuelvelo a intentar mas tarde.',
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
      handleuploadInfo(e.target.files[0])
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

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA ---
  const downloadTemplate = () => {
    const result = suggestionsBudget.map((item) => {
      const co = item?.co;
      const descripCo = item?.descripCo;
      const codlinea = item?.codlinea;
      const descripLinea = item.descripLinea;
      const idVendedor = item.idVendedor;
      const rzsVendedor = item?.rzsVendedor;
      const mes = item.mes;
      const anio = item?.anio;
      const monto = item.monto;

      return {
        'Cod_CO': co,
        'Descrip_CO': descripCo,
        'Cod_linea': codlinea,
        'Descrip_Linea': descripLinea,
        'id_Vendedor': idVendedor,
        'Rzs_Vendedor': rzsVendedor,
        'MES': mes,
        'AÑO': anio,
        'Ppto_Vta': monto,
      };
    })

    // 2. Creamos una fila vacía de ejemplo (o solo la cabecera)
    const data = [result];

    // 3. Generamos el libro de trabajo de Excel (Workbook)
    const worksheet = XLSX.utils.json_to_sheet(result);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Presupuestos");

    // 4. Forzamos la descarga del archivo en el navegador
    XLSX.writeFile(workbook, "plantilla_presupuestos.xlsx");
  };

  //funcion para guardar informacion desde el excel
  const handleuploadInfo = (file) => {

    if (!file) return;
    
    // Detectamos si es un archivo plano de texto o CSV
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv');
    
    Swal.fire({
      title: 'Procesando archivo',
      text: `Por favor, espera mientras se lee el archivo ${isTextFile ? 'de texto' : 'Excel'} y se guarda la información...`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(); 
      }
    });
    
    const reader = new FileReader();
        
    reader.onload = (event) => {
      const data = event.target.result;
      let workbook;
    
      // 🎯 CONFIGURACIÓN DINÁMICA DE LECTURA SHEETJS
      if (isTextFile) {
        // Si es TXT o CSV, lo leemos como String y forzamos codificación UTF-8 para tildes y Ñs
        workbook = XLSX.read(data, { type: 'string', codepage: 65001 });
      } else {
        // Si es .xlsx o .xls, sigue usando la lectura binaria habitual
        workbook = XLSX.read(data, { type: 'binary' });
      }
          
      const workSheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[workSheetName];
          
      const jsonRows = XLSX.utils.sheet_to_json(workSheet);
      if (jsonRows.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo vacío',
          text: 'El archivo cargado no contiene registros.',
          showConfirmButton: false,
          timer: 5000,
        });
        return;
      }
    
      const columnMapping = {
        "Cod_CO": "co",
        "Descrip_CO": "descripCo",
        "Cod_linea": "codlinea",
        "Descrip_Linea": "descripLinea",
        "id_Vendedor": "idVendedor",
        "Rzs_Vendedor": "rzsVendedor",
        "MES": "mes",
        "AÑO": "anio",
        "Ppto_Vta": "monto",
      };
    
      const transformedRows = jsonRows.map(row => {
        const newRow = {};
        for (const originalKey in row) {
          const newKey = columnMapping[originalKey] || originalKey;
              
          // 🎯 SI ES LA COLUMNA DE VALOR BRUTO, LA LIMPIAMOS DE UNA VEZ
          if (newKey === 'monto') {
            newRow[newKey] = parseCurrencyToNumber(row[originalKey]);
          }else if(newKey === 'co'){
            const originalValue = row[originalKey];
            newRow[newKey] = originalValue !== undefined && originalValue !== null
              ? String(originalValue).trim().padStart(3, '0')
              : '';
          } else {
            newRow[newKey] = row[originalKey];
          }
        }
        return newRow;
      });
      setPresupuestoListo(transformedRows)
      setSuggestionsBudget(transformedRows)
      setCurrentPage(1); 
    
      const uniqueSellers = [...new Set(transformedRows.map(item => item.rzsVendedor).filter(Boolean))];
      const uniqueLines = [...new Set(transformedRows.map(item => item.descripLinea).filter(Boolean))];
      const uniqueCities = [...new Set(transformedRows.map(item => item.co).filter(Boolean))];
      const uniqueYears = [...new Set(transformedRows.map(item => item.anio).filter(Boolean))];
          
      setFilterOptions({
        sellers: uniqueSellers,
        lines: uniqueLines,
        cities: uniqueCities,
        years: uniqueYears,
      });
    
      if (uniqueYears.length > 0 && !uniqueYears.includes(filters.year)) {
        setFilters(prev => ({ ...prev, year: uniqueYears[0] }));
      }
    
      /* const initialKpis = calculateKPIs(transformedRows);
      setKpiData(initialKpis); */
    
      setTimeout(() => {
        Swal.close(); 
      }, 800);
    };
    
    // 🎯 ACTIVACIÓN DEL LECTOR SEGÚN EL TIPO DE ARCHIVO
    if (isTextFile) {
      reader.readAsText(file, 'UTF-8'); // Abre los archivos planos como texto legible
    } else {
      reader.readAsBinaryString(file); // Abre los archivos binarios de Excel
    } 
  }

  useEffect(() => {
    let filtered = [...presupuestoListo];
  
    // 1. FILTRO DE AÑO
    if (filters.year) {
      filtered = filtered.filter(row => {
        if (!row.anio) return false;
        return Number(row.anio) === Number(filters.year);
      });
    }
  
      // 2. FILTRO DE MES
      if (filters.month) {
        filtered = filtered.filter(row => {
          if (!row.mes) return false;
          return row.mes === filters.month;
        });
      }
  
    // 4. Resto de filtros (Vendedor, Línea, Ciudad...)
    if (filters.seller) {
      filtered = filtered.filter(row => row.rzsVendedor === filters.seller);
    }
    if (filters.line) {
      filtered = filtered.filter(row => row.descripLinea === filters.line);
    }
    if (filters.city) {
      filtered = filtered.filter(row => row.co === filters.city);
    }
  
    setSuggestionsBudget(filtered);
    setCurrentPage(1);
  
    }, [filters]);

  return (
    <div className="container-fluid p-2 stack gap-2" style={{width: isMobile ? '' : '78vw'}}>

      {/* sesion para subir documentos */}
      <div className="panel shadow-sm rounded-4 p-3 w-100">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2 w-100">
          <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
            <FaFileExcel className="me-2" style={{ color: colors.primary }} />
            Cargar archivo de Presupuestos
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
          
          <p className="small mb-0" style={{ color: colors.textMuted }}>
            Columnas: <span className="fw-bold">Cod_CO, Descrip_CO, Cod_linea, Descrip_Linea, id_Vendedor, Rzs_Vendedor, MES, AÑO, PRESUPUESTO</span>
          </p>

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
          
          {/* Opciones de carga (Reemplazar / Agregar) */}
          {/* <div className="d-flex gap-2">
            <button 
              className="btn d-flex align-items-center fw-semibold px-3 py-2"
              style={{ 
                backgroundColor: uploadMode === 'replace' ? colors.primaryLight : 'transparent',
                color: uploadMode === 'replace' ? colors.primary : colors.textMuted,
                border: `1px solid ${uploadMode === 'replace' ? colors.primary : colors.border}`,
                borderRadius: '8px',
                fontSize: '0.9rem'
              }}
              onClick={() => setUploadMode('replace')}
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
              onClick={() => setUploadMode('append')}
            >
              <MdAddCircle className="me-2" size={18} /> Agregar / Actualizar
            </button>
          </div> */}

          {/* Botón para descargar la plantilla */}
          <button 
            onClick={downloadTemplate}
            className="btn d-flex align-items-center fw-bold btn-sm btn-outline-success"
            style={{ 
              border: `1px solid ${colors.success}`,
              borderRadius: '6px',
              fontSize: '0.85rem',
              padding: '6px 12px'
            }}
          >
            <FaDownload className="me-2" />
              Descargar plantilla (.xlsx)
          </button>

          {/* Botón principal de Subir */}
          <button 
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
            onClick={(e)=>handleCreateBudget(e)}
          >
            <FiUpload className="me-2" size={18} /> Subir presupuesto
          </button>
        </div>

      </div>

      {/* Tabla 2: presupuestos por co */}
      <div className="toolbar">
        <div className="panel-head d-flex justify-content-between align-items-center">
          {/* <h2>Gestión de presupuestos</h2> */}

          {/* Filtros */}
            <div className="col-12 col-sm-6 col-md-2">
              <label className="form-label fw-semibold text-secondary small mb-1">Mes</label>
              <select 
                id='month'
                value={filters.month}
                onChange={e => handleChangeFilter(e)}
              >
                <option value="">Todos</option>
                <option value="ENERO">Enero</option>
                <option value="FEBRERO">Febrero</option>
                <option value="MARZO">Marzo</option>
                <option value="ABRIL">Abril</option>
                <option value="MAYO">Mayo</option>
                <option value="JUNIO">Junio</option>
                <option value="JULIO">Julio</option>
                <option value="AGOSTO">Agosto</option>
                <option value="SEPTIEMBRE">Septiembre</option>
                <option value="OCTUBRE">Octubre</option>
                <option value="NOVIEMBRE">Noviembre</option>
                <option value="DICIEMBRE">Diciembre</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label fw-semibold small mb-1">Año</label>
              <select 
                id='year'
                value={filters.year}
                onChange={e => (
                  handleChangeFilter(e)
                )}
              >
                <option value="">Todos</option>
                {filterOptions.years.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
              </select>
            </div>
            {/* <select 
              value={anio || ""} // Nos aseguramos de que no sea undefined
              onChange={e => setAnio(Number(e.target.value))}
            >
              <option disabled value="">
                -- Seleccione un año --
              </option>
              {years && years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select> */}
            {/* {newBudget.length >= 1 ?
              <button 
                className="btn btn-sm btn-outline-success" 
                onClick={(e) => handleCreateBudget(e)}
              >
                <Icons.Save size={14} />
              </button>
              : editBudget ?
                <div className='d-flex flex-row gap-2'>
                  <button 
                    className="btn btn-sm btn-outline-success" 
                    onClick={(e) => handleUpdateBudget(e)}
                  >
                    <Icons.Save size={14} />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={(e) => cancelEditBudget(e)}
                  >
                    <Icons.X size={14} />
                  </button>
                </div>
                :
                <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={(e) => setEditBudget(!editBudget)}
                >
                  <Icons.Edit2 size={14} />
                </button>
            } */}

          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label fw-semibold small mb-1">Vendedor</label>
            <select 
              id='seller'
              className=""
              value={filters.seller}
              onChange={e => (
                handleChangeFilter(e)
              )}
            >
              <option value="">Todos</option>
              {filterOptions.sellers.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label fw-semibold small mb-1">Agencia</label>
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

          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label fw-semibold small mb-1">Línea</label>
            <select 
              id='line'
              value={filters.line}
              onChange={e => (
                handleChangeFilter(e)
              )}
            >
              <option value="">Todas</option>
              {filterOptions.lines.map((l, idx) => <option key={idx} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {/* 1. Validamos que tengamos datos para el año seleccionado antes de mapear */}
          {/* {anio && budgets[anio] ? ( */}
            <div /* key={anio} */>
              <table className="v-middle">
                <thead>
                  <tr>
                    <th>C.O.</th>
                    <th style={{width: 300}}>Descripción C.O.</th>
                    <th>Cod. Linea</th>
                    <th>Descripción Linea</th>
                    <th>id Vendedor</th>
                    <th>Razón social Vendedor</th>
                    <th>Mes</th>
                    <th>Año</th>
                    <th style={{width: 140}}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestionsBudget.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="text-center py-4 text-muted small">
                        Cargue un archivo Excel para procesar los datos de venta.
                      </td>
                    </tr>
                  ) : (
                    suggestionsBudget.map((fila) => (
                      <tr>
                        <td className='fw-bold'>{fila.co}</td>
                        <td className=''>{fila.descripCo}</td>
                        <td className=''>{fila.codlinea}</td>
                        <td className=''>{fila.descripLinea}</td>
                        <td className=''>{fila.idVendedor}</td>
                        <td className=''>{fila.rzsVendedor}</td>
                        <td className=''>{fila.mes}</td>
                        <td className=''>{fila.anio}</td>
                        <td className=''>$ {Number(fila.monto).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* 🎯 BOTONERA DE PAGINACIÓN DE BOOTSTRAP */}
            {totalPresupuestos > 1 && (
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top gap-2">
                <span className="small">
                  Mostrando registros {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, presupuestoListo.length)} de {presupuestoListo.length.toLocaleString()}
                </span>
                <div className="btn-group shadow-sm">
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span className="btn btn-sm border disabled fw-bold px-3">
                    Página {currentPage} de {totalPresupuestos}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPresupuestos))}
                    disabled={currentPage === totalPresupuestos}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          {/* ) : (
            // 4. Mensaje amigable si aún no se ha seleccionado un año o está cargando
            <div className="text-center p-4 text-muted">
              {anio ? "Cargando presupuestos..." : "Por favor, seleccione un año en el menú superior."}
            </div>
          )} */}
        </div>
      </div>

      {/* Historial de archivos subidos */}
      <div className="panel p-3 ms-0 me-0 rounded shadow-sm row align-items-end mb-2 mt-2 gap-0">
        <div className="d-flex align-items-center gap-2 mb-4">
          <LuHistory 
            size={20} 
            style={{ color: 'var(--purple, #6366f1)' }} 
          />
          <h5 
            className="fw-bold mb-0"
            style={{ color: 'var(--ink, #0f172a)', fontSize: '1.1rem' }}
          >
            Historial de cargas
          </h5>
        </div>

        {/* Lista de Filas */}
        <div className="d-flex flex-column">
          {record.map((item, index) => (
            <div
              key={item.id || index}
              className={`d-flex align-items-center gap-3 py-3 ${
                index !== record.length - 1 ? 'border-bottom' : ''
              }`}
              style={{ borderColor: 'var(--line, #f1f5f9)' }}
            >
              {/* Ícono de Archivo con Fondo Suave */}
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)', // Color púrpura suave/transparente
                  color: '#6366f1'
                }}
              >
                <LuFileUp size={20} />
              </div>

              {/* Información del Archivo */}
              <div className="d-flex flex-column">
                <span 
                  className="fw-bold"
                  style={{ color: 'var(--ink, #0f172a)', fontSize: '0.95rem' }}
                >
                  Budget{item.id}-{new Date(item.date).toLocaleDateString()}.xlsx
                </span>
                <span 
                  style={{ color: 'var(--muted, #64748b)', fontSize: '0.85rem' }}
                >
                  {new Date(item.date).toLocaleDateString()} — {item.uploadBy} — {item.rows} filas — modo: {item.mode}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}