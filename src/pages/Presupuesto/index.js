import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { AppContext } from '../../context/AppContext'; // Asegura la ruta de tu contexto general
import { createUser, deleteUserByUsername, findUsers, updateUser } from "../../services/userService";
import { NavBarData } from '../../components/Navbar/NavbarData';
import { getAllAgencies } from '../../services/agencyService';
import AuthContext from '../../context/authContext';
import { createBudget, createMultipleBudget, findBudgets, findBudgetsByYear, replaceBudget, updateMultiple } from '../../services/budgetService';
import { createRecordBudget, findRecords } from '../../services/recordBudgetService'
import {  NumericFormat  }  from  'react-number-format' ;
import Chulo from '../../assets/chulo-verde.png'
import { FaUnlock } from "react-icons/fa";
import { downloadBudgetTemplate } from '../../utils/DownloadBudget'
import { exportBudgetTo3Sheets } from '../../utils/ExportBudget';
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
    cargarInfo()
  },[]);

  const cargarInfo = () => {
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
  }
  
  const rowsPerPage = 100; // Muestra un máximo de 100 filas por vista
  // Cálculos dinámicos de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // Este subconjunto contiene únicamente las 100 filas de la página actual
  const currentRows = suggestionsBudget.slice(indexOfFirstRow, indexOfLastRow);
  const totalPresupuestos = Math.ceil(suggestionsBudget.length / rowsPerPage);

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
        const inf = {
          date: new Date(),
          uploadBy: user.name,
          rows: presupuestoListo.length,
          mode: 'Agregar/Actualizar',
        }
        createRecordBudget(inf)
        .catch(()=>{
          console.log('error')
        })
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

  const handleReplaceBudget = (e) => {
    e.preventDefault();
    if(presupuestoListo.length > 0){
      replaceBudget(presupuestoListo)
      .then(()=>{
        const inf = {
          date: new Date(),
          uploadBy: user.name,
          rows: presupuestoListo.length,
          mode: 'Reemplazar Todo',
        }
        createRecordBudget(inf)
        .catch(()=>{
          console.log('error')
        })
        Swal.fire({
          imageUrl: Chulo,
          imageWidth: 100,
          title: '¡Correcto!',
          text: 'Se han reemplazado los presupuestos en el sistema',
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
          text: 'Ha ocurrido un error al momento de reemplazar los presupuestos, vuelvelo a intentar mas tarde.',
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
  /* const handleuploadInfo = (file) => {

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
  } */

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

  const mesesConNumero = [
    { numero: '01', nombre: 'ENERO' },
    { numero: '02', nombre: 'FEBRERO' },
    { numero: '03', nombre: 'MARZO' },
    { numero: '04', nombre: 'ABRIL' },
    { numero: '05', nombre: 'MAYO' },
    { numero: '06', nombre: 'JUNIO' },
    { numero: '07', nombre: 'JULIO' },
    { numero: '08', nombre: 'AGOSTO' },
    { numero: '09', nombre: 'SEPTIEMBRE' },
    { numero: '10', nombre: 'OCTUBRE' },
    { numero: '11', nombre: 'NOVIEMBRE' },
    { numero: '12', nombre: 'DICIEMBRE' }
  ];

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

  // Helper para estandarizar el texto del mes
  const normalizeMonth = (monthVal) => {
    if (!monthVal) return '';
    const str = String(monthVal).trim().toUpperCase();
    const found = mesesConNumero.find(m => m.nombre === str || m.numero === str.padStart(2, '0'));
    return found ? found.nombre : str;
  };

  const handleuploadInfo = (file) => {
    if (!file) return;

    // Detectamos si es un archivo plano de texto o CSV
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv');

    Swal.fire({
      title: 'Procesando archivo',
      text: `Por favor, espera mientras se lee el archivo ${isTextFile ? 'de texto' : 'Excel'} y se consolidan las 3 hojas...`,
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

        // Validamos que el libro tenga al menos 3 hojas
        if (workbook.SheetNames.length < 3) {
          Swal.fire({
            icon: 'warning',
            title: 'Estructura incorrecta',
            text: 'El archivo Excel debe contener al menos 3 hojas: Presupuesto CO, Líneas y Vendedores.',
          });
          return;
        }

        // 1. Extraemos las 3 hojas por su posición en el libro
        const sheetCO = workbook.Sheets[workbook.SheetNames[0]];
        const sheetLineas = workbook.Sheets[workbook.SheetNames[1]];
        const sheetVendedores = workbook.Sheets[workbook.SheetNames[2]];

        const jsonCO = XLSX.utils.sheet_to_json(sheetCO);
        const jsonLineas = XLSX.utils.sheet_to_json(sheetLineas);
        const jsonVendedores = XLSX.utils.sheet_to_json(sheetVendedores);

        if (jsonCO.length === 0 || jsonLineas.length === 0 || jsonVendedores.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Hojas vacías',
            text: 'Alguna de las 3 hojas no contiene registros.',
            showConfirmButton: false,
            timer: 5000,
          });
          return;
        }

        // Funciones auxiliares de limpieza interna
        const parseValue = (val) => parseCurrencyToNumber ? parseCurrencyToNumber(val) : (parseFloat(String(val).replace(/[^0-9.-]+/g, '')) || 0);
        const parsePct = (val) => {
          if (typeof val === 'number') return val > 1 ? val / 100 : val;
          const num = parseFloat(String(val).replace('%', '').trim()) || 0;
          return num > 1 ? num / 100 : num;
        };
        const formatCO = (val) => val !== undefined && val !== null ? String(val).trim().padStart(3, '0') : '';
        const cleanStr = (val) => String(val || '').trim().toUpperCase();

        // 🎯 NUEVAS FUNCIONES DE LIMPIEZA DE ESPACIOS
        const cleanText = (val) => String(val || '').trim().replace(/\s+/g, ' ');
        const cleanLine = (val) => {
          const raw = String(val || '').trim();
          // Quita prefijos numéricos como "0001 - " o "0001-" y luego normaliza los espacios
          return raw.replace(/^\d{4}\s*-\s*/, '').trim().replace(/\s+/g, ' ');
        };

        // 2. CONSOLIDACIÓN DE LAS 3 HOJAS EN FILAS TRANSFORMADAS
        const transformedRows = [];

        jsonCO.forEach(rowCO => {
          const co = formatCO(rowCO.CO || rowCO.co || rowCO.Cod_CO);
          const mes = cleanStr(rowCO.mes || rowCO.MES);
          const anio = String(rowCO.año || rowCO.AÑO || rowCO.anio || rowCO.ANIO || '');
          const pptoTotalCO = parseValue(rowCO.presupuesto || rowCO.Ppto_Vta || rowCO.monto);

          if (!co || !mes || !anio || pptoTotalCO <= 0) return;

          // Filtrar líneas y vendedores para este CO, Mes y Año
          const lineasMatch = jsonLineas.filter(l => 
            formatCO(l.co || l.CO || l.Cod_CO) === co &&
            cleanStr(l.mes || l.MES) === mes &&
            String(l.año || l.AÑO || l.anio || l.ANIO || '') === anio
          );

          const vendedoresMatch = jsonVendedores.filter(v => 
            formatCO(v.co || v.CO || v.Cod_CO) === co &&
            cleanStr(v.mes || v.MES) === mes &&
            String(v.año || v.AÑO || v.anio || v.ANIO || '') === anio
          );

          if (lineasMatch.length === 0 || vendedoresMatch.length === 0) return;

          // Suma total de presupuestos de vendedores en este CO para calcular su proporción
          const totalPptoVendedoresCO = vendedoresMatch.reduce((acc, curr) => 
            acc + parseValue(curr.presupuesto || curr.Ppto_Vta || curr.monto), 0
          );

          // Cruce matricial: Línea x Vendedor
          lineasMatch.forEach(lineaObj => {
            const rawLinea = lineaObj.linea || lineaObj.Descrip_Linea || lineaObj.descripLinea || '';
            // 🎯 Aplica la limpieza para la columna Línea
            const descripLinea = cleanLine(rawLinea);

            const pctLinea = parsePct(lineaObj['%'] || lineaObj.porcentaje || lineaObj.participacion);
            const montoLinea = pptoTotalCO * pctLinea;

            vendedoresMatch.forEach(vendedorObj => {
              const rawVendedor = vendedorObj.vendedor || vendedorObj.Rzs_Vendedor || vendedorObj.rzsVendedor || '';
              // 🎯 Aplica la limpieza para la columna Vendedor
              const rzsVendedor = cleanText(rawVendedor);

              const pptoVendedor = parseValue(vendedorObj.presupuesto || vendedorObj.Ppto_Vta || vendedorObj.monto);

              const pctVendedor = totalPptoVendedoresCO > 0 ? (pptoVendedor / totalPptoVendedoresCO) : 0;
              const montoFinal = Math.round(montoLinea * pctVendedor);

              // Estructura exacta requerida para la base de datos
              transformedRows.push({
                co,
                descripLinea,
                rzsVendedor,
                mes,
                anio,
                monto: montoFinal
              });
            });
          });
        });

        if (transformedRows.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Sin coincidencias',
            text: 'No se encontraron cruces válidos entre C.O., Mes y Año en las 3 hojas.',
          });
          return;
        }

        // 3. ESTADOS Y FILTROS ORIGINALES
        setPresupuestoListo(transformedRows);
        setSuggestionsBudget(transformedRows);
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

        setTimeout(() => {
          Swal.close();
        }, 800);

      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error de lectura',
          text: 'Ocurrió un error al procesar las hojas del Excel.',
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
              onClick={(e) => exportBudgetTo3Sheets(suggestionsBudget)}
              className="btn d-flex align-items-center fw-bold btn-sm btn-outline-success"
              style={{ 
                border: `1px solid ${colors.success}`,
                borderRadius: '6px',
                fontSize: '0.85rem',
                padding: '6px 12px'
              }}
            >
              <LuGoal className="me-2" />
                Descargar presupuestos (.xlsx)
            </button>
            <button 
              onClick={downloadBudgetTemplate}
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
          {/* <button 
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
          </button> */}
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
              onClick={(e)=>handleReplaceBudget(e)}
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
              onClick={(e)=>handleCreateBudget(e)}
            >
              <MdAddCircle className="me-2" size={18} /> Agregar / Actualizar
            </button>
          </div>
        </div>

      </div>

      {/* filtros del presupuesto */}
      <div className="">
        <div className={`panel-head d-flex ${isMobile ? 'flex-column' : 'flex-row'} justify-content-between align-items-center`}>
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
      </div>

      {/* tabla de presupuestos */}
        <div className="table-wrap table-responsive w-100" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {/* 1. Validamos que tengamos datos para el año seleccionado antes de mapear */}
            <div>
              <table className="v-middle">
                <thead>
                  <tr>
                    <th>C.O.</th>
                    <th>Linea</th>
                    <th>Vendedor</th>
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
                    currentRows.map((fila) => (
                      <tr>
                        <td className='fw-bold'>{fila.co}</td>
                        <td className=''>{fila.descripLinea}</td>
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
          {/* ) : (
            // 4. Mensaje amigable si aún no se ha seleccionado un año o está cargando
            <div className="text-center p-4 text-muted">
            {anio ? "Cargando presupuestos..." : "Por favor, seleccione un año en el menú superior."}
            </div>
            )} */}
        </div>
        {/* {suggestionsBudget > 1 && (
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top gap-2">
            <span className="small">
              Mostrando registros {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, suggestionsBudget.length)} de {suggestionsBudget.length.toLocaleString()}
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
        )} */}
        {suggestionsBudget.length > 0 && (
          <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center mt-3 px-2`}>
            <small className="text-muted">
              Mostrando <b>{indexOfFirstRow + 1}</b> - <b>{Math.min(indexOfLastRow, suggestionsBudget.length)}</b> de <b>{suggestionsBudget.length}</b> registros
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
                {Array.from({ length: totalPresupuestos }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalPresupuestos || Math.abs(page - currentPage) <= 1)
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
                <li className={`page-item ${currentPage === totalPresupuestos ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPresupuestos))} 
                    disabled={currentPage === totalPresupuestos}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

      {/* Historial de archivos subidos */}
      <div className={`panel ${isMobile ? 'p-1 pt-3' : 'p-3'} ms-0 me-0 rounded shadow-sm row align-items-end mb-2 mt-2 gap-0`} style={{maxHeight: 350, overflowY:'auto'}}>
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
              className={`d-flex align-items-center ${isMobile ? 'gap-1' : 'gap-3'} py-3 ${
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