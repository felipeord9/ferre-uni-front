import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import KpiCard from '../../components/KpiCard';
import { findBudgets } from '../../services/budgetService';
import KpiCardMargen from '../../components/KpiCardMargen';
import { FaFileExcel, FaDownload } from 'react-icons/fa';
import AuthContext from '../../context/authContext';
import { FaUnlock } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { BsCloudUploadFill } from 'react-icons/bs';
import { MdRefresh, MdAddCircle } from 'react-icons/md';
import { findMargins } from '../../services/marginService'
import { 
    BarChart, Bar, 
    Cell, XAxis, YAxis, 
    Tooltip, ResponsiveContainer, 
    CartesianGrid,
    AreaChart, Area,
    Legend, Pie, PieChart,
    LabelList
} from 'recharts';
import * as Icons from 'lucide-react';
import SalesPerformanceDashboard, { BulletBar } from '../../components/BulletBar';
import MonthlyMargin from '../../components/MonthlyMargin';
import { FiUpload } from 'react-icons/fi';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import SellerRankingChart from '../../components/SellerRankingChart';

const COLORES_RANKING_VENDEDORES = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];
const COLORES_RANKING_CLIENTES = ['#1cc88a', '#4e73df', '#e74a3b', '#f6c23e', '#36b9cc'];
const COLORES_LINEA = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1'];

//estilos personalidados para el select multiple
const customSelectStyles2 = {
  // 1. Contenedor principal del input
  control: (base, state) => ({
    ...base,
    borderRadius: 'var(--radius, 0.375rem)',
    backgroundColor: 'var(--panel, #ffffff)',
    borderColor: state.isFocused ? 'var(--blue, #2563eb)' : 'var(--line, #d9e2ef)',
    color: 'var(--ink, #0f172a)',
    minHeight: '30px',
    maxHeight: '50px',
    overflowY: 'auto',
    alignItems: 'flex-start',
    boxShadow: 'none',
    '&:hover': { 
      borderColor: 'var(--blue, #2563eb)' 
    }
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--panel, #ffffff)',
    borderColor: 'var(--line, #d9e2ef)',
    boxShadow: 'var(--shadow)',
    borderRadius: 'var(--radius, 8px)',
    zIndex: 9999
  }),

  // 2. Contenedor interno donde conviven el buscador y los badges
  valueContainer: (base) => ({
    ...base,
    display: 'flex',
    flexDirection: 'column-reverse', // Buscador arriba, badges abajo
    alignItems: 'stretch',
    padding: '2px 4px', // 🎯 Reducido para maximizar el área de lectura
    gap: '4px',
    position: 'relative'
  }),

  // 3. Contenedor de la X global y la flechita
  indicatorsContainer: (base) => ({
    ...base,
    alignSelf: 'flex-start',
    paddingTop: '15px',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '2px',
    margin: '0'
  }),

  // 🎯 4. Reducción y pegado de la 'X' de limpiar todo (Clear Indicator)
  clearIndicator: (base) => ({
    ...base,
    padding: '2px 3px', // 👈 Reduce el espaciado
    cursor: 'pointer',
    color: 'var(--muted, #64748b)',
    svg: {
      width: '18px',   // 👈 Tamaño compacto
      height: '18px',
    },
    '&:hover': {
      color: 'var(--ink, #0f172a)'
    }
  }),

  // 🎯 5. Separador vertical más delgado y compacto
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--line, #64748b)',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '2px',
    marginRight: '2px'
  }),

  // 🎯 6. Flechita de despliegue compacta (Dropdown Indicator)
  dropdownIndicator: (base) => ({
    ...base,
    padding: '1px 3px', // 👈 Espaciado reducido
    cursor: 'pointer',
    color: 'var(--muted, #64748b)',
    svg: {
      width: '18px',   // 👈 Tamaño compacto
      height: '18px',
    },
    '&:hover': {
      color: 'var(--ink, #0f172a)'
    }
  }),

  // 7. El contenedor del buscador/input
  input: (base) => ({
    ...base,
    margin: 0,
    paddingBottom: '2px',
    paddingTop: '2px',
    color: 'var(--ink, #0f172a)'
  }),

  // 8. El texto de ayuda ("Buscar...")
  placeholder: (base) => ({
    ...base,
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
    position: 'absolute',
    top: '12px', // 👈 Ajustado para alinearse perfecto con el padding top reducido
    left: '6px',
    color: 'var(--muted, #64748b)',
    fontSize: '0.85rem'
  }),

  // 9. Estilos de los badges seleccionados
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--panel-2, #f8fafc)',
    border: '1px solid var(--line, #d9e2ef)',
    borderRadius: '4px',
    margin: '2px 1px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '140px', 
  }),

  // 10. Texto dentro del badge
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--ink, #0f172a)',
    fontSize: '0.8rem',
    padding: '2px 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  // 11. Botón 'X' para eliminar badge individual
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--muted, #64748b)',
    flexShrink: 0,
    cursor: 'pointer',
    paddingLeft: '2px',
    paddingRight: '2px',
    ':hover': {
      backgroundColor: 'var(--line, #cbd5e1)',
      color: 'var(--ink, #0f172a)',
    },
  }),
};

const customSelectStyles = {
  // 1. Contenedor principal del input
  control: (base, state) => ({
    ...base,
    borderRadius: 'var(--radius, 0.375rem)',
    backgroundColor: 'var(--panel, #ffffff)',
    borderColor: state.isFocused ? 'var(--blue, #2563eb)' : 'var(--line, #d9e2ef)',
    color: 'var(--ink, #0f172a)',
    minHeight: '30px',
    maxHeight: '50px',
    overflowY: 'auto',
    alignItems: 'flex-start',
    boxShadow: 'none',
    '&:hover': { 
      borderColor: 'var(--blue, #2563eb)' 
    }
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--panel, #ffffff)',
    borderColor: 'var(--line, #d9e2ef)',
    boxShadow: 'var(--shadow)',
    borderRadius: 'var(--radius, 8px)',
    zIndex: 9999
  }),

  // 2. Contenedor interno donde conviven el buscador y los badges
  valueContainer: (base) => ({
    ...base,
    display: 'flex',
    flexDirection: 'column-reverse', // Buscador arriba, badges abajo
    alignItems: 'stretch',
    padding: '2px 4px', // 🎯 Reducido para maximizar el área de lectura
    gap: '4px',
    position: 'relative'
  }),

  // 3. Contenedor de la X global y la flechita
  indicatorsContainer: (base) => ({
    ...base,
    alignSelf: 'flex-start',
    paddingTop: '15px',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '2px',
    margin: '0'
  }),

  // 🎯 4. Reducción y pegado de la 'X' de limpiar todo (Clear Indicator)
  clearIndicator: (base) => ({
    ...base,
    padding: '2px 3px', // 👈 Reduce el espaciado
    cursor: 'pointer',
    color: 'var(--muted, #64748b)',
    svg: {
      width: '18px',   // 👈 Tamaño compacto
      height: '18px',
    },
    '&:hover': {
      color: 'var(--ink, #0f172a)'
    }
  }),

  // 🎯 5. Separador vertical más delgado y compacto
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--line, #64748b)',
    marginTop: '0',
    marginBottom: '0',
    marginLeft: '2px',
    marginRight: '2px'
  }),

  // 🎯 6. Flechita de despliegue compacta (Dropdown Indicator)
  dropdownIndicator: (base) => ({
    ...base,
    padding: '1px 3px', // 👈 Espaciado reducido
    cursor: 'pointer',
    color: 'var(--muted, #64748b)',
    svg: {
      width: '18px',   // 👈 Tamaño compacto
      height: '18px',
    },
    '&:hover': {
      color: 'var(--ink, #0f172a)'
    }
  }),

  // 7. El contenedor del buscador/input
  input: (base) => ({
    ...base,
    margin: 0,
    paddingBottom: '2px',
    paddingTop: '2px',
    color: 'var(--ink, #0f172a)'
  }),

  // 8. El texto de ayuda ("Buscar...")
  placeholder: (base) => ({
    ...base,
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
    position: 'absolute',
    top: '12px', // 👈 Ajustado para alinearse perfecto con el padding top reducido
    left: '6px',
    color: 'var(--muted, #64748b)',
    fontSize: '0.85rem'
  }),

  // 9. Estilos de los badges seleccionados
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--panel-2, #f8fafc)',
    border: '1px solid var(--line, #d9e2ef)',
    borderRadius: '4px',
    margin: '2px 1px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '200px', 
  }),

  // 10. Texto dentro del badge
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--ink, #0f172a)',
    fontSize: '0.8rem',
    padding: '2px 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),

  // 11. Botón 'X' para eliminar badge individual
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--muted, #64748b)',
    flexShrink: 0,
    cursor: 'pointer',
    paddingLeft: '2px',
    paddingRight: '2px',
    ':hover': {
      backgroundColor: 'var(--line, #cbd5e1)',
      color: 'var(--ink, #0f172a)',
    },
  }),
};

export default function Ventas() {
  const [filters, setFilters] = useState({
    seller: [],
    line: [],
    city: [],
    clientType: [],
    supplier: [],
    listPrice: [],
    year: new Date().getFullYear().toString(),
    month: [],
    startDate: '',
    endDate: ''
  });
    
  const { user, setUser } = useContext(AuthContext);
  
  const [kpiData, setKpiData] = useState({
    totalSales: '$0',
    goalProgress: '0%',
    invoices: '0',
    customers: '0',
    margen: '',
    expectedMargin: 27,
    marginStatus: '',
  });

  const [salesRowsCount, setSalesRowsCount] = useState(0);
  const [salesData, setSalesData] = useState([]); 
  const [rawSalesData, setRawSalesData] = useState([]);
  const [yearBudget, setYearBudget] = useState(0);
  const [yearMargin, setYearMargin] = useState(0);
  const [totalBudget, setTotalBudget] = useState([]);
  const [totalMargin, setTotalMargin] = useState([]);
  const [isHoveredUpload, setIsHoveredUpload] = useState(false);
  const [uploadMode, setUploadMode] = useState('replace'); // 'replace' o 'append'
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [marginsData, setMarginsData] = useState([]);

  // 🎯 ESTADOS PARA LA PAGINACIÓN (Evita el congelamiento del DOM)
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100; // Muestra un máximo de 100 filas por vista

  const [filterOptions, setFilterOptions] = useState({
    sellers: [],
    lines: [],
    cities: [],
    clientTypes: [],
    years: [],
    months: [],
    suppliers: [],
    listPrice: [],
  });

  const colors = {
    primary: '#7c3aed', // Morado principal
    primaryLight: '#ede9fe', // Morado muy claro para el fondo del botón
    border: '#cbd5e1', // Gris para los bordes
    textMuted: '#64748b' // Gris para el texto secundario
  };

  //funcion para determinar el presupuesto global
  useEffect(()=>{
    findBudgets()
    .then(({data})=>{
      setTotalBudget(data)
      const datosFiltrados = data.filter(item => Number(item.anio) === new Date().getFullYear());
      const suma = datosFiltrados.reduce((acumulador, item) => {
        const montoNumerico = Number(item.monto) || 0;
        return acumulador + montoNumerico;
      }, 0);
      setYearBudget(suma)
    })
    findMargins()
    .then(({data})=>{
      /* setMarginsData(data) */
      setTotalMargin(data)
      const datosFiltrados = data.filter(item => Number(item.anio) === new Date().getFullYear());
      const suma = datosFiltrados.reduce((acumulador, item) => {
        const montoNumerico = Number(item.expectedMargin) || 0;
        return acumulador + montoNumerico;
      }, 0);
      const result = suma / datosFiltrados.length;
      setYearMargin(result.toFixed(2))
    })
  },[]);

  const mesesConNumero = [
    { numero: '01', nombre: "Enero", abreviatura: "Ene" },
    { numero: '02', nombre: "Febrero", abreviatura: "Feb" },
    { numero: '03', nombre: "Marzo", abreviatura: "Mar" },
    { numero: '04', nombre: "Abril", abreviatura: "Abr" },
    { numero: '05', nombre: "Mayo", abreviatura: "May" },
    { numero: '06', nombre: "Junio", abreviatura: "Jun" },
    { numero: '07', nombre: "Julio", abreviatura: "Jul" },
    { numero: '08', nombre: "Agosto", abreviatura: "Ago" },
    { numero: '09', nombre: "Septiembre", abreviatura: "Sep" },
    { numero: '10', nombre: "Octubre", abreviatura: "Oct" },
    { numero: '11', nombre: "Noviembre", abreviatura: "Nov" },
    { numero: '12', nombre: "Diciembre", abreviatura: "Dic" }
  ];

  const calculateGoal = (mesesInput, year) => {
    // 1. Normalizar 'mesesInput' a un Array de strings limpios en mayúsculas
    let selectedMonths = [];

    if (Array.isArray(mesesInput)) {
      selectedMonths = mesesInput
        .map(m => (m?.value || m || '').toString().trim().toUpperCase())
        .filter(Boolean);
    } else if (mesesInput) {
      const cleanStr = mesesInput.toString().trim().toUpperCase();
      if (cleanStr) selectedMonths = [cleanStr];
    }

    // 2. Filtrar presupuestos por año
    let datosFiltrados = totalBudget.filter(
      item => Number(item.anio) === Number(year)
    );

    // 3. Si hay meses seleccionados, filtrar adicionalmente por esos meses
    if (selectedMonths.length > 0) {
      datosFiltrados = datosFiltrados.filter(item => {
        const itemMes = item.mes ? String(item.mes).trim().toUpperCase() : '';
        return selectedMonths.includes(itemMes);
      });
    }

    // 4. Sumar los montos
    const suma = datosFiltrados.reduce((acumulador, item) => {
      const montoNumerico = Number(item.monto) || 0;
      return acumulador + montoNumerico;
    }, 0);

    // 5. Actualizar estado y retornar
    setYearBudget(suma);
    return suma;
  };

  const calculateMargin = (mesesInput, year) => {
    // 1. Normalizar 'mesesInput' a un Array de strings limpios en mayúsculas
    let selectedMonths = [];

    if (Array.isArray(mesesInput)) {
      selectedMonths = mesesInput
        .map(m => (m?.value || m || '').toString().trim().toUpperCase())
        .filter(Boolean);
    } else if (mesesInput) {
      const cleanStr = mesesInput.toString().trim().toUpperCase();
      if (cleanStr) selectedMonths = [cleanStr];
    }

    // 2. Filtrar presupuestos por año
    let datosFiltrados = totalMargin.filter(
      item => Number(item.anio) === Number(year)
    );

    // 3. Si hay meses seleccionados, filtrar adicionalmente por esos meses
    if (selectedMonths.length > 0) {
      datosFiltrados = datosFiltrados.filter(item => {
        const itemMes = item.mes ? String(item.mes).trim().toUpperCase() : '';
        return selectedMonths.includes(itemMes);
      });
    }

    // 4. Sumar los montos
    const suma = datosFiltrados.reduce((acumulador, item) => {
      const montoNumerico = Number(item.expectedMargin) || 0;
      return acumulador + montoNumerico;
    }, 0);

    // 5. hallar la margen final
    const result= suma / datosFiltrados.length;

    // 5. Actualizar estado y retornar
    setYearBudget(result.toFixed(2));
    return result.toFixed(2);
  };

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

  // Función para calcular los KPIs basados en el listado actual de datos
    const calculateKPIs = (rows, expectedMargin = yearMargin) => {
    if (!rows || rows.length === 0) {
        return { totalSales: '$0', goalProgress: '0%', invoices: '0', customers: '0', margen: '0%' };
    }

    // 1. Total Ventas: Suma de la columna 'valor'
    const total = rows.reduce((sum, row) => sum + (Number(row.valor) || 0), 0);

    // 2. Facturas Únicas: Contamos cuántos códigos de documento 'doc' diferentes existen
    /* const uniqueInvoices = new Set(rows.map(row => row.doc).filter(Boolean)).size; */
    const uniqueInvoices = rows.length;

    // 3. Clientes Únicos: Contamos cuántas cédulas/nit 'cliente' diferentes existen
    const uniqueCustomers = new Set(rows.map(row => row.cliente).filter(Boolean)).size;

    // 4. CÁLCULO DEL MARGEN BRUTO REAL PONDERADO (%)
    const suMargen = calculateMargin(filters.month, filters.year)
    /* const suMargen = rows.reduce((sum, row) => sum + (parseFloat(row.margen) || 0), 0);
    const calculateMargen = suMargen / rows.length; */

    // 6. Cumplimiento Meta
    const metaEmpresa = calculateGoal(filters.month, filters.year)
    const porcentajeMeta = (parseFloat(total) / metaEmpresa) * 100 /* Math.min((total / metaEmpresa) * 100, 100); */ // Tope de 100%

    // 7. DETERMINAR ESTADO DEL SEMÁFORO
    let marginStatus = 'danger'; // Rojo si está por debajo
    if (suMargen >= expectedMargin) {
      marginStatus = 'success'; // Verde si alcanza o supera la meta
    } else if (suMargen >= expectedMargin - 2) {
      marginStatus = 'warning'; // Amarillo (tolerancia de hasta 2% por debajo)
    }

    return {
        totalSales: `$${Math.round(total).toLocaleString('es-CO')}`,
        goalProgress: `${porcentajeMeta.toFixed(2)}%`,
        invoices: uniqueInvoices.toLocaleString('es-CO'),
        customers: uniqueCustomers.toLocaleString('es-CO'),
        margen: `${suMargen}%`,
        expectedMargin: expectedMargin,
        marginStatus: marginStatus,
    };
  };

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

  // Cálculos dinámicos de paginación
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // Este subconjunto contiene únicamente las 100 filas de la página actual
  const currentRows = salesData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(salesData.length / rowsPerPage);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.csv');

    Swal.fire({
      title: 'Procesando archivo',
      text: `Por favor, espera mientras se lee el archivo ${isTextFile ? 'de texto' : 'Excel'}...`,
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

      if (isTextFile) {
        workbook = XLSX.read(data, { type: 'string', codepage: 65001 });
      } else {
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
        "C.O.": "co",
        "Desc. C.O.": "coDesc",
        "Nro documento": "doc",
        "Fecha": "date",
        "Valor subtotal": "subtotal",
        "Vendedor": "noVendedor",
        "Nombre vendedor": "vendedor",
        "PROVEEDOR": "proveedor",
        "LINEA": "linea",
        "Cliente factura": "cliente",
        "Razón social cliente factura": "razonSocial",
        "Desc. tipo de cliente": "typeClient",
        "SUB LINEA": "sublinea",
        "Referencia": "ref",
        "Desc. ítem": "item",
        "Cantidad": "cantidad",
        "Valor bruto": "valor",
        "Márgen promedio": "margen",
        "Lista de precios": "idListPrice",
        "Desc. lista de precios": "descLp"
      };

      const transformedRows = jsonRows.map(row => {
        const newRow = {};
        for (const originalKey in row) {
          const newKey = columnMapping[originalKey] || originalKey;
          
          if (newKey === 'valor' || newKey === 'subtotal') {
            newRow[newKey] = parseCurrencyToNumber(row[originalKey]);
          } else if (newKey === 'date') {
            newRow[newKey] = parseExcelDate(row[originalKey]);
          } else if (newKey === 'co') {
            const originalValue = row[originalKey];
            newRow[newKey] = originalValue !== undefined && originalValue !== null
              ? String(originalValue).trim().padStart(3, '0')
              : '';
          } else if (newKey === 'linea') {
            const originalValue = String(row[originalKey] || '').trim();
            newRow[newKey] = originalValue.replace(/^\d{4}\s*-\s*/, '').trim();
          }else {
            newRow[newKey] = row[originalKey];
          }
        }
        return newRow;
      });

      // 🎯 1. VENDEDORES A EXCLUIR EN LA VISTA INICIAL
      const excludedSellers = [
        'CEBALLOS ARISTIZABAL IVAN ORLANDO',
        'CEBALLOS DE BRAVO BERTHA LUCIA'
      ];

      setRawSalesData(transformedRows);

      // 🎯 2. FILTRAR REGISTROS INICIALES SIN DICHOS VENDEDORES
      const initialFilteredRows = transformedRows.filter(
        item => !excludedSellers.includes(item.vendedor)
      );

      setSalesData(initialFilteredRows);
      setSalesRowsCount(initialFilteredRows.length);
      setCurrentPage(1); 

      // Obtener todos los vendedores para las opciones desplegables
      const allUniqueSellers = [...new Set(transformedRows.map(item => item.vendedor).filter(Boolean))];
      
      // Lista inicial preseleccionada sin los excluidos
      const defaultSelectedSellers = allUniqueSellers.filter(
        seller => !excludedSellers.includes(seller)
      );

      const uniqueLines = [...new Set(transformedRows.map(item => item.linea).filter(Boolean))];
      const uniqueCities = [...new Set(transformedRows.map(item => item.co).filter(Boolean))];
      const uniqueClientTypes = [...new Set(transformedRows.map(item => item.typeClient).filter(Boolean))];
      const uniqueSupplier = [...new Set(transformedRows.map(item => item.proveedor).filter(Boolean))];
      const uniqueListPrice = [...new Set(transformedRows.map(item => item.descLp).filter(Boolean))];
      
      const uniqueYears = [...new Set(transformedRows.map(item => {
        if (!item.date) return null;
        const parts = item.date.split('/');
        return parts.length === 3 ? parts[2] : null;
      }).filter(Boolean))].sort((a, b) => b - a);
      
      const uniqueMonth = mesesConNumero.map(m => m.nombre)/* [...new Set(transformedRows.map(item => {
        if (!item.date) return null;
        const parts = item.date.split('/');
        const mes = parts.length === 3 ? parts[1].padStart(2, '0') : null;
        if (mes) {
          const look = mesesConNumero.find(m => String(m.numero).padStart(2, '0') === mes);
          return look ? look.nombre : null;
        }
        return null;
      }).filter(Boolean))]; */

      // Opciones del selector (incluye a todos los vendedores)
      setFilterOptions({
        sellers: allUniqueSellers,
        lines: uniqueLines,
        cities: uniqueCities,
        clientTypes: uniqueClientTypes,
        years: uniqueYears,
        months: uniqueMonth,
        suppliers: uniqueSupplier,
        listPrice: uniqueListPrice,
      });

      // 🎯 3. DETECTAR AÑO Y MES ACTUAL
      const today = new Date();
      const currentYearStr = String(today.getFullYear());
      const currentMonthNumStr = String(today.getMonth() + 1).padStart(2, '0');
      
      const currentMonthObj = mesesConNumero.find(m => String(m.numero).padStart(2, '0') === currentMonthNumStr);
      const currentMonthName = currentMonthObj ? currentMonthObj.nombre : null;

      // Determinar año y mes por defecto
      const defaultYear = uniqueYears.includes(currentYearStr) ? currentYearStr : (uniqueYears[0] || '');
      const defaultMonthName = (currentMonthName && uniqueMonth.includes(currentMonthName))
        ? currentMonthName
        : (uniqueMonth[0] || '');

      // 🎯 4. ACTUALIZAR ESTADO DE FILTROS ACTIVO
      setFilters(prev => ({
        ...prev,
        seller: defaultSelectedSellers,
        year: defaultYear || prev.year,
        month: defaultMonthName ? [defaultMonthName] : prev.month // Pasa como Array para tu Select multiselect
      }));

      // Calculamos KPIs iniciales sobre la data limpia inicial
      const initialKpis = calculateKPIs(initialFilteredRows);
      setKpiData(initialKpis);

      setTimeout(() => {
        Swal.close(); 
      }, 800); 
    };

    if (isTextFile) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  };

  useEffect(() => {
    let filtered = [...rawSalesData];

    // 1. FILTRO DE AÑO
    if (filters.year) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;
        const parts = row.date.split('/');
        return parts.length === 3 && parts[2] === filters.year;
      });
    }

    // 2. FILTRO DE MES
    if (filters.month && filters.month.length > 0) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;
        const parts = row.date.split('/');
        
        if (parts.length !== 3) return false;

        const numMes = parts[1]; // Ej: "01", "02", etc.

        // 1. Buscamos el nombre del mes correspondiente en tu array auxiliar
        const monthObj = mesesConNumero.find(m => m.numero === numMes);
        if (!monthObj) return false;

        // 2. Si el multiselect guarda objetos { value: 'Enero', label: 'Enero' } o strings 'Enero':
        // extraemos el valor puro para asegurarnos
        const selectedMonthNames = filters.month.map(m => m.value || m);

        // 3. Verificamos si el nombre del mes de la fila está en los seleccionados
        return selectedMonthNames.includes(monthObj.nombre);
      });
    }

    // 3. FILTRO POR RANGO DE FECHAS (startDate y endDate)
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;
        const parts = row.date.split('/');
        if (parts.length !== 3) return false;
        const rowDate = new Date(parts[2], parts[1] - 1, parts[0]);

        if (filters.startDate) {
          const start = new Date(filters.startDate + 'T00:00:00');
          if (rowDate < start) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate + 'T23:59:59');
          if (rowDate > end) return false;
        }

        return true;
      });
    }

    // 🎯 4. FILTROS MÚLTIPLES (Usando .includes)

    // Vendedor múltiple
    if (filters.seller && filters.seller.length > 0) {
      filtered = filtered.filter(row => filters.seller.includes(row.vendedor));
    }

    // Línea múltiple
    if (filters.line && filters.line.length > 0) {
      filtered = filtered.filter(row => filters.line.includes(row.linea));
    }

    // Agencia (Ciudad) múltiple
    if (filters.city && filters.city.length > 0) {
      filtered = filtered.filter(row => filters.city.includes(row.co));
    }

    // Tipo de cliente múltiple
    if (filters.clientType && filters.clientType.length > 0) {
      filtered = filtered.filter(row => filters.clientType.includes(row.typeClient));
    }

    // 🎯 5. CÁLCULO DE LA RENTABILIDAD ESPERADA (MARGEN META)
    let expectedMargin = yearMargin; // Valor por defecto si no hay C.O. seleccionado o hay varios

    const selectedCities = (filters.city || []).map(c => c.value || c);

    if (selectedCities.length === 1) {
      const selectedCo = String(selectedCities[0]).padStart(3, '0');
      /* const coMatch = marginsData.find(m => String(m.co).padStart(3, '0') === selectedCo); */

      const datosFiltrados = totalMargin.filter(m => String(m.co).padStart(3, '0') === selectedCo);
      const suma = datosFiltrados.reduce((acumulador, item) => {
        const montoNumerico = Number(item.expectedMargin) || 0;
        return acumulador + montoNumerico;
      }, 0);
      const result = suma / datosFiltrados.length;
      
      if (result) {
        expectedMargin = parseFloat(result.toFixed(2));
      }
    }

    // Actualización de estado
    setSalesData(filtered);
    setSalesRowsCount(filtered.length);
    setCurrentPage(1);

    const filteredKpis = calculateKPIs(filtered, expectedMargin);
    setKpiData(filteredKpis);

  }, [filters, rawSalesData]);

  const exportToExcel = () => {
    console.log("Exportando a Excel...");
  };

  const exportToPdf = () => {
    console.log("Exportando a PDF...");
  };

  /* Funcion para optener el ranking por vendedor */
  const getSellerRankingData = (rows) => {
    if (!rows || rows.length === 0) return [];

    // Agrupamos y sumamos las ventas por vendedor
    const salesBySeller = rows.reduce((acc, row) => {
        const seller = row.vendedor || 'Desconocido';
        const val = Number(row.valor) || 0;
        acc[seller] = (acc[seller] || 0) + val;
        return acc;
    }, {});

    // Convertimos a un array para poder ordenar y formatear
    return Object.entries(salesBySeller)
        .map(([name, total]) => ({
        name,
        // Guardamos el valor bruto para el gráfico y una versión redondeada en Millones para la etiqueta
        Ventas: Math.round(total),
        'M ($)': Math.round(total / 1000000) // Ej: 15,000,000 -> 15
        }))
        .sort((a, b) => b.Ventas - a.Ventas) // Ordenar de mayor a menor
        .slice(0, 10); // 🏆 Nos quedamos solo con el Top 5 mejores
  };

  /* Funcion para optener el ranking de clientes */
  const getClientRankingData = (rows) => {
    if (!rows || rows.length === 0) return [];

    // Agrupamos y sumamos las ventas por cliente
    const salesByClient = rows.reduce((acc, row) => {
        const client = row.razonSocial || row.RAZONSOCIAL ||'Desconocido';
        const val = Number(row.valor) || 0;
        acc[client] = (acc[client] || 0) + val;
        return acc;
    }, {});

    // Convertimos a un array para poder ordenar y formatear
    return Object.entries(salesByClient)
        .map(([name, total]) => ({
        name,
        // Guardamos el valor bruto para el gráfico y una versión redondeada en Millones para la etiqueta
        Ventas: Math.round(total),
        'M ($)': Math.round(total / 1000000) // Ej: 15,000,000 -> 15
        }))
        .sort((a, b) => b.Ventas - a.Ventas) // Ordenar de mayor a menor
        .slice(0, 10); // 🏆 Nos quedamos solo con el Top 5 mejores
  };

  /* Funcion para optener el ranking por proveedor */
  const getSupplierRankingData = (rows) => {
    if (!rows || rows.length === 0) return [];

    // Agrupamos y sumamos las ventas por vendedor
    const salesBySupplier = rows.reduce((acc, row) => {
        const supplier = row.proveedor || row.PROVEEDOR ||'Desconocido';
        const val = Number(row.valor) || 0;
        acc[supplier] = (acc[supplier] || 0) + val;
        return acc;
    }, {});

    // Convertimos a un array para poder ordenar y formatear
    return Object.entries(salesBySupplier)
        .map(([name, total]) => ({
        name,
        // Guardamos el valor bruto para el gráfico y una versión redondeada en Millones para la etiqueta
        Ventas: Math.round(total),
        'M ($)': Math.round(total / 1000000) // Ej: 15,000,000 -> 15
        }))
        .sort((a, b) => b.Ventas - a.Ventas) // Ordenar de mayor a menor
        .slice(0, 10); // 🏆 Nos quedamos solo con el Top 5 mejores
  };

  //funcion para hallar la comparativa por mes
  const getMonthCompareData = (rows) => {
    if (!rows || rows.length === 0) return [];

    const nombresMeses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    // Agrupamos directamente ya que las filas pertenecen todas al mismo año
    const salesByMonth = rows.reduce((acc, row) => {
      if (!row.date) return acc;
      
      const parts = row.date.split('/');
      if (parts.length === 3) {
        const rowMonth = parseInt(parts[1], 10) - 1; // Mes base 0 (0-11)
        const val = Number(row.valor) || 0;
        acc[rowMonth] = (acc[rowMonth] || 0) + val;
      }
      return acc;
    }, {});

    return nombresMeses.map((name, index) => ({
      name,
      Ventas: Math.round(salesByMonth[index] || 0)
    }));
  };

  //funcion para ventas por linea
  const getLineShareData = (rows) => {
    if (!rows || rows.length === 0) return [];

    // Agrupamos y sumamos el valor bruto por cada línea
    const salesByLine = rows.reduce((acc, row) => {
        const linea = row.linea || 'Otras';
        const val = Number(row.valor) || 0;
        acc[linea] = (acc[linea] || 0) + val;
        return acc;
    }, {});

    // Convertimos a array y ordenamos de mayor a menor venta
    return Object.entries(salesByLine)
        .map(([name, value]) => ({
        name,
        value: Math.round(value)
        }))
        .sort((a, b) => b.value - a.value);
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

  //funcion para comparar ventas por mes vs presupuesto
  const getCompareData = (salesRows, budgetRows, selectedYear) => {
    // Nombres cortos para las etiquetas del gráfico/tabla
    const nombresMesesCortos = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    // Nombres completos en MAYÚSCULAS para emparejar con item.mes del presupuesto
    const nombresMesesLargos = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const salesByMonth = {};
    const budgetByMonth = {};

    // 1. Procesar Ventas (Acumula por índice 0-11)
    if (salesRows && salesRows.length > 0) {
      salesRows.forEach(row => {
        if (!row.date) return;
        const parts = row.date.split('/');
        if (parts.length === 3) {
          const rowYear = parts[2];
          if (String(rowYear) === String(selectedYear)) {
            const rowMonth = parseInt(parts[1], 10) - 1; // Base 0 (0-11)
            const val = Number(row.valor) || 0;
            salesByMonth[rowMonth] = (salesByMonth[rowMonth] || 0) + val;
          }
        }
      });
    }

    // 2. Procesar Presupuestos (Acumula por Nombre en Mayúsculas: "ENERO", "FEBRERO"...)
    if (budgetRows && budgetRows.length > 0) {
      budgetRows.forEach(item => {
        if (String(item.anio) === String(selectedYear)) {
          const monthName = item.mes ? item.mes.trim().toUpperCase() : null;
          const monto = Number(item.monto) || 0;

          if (monthName) {
            budgetByMonth[monthName] = (budgetByMonth[monthName] || 0) + monto;
          }
        }
      });
    }

    // 3. Unificar ambos flujos cruzando el índice con el Nombre del Mes
    return nombresMesesCortos.map((shortName, index) => {
      const fullName = nombresMesesLargos[index]; // Obtenemos "ENERO" para index 0, "FEBRERO" para index 1, etc.

      return {
        name: shortName,
        Ventas: Math.round(salesByMonth[index] || 0),
        Presupuesto: Math.round(budgetByMonth[fullName] || 0) // 👈 Leemos budgetByMonth por su clave textual
      };
    });
  };

  const convertMonth = (selectedMonthStr) => {
    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const targetMonthNum = parseInt(selectedMonthStr, 10);
    const selectedMonthName = nombresMeses[targetMonthNum - 1];
    return selectedMonthName
  }

  const compareCoVsBudget = (salesRows, budgetRows, selectedYear, selectedMonthFilter) => {
    // Lista de Centros de Operación
    const nombresCo = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "020", "100"];

    // Nombres de meses tal como vienen en el JSON de presupuestos (MAYÚSCULAS)
    const nombresMesesLargos = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const salesByCo = {};
    const budgetByCo = {};

    // --- 1. RESOLVER EL MES Y NÚMERO DE MES SELECCIONADO ---
    // Extraemos el valor si viene como objeto { value, label }
    const rawMonthVal = selectedMonthFilter?.value || selectedMonthFilter;
    
    let targetMonthNum = null;  // Para ventas (1 - 12)
    let targetMonthName = null; // Para presupuestos ("ENERO", "FEBRERO"...)

    if (rawMonthVal) {
      const rawStr = String(rawMonthVal).trim().toUpperCase();
      const parsedNum = parseInt(rawStr, 10);

      // Si viene como número o string numérico (ej: "01", "1", 1)
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
        targetMonthNum = parsedNum;
        targetMonthName = nombresMesesLargos[parsedNum - 1];
      } else {
        // Si viene como texto de mes (ej: "ENERO", "Enero", "Ene")
        const foundIdx = nombresMesesLargos.findIndex(m => m.startsWith(rawStr) || rawStr.startsWith(m));
        if (foundIdx !== -1) {
          targetMonthNum = foundIdx + 1;
          targetMonthName = nombresMesesLargos[foundIdx];
        }
      }
    }

    // Helper para asegurar formato de 3 dígitos (ej: 1 -> "001")
    const formatCo = (coValue) => {
      if (!coValue) return "";
      const clean = String(coValue).trim();
      return clean.padStart(3, '0');
    };

    // --- 2. PROCESAR VENTAS (Filtrando por Año y Mes Núm) ---
    if (salesRows && salesRows.length > 0 && targetMonthNum) {
      salesRows.forEach(row => {
        if (!row.date) return;
        const parts = row.date.split('/');
        if (parts.length === 3) {
          const rowMonth = parseInt(parts[1], 10);
          const rowYear = parts[2];

          if (String(rowYear) === String(selectedYear) && rowMonth === targetMonthNum) {
            const coKey = formatCo(row.co || row.CO);
            if (coKey) {
              const val = Number(row.valor) || 0;
              salesByCo[coKey] = (salesByCo[coKey] || 0) + val;
            }
          }
        }
      });
    }

    // --- 3. PROCESAR PRESUPUESTOS (Filtrando por Año y Mes Nombre) ---
    if (budgetRows && budgetRows.length > 0 && targetMonthName) {
      budgetRows.forEach(item => {
        const itemAnio = String(item.anio);
        const itemMes = item.mes ? item.mes.trim().toUpperCase() : "";

        if (itemAnio === String(selectedYear) && itemMes === targetMonthName) {
          const coKey = formatCo(item.co);
          if (coKey) {
            const monto = Number(item.monto) || 0;
            budgetByCo[coKey] = (budgetByCo[coKey] || 0) + monto;
          }
        }
      });
    }

    // --- 4. UNIFICAR RESULTADOS CON LA LISTA MAESTRA DE COs ---
    return nombresCo.map(co => ({
      name: `${co}`,
      Ventas: Math.round(salesByCo[co] || 0),
      Presupuesto: Math.round(budgetByCo[co] || 0)
    }));
  };

    // Memorizamos los datos combinados para rendimiento
  const chartData = useMemo(() => {
    if (filters.month && filters.month.length === 1) {
      return compareCoVsBudget(salesData, totalBudget, filters.year, filters.month[0]);
    } else if(filters.month && filters.month.length === 0 || filters.month && filters.month.length > 1){
      return getCompareData(salesData, totalBudget, filters.year);
    }
  }, [salesData, totalBudget, filters.year, filters.month]);

  // procesar datos para el grafico ventas vs margen por CO
  const compareCoVsMargin = (salesRows, marginRows, selectedYear, monthFilters) => {
    // Lista Maestra de Centros de Operación
    const nombresCo = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "020", "100"];

    const nombresMesesLargos = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const salesByCo = {};
    const marginSumByCo = {};  // Acumula la suma de % de margen
    const marginCountByCo = {}; // Acumula la cantidad de registros por C.O.
    const budgetByCo = {};
    const expectedMarginByCo = {};

    // --- 1. RESOLVER EL/LOS MESES SELECCIONADOS EN UN SET DE NÚMEROS ---
    const filterArray = Array.isArray(monthFilters) ? monthFilters : (monthFilters ? [monthFilters] : []);
    const targetMonthNums = new Set();

    filterArray.forEach(mItem => {
      const rawVal = mItem?.value !== undefined ? mItem.value : mItem;
      if (rawVal !== null && rawVal !== undefined) {
        const rawStr = String(rawVal).trim().toUpperCase();
        const parsedNum = parseInt(rawStr, 10);

        if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
          targetMonthNums.add(parsedNum);
        } else {
          const foundIdx = nombresMesesLargos.findIndex(m => m.startsWith(rawStr) || rawStr.startsWith(m));
          if (foundIdx !== -1) {
            targetMonthNums.add(foundIdx + 1);
          }
        }
      }
    });

    const monthMultiplier = targetMonthNums.size > 0 ? targetMonthNums.size : 12;

    // Helper para formatear C.O. a 3 dígitos (ej: 1 -> "001")
    const formatCo = (coValue) => {
      if (coValue === null || coValue === undefined || coValue === '') return "";
      return String(coValue).trim().padStart(3, '0');
    };

    // Helper para limpiar valores monetarios (ej: "$221.046,00" -> 221046)
    const parseCurrency = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      // Remueve $, puntos de miles y cambia coma decimal por punto
      const cleanStr = String(val).replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim();
      return parseFloat(cleanStr) || 0;
    };

    // --- 2. PROCESAR VENTAS Y SUMA DE MÁRGENES ---
    if (salesRows && salesRows.length > 0) {
      salesRows.forEach(row => {
        // Soporta "Fecha" o "date"
        const dateVal = row.Fecha || row.fecha || row.date;
        if (!dateVal) return;

        const parts = String(dateVal).split('/');
        if (parts.length === 3) {
          const rowMonth = parseInt(parts[1], 10);
          const rowYear = parts[2];

          const matchYear = !selectedYear || String(rowYear) === String(selectedYear);
          const matchMonth = targetMonthNums.size === 0 || targetMonthNums.has(rowMonth);

          if (matchYear && matchMonth) {
            // Soporta "C.O.", "co" o "CO"
            const coKey = formatCo(row['C.O.'] ?? row.co ?? row.CO);
            
            if (coKey) {
              // Valor de la venta (Subtotal o Venta)
              const valor = parseCurrency(row['Valor subtotal'] || row.valor || row.subtotal);
              
              // Margen (Busca 'Márgen promedio', 'Margen promedio', 'margen', etc.)
              const rawMargen = row['Márgen promedio'] ?? row['Margen promedio'] ?? row.margen ?? '0';
              const margenPct = parseFloat(String(rawMargen).replace(',', '.')) || 0;

              // Acumulado de ventas totales $
              salesByCo[coKey] = (salesByCo[coKey] || 0) + valor;

              // Acumulado de la suma de márgenes y conteo de registros
              marginSumByCo[coKey] = (marginSumByCo[coKey] || 0) + margenPct;
              marginCountByCo[coKey] = (marginCountByCo[coKey] || 0) + 1;
            }
          }
        }
      });
    }

    // --- 3. PROCESAR METAS Y PRESUPUESTOS ---
    if (marginRows && marginRows.length > 0) {
      marginRows.forEach(item => {
        const coKey = formatCo(item['C.O.'] ?? item.co ?? item.CO ?? item.punto);
        if (coKey) {
          const presupuestoMensual = Number(item.budget || item.presupuesto || item.monto) || 0;
          const renEsperada = parseFloat(String(item.expectedMargin || item.ren_esperada || item.rentabilidad || 0).replace(',', '.')) || 0;

          budgetByCo[coKey] = presupuestoMensual * monthMultiplier;
          expectedMarginByCo[coKey] = renEsperada;
        }
      });
    }

    // --- 4. UNIFICAR RESULTADOS Y PROMEDIO SIMPLE ---
    return nombresCo.map(co => {
      const totalVentas = Math.round(salesByCo[co] || 0);
      
      // Promedio simple del margen = (Suma de Márgenes) / (Número de Registros)
      const totalMarginSum = marginSumByCo[co] || 0;
      const totalCount = marginCountByCo[co] || 0;
      const margenPromedioPct = totalCount > 0 ? (totalMarginSum / totalCount) : 0;

      const metaPresupuesto = budgetByCo[co] || 0;
      const metaRentabilidad = expectedMarginByCo[co] || 27;

      const cumplimientoVentasPct = metaPresupuesto > 0 ? (totalVentas / metaPresupuesto) * 100 : 0;
      const cumplimientoMargenPct = metaRentabilidad > 0 ? (margenPromedioPct / metaRentabilidad) * 100 : 0;

      return {
        co: co,
        nombre: `${co}`,
        ventas: totalVentas,
        metaVentas: metaPresupuesto,
        cumplimientoVentasPct: Number(cumplimientoVentasPct.toFixed(2)),
        rentabilidad: Number(margenPromedioPct.toFixed(2)), // Promedio % exacto
        metaRentabilidad: metaRentabilidad,
        cumplimientoMargenPct: Number(cumplimientoMargenPct.toFixed(2))
      };
    });
  };

  //funcion para calcular la margen por mes
  const getMarginCompareData = (salesRows, marginRows, selectedYear) => {
    // Nombres cortos para las etiquetas del gráfico/tabla
    const nombresMesesCortos = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    // Nombres completos en MAYÚSCULAS para emparejar con item.mes del presupuesto/metas
    const nombresMesesLargos = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    const salesByMonth = {};
    const utilityByMonth = {};
    const budgetByMonth = {};
    const expectedMarginByMonth = {};

    // 1. Procesar Ventas y Utilidad Real (Acumula por índice de mes 0-11)
    if (salesRows && salesRows.length > 0) {
      salesRows.forEach(row => {
        if (!row.date) return;
        const parts = row.date.split('/');
        if (parts.length === 3) {
          const rowYear = parts[2];
          if (String(rowYear) === String(selectedYear)) {
            const rowMonth = parseInt(parts[1], 10) - 1; // Base 0 (0 a 11)
            
            if (rowMonth >= 0 && rowMonth <= 11) {
              const valor = Number(row.valor || row.subtotal) || 0;
              // Parse del margen (soporta decimales con coma o punto)
              const margenPct = parseFloat(String(row.margen || '0').replace(',', '.')) || 0;

              salesByMonth[rowMonth] = (salesByMonth[rowMonth] || 0) + valor;
              // Utilidad bruta acumulada para cálculo de margen ponderado
              utilityByMonth[rowMonth] = (utilityByMonth[rowMonth] || 0) + (valor * (margenPct / 100));
            }
          }
        }
      });
    }

    // 2. Procesar Metas y Presupuestos por Mes (Acumula por Nombre en Mayúsculas: "ENERO", "FEBRERO"...)
    if (marginRows && marginRows.length > 0) {
      marginRows.forEach(item => {
        const itemAnio = item.anio || item.year || selectedYear;
        if (String(itemAnio) === String(selectedYear)) {
          const monthName = item.mes ? item.mes.trim().toUpperCase() : null;
          const presupuesto = Number(item.monto || item.presupuesto || item.budget) || 0;
          const renEsperada = parseFloat(String(item.expectedMargin || item.ren_esperada || item.rentabilidad || 0).replace(',', '.')) || 0;

          if (monthName) {
            budgetByMonth[monthName] = (budgetByMonth[monthName] || 0) + presupuesto;
            // Si hay varias filas del mismo mes, guardamos/promediamos la rentabilidad esperada
            if (renEsperada > 0) {
              expectedMarginByMonth[monthName] = renEsperada;
            }
          }
        }
      });
    }

    // 3. Unificar ambos flujos cruzando los 12 meses
    return nombresMesesCortos.map((shortName, index) => {
      const fullName = nombresMesesLargos[index]; // Obtenemos "ENERO" para index 0, "FEBRERO" para index 1, etc.

      const totalVentas = Math.round(salesByMonth[index] || 0);
      const totalUtilidad = utilityByMonth[index] || 0;

      // Margen Ponderado Real % del mes
      const margenRealPct = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

      // Metas del mes
      const metaPresupuesto = Math.round(budgetByMonth[fullName] || 0);
      const metaRentabilidad = expectedMarginByMonth[fullName] || 27; // 27% por defecto si no se especifica en la tabla

      // Cumplimientos %
      const cumplimientoVentasPct = metaPresupuesto > 0 ? (totalVentas / metaPresupuesto) * 100 : 0;
      const cumplimientoMargenPct = metaRentabilidad > 0 ? (margenRealPct / metaRentabilidad) * 100 : 0;

      return {
        name: shortName,                          // "Ene", "Feb", etc.
        fullName: fullName,                       // "ENERO", "FEBRERO", etc.
        Ventas: totalVentas,                      // Venta real acumulada $
        Presupuesto: metaPresupuesto,             // Presupuesto meta $
        cumplimientoVentasPct: Number(cumplimientoVentasPct.toFixed(2)),
        Rentabilidad: Number(margenRealPct.toFixed(2)), // Margen ponderado real %
        MetaRentabilidad: metaRentabilidad,             // Rentabilidad meta %
        cumplimientoMargenPct: Number(cumplimientoMargenPct.toFixed(2))
      };
    });
  };

  // Memorizamos los datos combinados para rendimiento
  const chartMargin = useMemo(() => {
    if (filters.month && filters.month.length >= 1) {
      return compareCoVsMargin(salesData, totalMargin, filters.year, filters.month);
    } else if(filters.month && filters.month.length === 0 ){
      return getMarginCompareData(salesData, totalMargin, filters.year);
    }
  }, [salesData, totalMargin, filters.year, filters.month]);

  // funcion para sacar el ranking de presupuesto por seller
  const getSellerRankingWithBudget = (
    salesRows = [], 
    budgetRows = [], 
    selectedYear = '', 
    selectedMonth = []
  ) => {
    const nombresMeses = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    // 1. RESOLVER ARRAY DE MESES A UN SET DE NOMBRES EN MAYÚSCULAS
    const filterArray = Array.isArray(selectedMonth) ? selectedMonth : (selectedMonth ? [selectedMonth] : []);
    const targetMonthNames = new Set();

    filterArray.forEach(mItem => {
      const rawVal = mItem?.value !== undefined ? mItem.value : mItem;
      if (rawVal !== null && rawVal !== undefined) {
        const rawStr = String(rawVal).trim().toUpperCase();
        const parsedNum = parseInt(rawStr, 10);

        if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
          targetMonthNames.add(nombresMeses[parsedNum - 1]);
        } else {
          const foundIdx = nombresMeses.findIndex(m => m.startsWith(rawStr) || rawStr.startsWith(m));
          if (foundIdx !== -1) {
            targetMonthNames.add(nombresMeses[foundIdx]);
          }
        }
      }
    });

    const salesBySeller = {};
    const utilityBySeller = {};
    const budgetBySeller = {};

    // 2. PROCESAR VENTAS Y UTILIDAD REAL PONDERADA
    if (salesRows && salesRows.length > 0) {
      salesRows.forEach(row => {
        if (row.date) {
          const parts = row.date.split('/');
          if (parts.length === 3) {
            const rowYear = parts[2];
            const rowMonthIdx = parseInt(parts[1], 10) - 1;

            if (selectedYear && String(rowYear) !== String(selectedYear)) return;
            if (targetMonthNames.size > 0 && !targetMonthNames.has(nombresMeses[rowMonthIdx])) return;
          }
        }

        const sellerName = (
          row.rzsVendedor || 
          row.vendedor || 
          row.nombreVendedor || 
          'SIN VENDEDOR'
        ).trim().toUpperCase();

        const montoVenta = Number(row.valor || row.subtotal || row.monto) || 0;
        const valMargenPct = parseFloat(String(row.margen || '0').replace(',', '.')) || 0;

        salesBySeller[sellerName] = (salesBySeller[sellerName] || 0) + montoVenta;
        // Utilidad real = Venta * (% Margen / 100)
        utilityBySeller[sellerName] = (utilityBySeller[sellerName] || 0) + (montoVenta * (valMargenPct / 100));
      });
    }

    // 3. PROCESAR PRESUPUESTOS (Suma dinámica por meses filtrados)
    if (budgetRows && budgetRows.length > 0) {
      budgetRows.forEach(item => {
        if (selectedYear && String(item.anio) !== String(selectedYear)) return;

        const itemMes = item.mes ? item.mes.trim().toUpperCase() : '';
        if (targetMonthNames.size > 0 && !targetMonthNames.has(itemMes)) return;

        const sellerName = (item.rzsVendedor || item.vendedor || 'SIN VENDEDOR').trim().toUpperCase();
        const montoPresupuesto = Number(item.monto || item.presupuesto) || 0;

        budgetBySeller[sellerName] = (budgetBySeller[sellerName] || 0) + montoPresupuesto;
      });
    }

    // 4. UNIFICAR TODOS LOS VENDEDORES
    const allSellers = Array.from(
      new Set([...Object.keys(salesBySeller), ...Object.keys(budgetBySeller)])
    );

    return allSellers
      .map(seller => {
        const ventas = Math.round(salesBySeller[seller] || 0);
        const presupuesto = Math.round(budgetBySeller[seller] || 0);
        const utilidadTotal = utilityBySeller[seller] || 0;

        // Margen Ponderado Real: (Utilidad Total / Ventas Totales) * 100
        const rentabilidad = ventas > 0 
          ? Number(((utilidadTotal / ventas) * 100).toFixed(1)) 
          : 0;

        return {
          name: seller,
          Ventas: ventas,
          Presupuesto: presupuesto,
          rentabilidad: rentabilidad
        };
      })
      .sort((a, b) => b.Ventas - a.Ventas);
  };

  //funcion para sacar ventas y presupuesto por linea de producto
  const getLineShareWithBudgetData = (
    salesRows = [], 
    budgetRows = [], 
    selectedYear = '', 
    selectedMonth = []
  ) => {
    const nombresMeses = [
      "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
      "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    ];

    // 1. CONVERTIR 'selectedMonth' A UN SET DE NOMBRES EN MAYÚSCULAS (Soporta Arrays, Objetos y Strings)
    const filterArray = Array.isArray(selectedMonth) ? selectedMonth : (selectedMonth ? [selectedMonth] : []);
    const targetMonthNames = new Set();

    filterArray.forEach(mItem => {
      const rawVal = mItem?.value !== undefined ? mItem.value : mItem;
      if (rawVal !== null && rawVal !== undefined) {
        const rawStr = String(rawVal).trim().toUpperCase();
        const parsedNum = parseInt(rawStr, 10);

        if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 12) {
          targetMonthNames.add(nombresMeses[parsedNum - 1]);
        } else {
          const foundIdx = nombresMeses.findIndex(m => m.startsWith(rawStr) || rawStr.startsWith(m));
          if (foundIdx !== -1) {
            targetMonthNames.add(nombresMeses[foundIdx]);
          }
        }
      }
    });

    const salesByLine = {};
    const utilityByLine = {};
    const budgetByLine = {};

    // 2. PROCESAR VENTAS Y UTILIDAD REAL (Margen Ponderado)
    if (salesRows && salesRows.length > 0) {
      salesRows.forEach(row => {
        // Filtrar por Fecha (DD/MM/YYYY)
        if (row.date) {
          const parts = row.date.split('/');
          if (parts.length === 3) {
            const rowYear = parts[2];
            const rowMonthIdx = parseInt(parts[1], 10) - 1;

            if (selectedYear && String(rowYear) !== String(selectedYear)) return;
            if (targetMonthNames.size > 0 && !targetMonthNames.has(nombresMeses[rowMonthIdx])) return;
          }
        }

        // Detectar nombre de la Línea
        const lineName = (
          row.descripLinea || 
          row.linea || 
          row.lineaProducto || 
          'OTRAS LÍNEAS'
        ).trim().toUpperCase();

        const montoVenta = Number(row.valor || row.subtotal || row.monto) || 0;
        const valMargenPct = parseFloat(String(row.margen || '0').replace(',', '.')) || 0;

        salesByLine[lineName] = (salesByLine[lineName] || 0) + montoVenta;
        
        // Acumular Utilidad Monetaria Real = Venta * (% Margen / 100)
        utilityByLine[lineName] = (utilityByLine[lineName] || 0) + (montoVenta * (valMargenPct / 100));
      });
    }

    // 3. PROCESAR PRESUPUESTO POR LÍNEA
    if (budgetRows && budgetRows.length > 0) {
      budgetRows.forEach(item => {
        // Filtrar Año
        if (selectedYear && String(item.anio) !== String(selectedYear)) return;

        // Filtrar Mes
        const itemMes = item.mes ? item.mes.trim().toUpperCase() : '';
        if (targetMonthNames.size > 0 && !targetMonthNames.has(itemMes)) return;

        const lineName = (
          item.descripLinea || 
          item.linea || 
          item.lineaProducto || 
          'OTRAS LÍNEAS'
        ).trim().toUpperCase();

        const montoPresupuesto = Number(item.monto || item.presupuesto) || 0;
        budgetByLine[lineName] = (budgetByLine[lineName] || 0) + montoPresupuesto;
      });
    }

    // 4. UNIFICAR Y RETORNAR CONSOLIDADO
    const allLines = Array.from(
      new Set([...Object.keys(salesByLine), ...Object.keys(budgetByLine)])
    );

    return allLines
      .map(line => {
        const ventas = Math.round(salesByLine[line] || 0);
        const presupuesto = Math.round(budgetByLine[line] || 0);
        const utilidadTotal = utilityByLine[line] || 0;

        // Cálculo del Margen Ponderado Real: (Utilidad Total / Ventas Totales) * 100
        const rentabilidad = ventas > 0 
          ? ((utilidadTotal / ventas) * 100).toFixed(1) 
          : '0.0';

        return {
          name: line,
          Ventas: ventas,
          Presupuesto: presupuesto,
          rentabilidad: rentabilidad
        };
      })
      .sort((a, b) => b.Ventas - a.Ventas);
  };

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

  // Simular clic en el input oculto al hacer clic en la caja
  const onButtonClick = () => {
    inputRef.current.click();
  };

  const RenderPercentage = ({ x, y, width, height, value }) => (
    <text
        x={x + width + 5}
        y={y + height / 2 + 4}
        fill="#6c757d"
        fontSize={11}
        fontWeight="bold"
    >
        {value}%
    </text>
  );

  return (
    <div className="container-fluid p-2 stack gap-4 w-100">
      
      {/* subir archivo */}
      {user.role === 'admin' &&
        /* sesion para subir documentos */
        <div className="panel shadow-sm rounded-4 p-3 w-100 ">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2 w-100">
            <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
              <FaFileExcel className="me-2" style={{ color: colors.primary }} />
              Cargar archivo de ventas
            </h5>
          </div>

          {/* Zona de Drag & Drop */}
          <div 
            className="text-center rounded-3 d-flex flex-column align-items-center justify-content-center w-100"
            style={{
              border: `2px dashed ${dragActive ? colors.primary : colors.border}`,
              padding: '10px 10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            /* onDrop={handleDrop} */
            onClick={onButtonClick}
          >
            <BsCloudUploadFill size={40} style={{ color: colors.primary, marginBottom: '15px' }} />
            
            <h6 className="fw-semibold mb-2">
              {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : "Arrastra tu archivo Excel aquí o haz clic para seleccionar"}
            </h6>

            {/* Input oculto real */}
            <input
              ref={inputRef}
              className="form-sm" 
              type="file"
              accept=".xlsx,.xls,.txt,.csv"
              onChange={(e) => handleFileChange(e)}
              style={{ display: "none" }}
            />
          </div>

          {/* Botones de Acción */}
          {/* <div className="d-flex flex-column flex-md-row justify-content-end align-items-md-center gap-3">
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
              onClick={(e)=>handleuploadInfo(e)}
            >
              <FiUpload className="me-2" size={18} /> Subir ventas
            </button>
          </div> */}

        </div>

      }

      {/* TOOLBAR DE FILTROS */}
      <div className="toolbar p-2 rounded shadow-sm row align-items-end mb-4 gap-0">
        {/* Filtro por vendedor */}
        <div className="col-12 col-sm-6 col-md-3">
          <label className="form-label fw-semibold small mb-1">Vendedor</label>
          <Select
            isMulti
            // 1. Agregamos la opción de seleccionar todos al inicio
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.sellers.map(s => ({ value: s, label: s }))
            ]}
            value={filters.seller.map(s => ({ value: s, label: s }))}
            onChange={(selectedOptions) => {
              // Manejo cuando se limpia el campo completamente
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, seller: [] });
                return;
              }

              // 2. Evaluamos si el usuario seleccionó "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Alternar: si ya estaban todos marcados, vaciamos; si no, seleccionamos todos los vendedores
                if (filters.seller.length === filterOptions.sellers.length) {
                  setFilters({ ...filters, seller: [] });
                } else {
                  setFilters({
                    ...filters,
                    seller: filterOptions.sellers
                  });
                }
              } else {
                // Selección individual
                setFilters({
                  ...filters,
                  seller: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>

        {/* Filtro por linea */}
        <div className="col-12 col-sm-6 col-md-3">
          <label className="form-label fw-semibold small mb-1">Línea</label>
          <Select
            isMulti
            // 1. Inyectamos la opción de seleccionar todos al inicio
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.lines.map(l => ({ value: l, label: l }))
            ]}
            value={filters.line.map(l => ({ value: l, label: l }))}
            onChange={(selectedOptions) => {
              // Manejo si se limpia la selección
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, line: [] });
                return;
              }

              // 2. Evaluamos si se seleccionó "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Alternar: si ya estaban todas las líneas marcadas, vaciamos; si no, seleccionamos todas
                if (filters.line.length === filterOptions.lines.length) {
                  setFilters({ ...filters, line: [] });
                } else {
                  setFilters({
                    ...filters,
                    line: filterOptions.lines
                  });
                }
              } else {
                // Selección individual
                setFilters({
                  ...filters,
                  line: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>

        {/* filtro por co */}
        <div className="col-12 col-sm-6 col-md-3">
          <label className="form-label fw-semibold small mb-1">C.O.</label>
          <Select
            isMulti
            // 1. Agregamos la opción de seleccionar todos al inicio
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.cities.map(c => ({ value: c, label: c }))
            ]}
            value={filters.city.map(c => ({ value: c, label: c }))}
            onChange={(selectedOptions) => {
              // Si se limpia el select completamente
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, city: [] });
                return;
              }

              // 2. Evaluamos si el usuario seleccionó "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Alternar: si ya estaban todos marcados, vaciamos; si no, marcamos todas las ciudades
                if (filters.city.length === filterOptions.cities.length) {
                  setFilters({ ...filters, city: [] });
                } else {
                  setFilters({
                    ...filters,
                    city: filterOptions.cities
                  });
                }
              } else {
                // Selección manual de items
                setFilters({
                  ...filters,
                  city: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>
        
        {/* filtro por tipo de cliente */}
        <div className="col-12 col-sm-6 col-md-3">
          <label className="form-label fw-semibold small mb-1">Tipo cliente</label>
          <Select
            isMulti
            // 1. Inyectamos la opción de seleccionar todos
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.clientTypes.map(t => ({ value: t, label: t }))
            ]}
            value={filters.clientType.map(t => ({ value: t, label: t }))}
            onChange={(selectedOptions) => {
              // Manejo si se limpia la selección
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, clientType: [] });
                return;
              }

              // 2. Verificamos si se seleccionó la opción "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Si ya estaban todos seleccionados y vuelve a pulsar "Todos", limpia la selección
                if (filters.clientType.length === filterOptions.clientTypes.length) {
                  setFilters({ ...filters, clientType: [] });
                } else {
                  // Si no, selecciona todos los tipos de cliente disponibles
                  setFilters({
                    ...filters,
                    clientType: filterOptions.clientTypes
                  });
                }
              } else {
                // Selección individual
                setFilters({
                  ...filters,
                  clientType: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>
        
        {/* filtro por proveedor */}
        <div className="col-12 col-sm-6 col-md-3 mt-1">
          <label className="form-label fw-semibold small mb-1">Proveedor</label>
          <Select
            isMulti
            // 1. Agregamos la opción "Seleccionar Todos" al inicio del array de opciones
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.suppliers.map(t => ({ value: t, label: t }))
            ]}
            value={filters.supplier.map(t => ({ value: t, label: t }))}
            onChange={(selectedOptions, actionMeta) => {
              // Manejo cuando no hay nada seleccionado o se limpian los datos
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, supplier: [] });
                return;
              }

              // 2. Comprobamos si el usuario hizo clic en "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Si ya están todos seleccionados y el usuario hace clic en desmarcar uno, o si seleccionó "Todos"
                if (filters.supplier.length === filterOptions.suppliers.length) {
                  // Si ya estaban todos y tocó algo, o volvió a pulsar seleccionar todos: vaciamos la selección
                  setFilters({ ...filters, supplier: [] });
                } else {
                  // Si no estaban todos seleccionados, marcamos todos los proveedores disponibles
                  setFilters({
                    ...filters,
                    supplier: filterOptions.suppliers
                  });
                }
              } else {
                // Selección normal de opciones individuales
                setFilters({
                  ...filters,
                  supplier: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>

        {/* Filtro por lista de precio */}
        <div className="col-12 col-sm-6 col-md-3 mt-1">
          <label className="form-label fw-semibold small mb-1">Lista de precio</label>
          <Select
            isMulti
            // 1. Agregamos la opción "Seleccionar Todos" al inicio del array de opciones
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.listPrice.map(t => ({ value: t, label: t }))
            ]}
            value={filters.listPrice.map(t => ({ value: t, label: t }))}
            onChange={(selectedOptions, actionMeta) => {
              // Manejo cuando no hay nada seleccionado o se limpian los datos
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, listPrice: [] });
                return;
              }

              // 2. Comprobamos si el usuario hizo clic en "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Si ya están todos seleccionados y el usuario hace clic en desmarcar uno, o si seleccionó "Todos"
                if (filters.listPrice.length === filterOptions.listPrice.length) {
                  // Si ya estaban todos y tocó algo, o volvió a pulsar seleccionar todos: vaciamos la selección
                  setFilters({ ...filters, listPrice: [] });
                } else {
                  // Si no estaban todos seleccionados, marcamos todos los proveedores disponibles
                  setFilters({
                    ...filters,
                    listPrice: filterOptions.listPrice
                  });
                }
              } else {
                // Selección normal de opciones individuales
                setFilters({
                  ...filters,
                  listPrice: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>

        {/* filtro por mes */}
        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold small mb-1">Mes</label>
          <Select
            isMulti
            // 1. Agregamos la opción de seleccionar todos al inicio
            options={[
              { value: '*', label: '--- Seleccionar Todos ---' },
              ...filterOptions.months.map(c => ({ value: c, label: c }))
            ]}
            value={filters.month.map(c => ({ value: c, label: c }))}
            onChange={(selectedOptions) => {
              // Manejo cuando se limpia la selección completamente
              if (!selectedOptions || selectedOptions.length === 0) {
                setFilters({ ...filters, month: [] });
                return;
              }

              // 2. Evaluamos si el usuario seleccionó "Seleccionar Todos"
              const hasSelectAll = selectedOptions.some(opt => opt.value === '*');

              if (hasSelectAll) {
                // Alternar: si ya estaban todos los meses seleccionados, vaciamos; si no, marcamos todos los meses disponibles
                if (filters.month.length === filterOptions.months.length) {
                  setFilters({ ...filters, month: [] });
                } else {
                  setFilters({
                    ...filters,
                    month: filterOptions.months
                  });
                }
              } else {
                // Selección individual
                setFilters({
                  ...filters,
                  month: selectedOptions.map(opt => opt.value)
                });
              }
            }}
            placeholder="Buscar..."
            styles={customSelectStyles}
          />
        </div>

        {/* filtro por año */}
        <div className="col-12 col-sm-6 col-md-1">
          <label className="form-label fw-semibold text-secondary small mb-1">Año</label>
          <select 
            value={filters.year}
            style={{height: 55}}
            onChange={e => setFilters({...filters, year: e.target.value, startDate: '', endDate: ''})}
          >
            {filterOptions.years.map((y, idx) => <option key={idx} value={y}>{y}</option>)}
          </select>
        </div>

        {/* BOTONES DE EXPORTACIÓN */}
        <div className="col-12 col-md-1 d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
          <button onClick={exportToExcel} className="btn btn-outline-success d-flex align-items-center flex-fill justify-content-center" title="Exportar Excel">
            <Icons.FileSpreadsheet size={16} /> <span className="d-md-none ms-2">Excel</span>
          </button>
          <button onClick={exportToPdf} className="btn btn-outline-danger d-flex align-items-center flex-fill justify-content-center" title="Exportar PDF">
            <Icons.FileText size={16} /> <span className="d-md-none ms-2">PDF</span>
          </button>
        </div>
      </div>


      <div id="salesExportArea" className="stack gap-4">
        {/* ÁREA DE EXPORTACIÓN (KPIs y Gráficos) */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <KpiCard title="Total ventas" value={kpiData.totalSales} subtitle="Valor bruto" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <KpiCard title="Cumplimiento meta" value={kpiData.goalProgress} subtitle="Ventas / Meta" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <KpiCard title="Facturas y notas" value={kpiData.invoices} subtitle="Documentos únicos" />
          </div>
          {/* <div className="col-12 col-sm-6 col-lg-3">
            <KpiCard title="Clientes" value={kpiData.customers} subtitle="Clientes únicos" />
          </div> */}
          <div className="col-12 col-sm-6 col-lg-3">
            <KpiCardMargen 
              title="Margen" 
              value={kpiData.margen} 
              subtitle="Margen bruto" 
              status={kpiData.marginStatus}
              expectedValue={kpiData.expectedMargin}
            />
          </div>
        </div>

        {/* Desde aqui comienzan los graficos */}
        <div className="row row-cols-1 row-cols-md-2 g-4 mb-2">
        {/* Grafico comparativo por mes */}
          {/* {(filters.month.length === 0 ||  filters.month.length > 1) &&
            <div className="col">
              <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-3'}`}>
                <h5 className="small fw-bold mb-3">Comparativa Mensual de Ventas</h5>
                <div style={{ width: '100%', height: '380px' }}>
                  {salesData.length === 0 ? (
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                      Sin datos - Cargue un archivo
                    </div>
                  ) : (() => {
                    // 1. Obtenemos los datos filtrados con ventas > 0
                    const chartData = getMonthCompareData(salesData).filter(
                      (item) => Number(item.Ventas) > 0
                    );

                    // 2. Calculamos la suma total para sacar la proporción % de cada mes
                    const totalVentas = chartData.reduce(
                      (acc, item) => acc + Number(item.Ventas), 
                      0
                    );

                    // 3. Inyectamos el porcentaje calculado en el array de datos
                    const dataWithPercentage = chartData.map((item) => {
                      const val = Number(item.Ventas);
                      const pct = totalVentas > 0 ? ((val / totalVentas) * 100).toFixed(1) : 0;
                      return {
                        ...item,
                        porcentaje: pct, // Ej: "18.5"
                      };
                    });

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dataWithPercentage}
                          margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4e73df" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4e73df" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line, #f0f0f0)" />
                          <XAxis dataKey="name" stroke="var(--muted, #6c757d)" fontSize={12} />
                          <YAxis 
                            stroke="var(--muted, #6c757d)" 
                            fontSize={12} 
                            tickFormatter={(v) => `$${(v / 1000000)}M`} 
                          />
                          
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div 
                                    className="p-2 shadow-sm rounded border"
                                    style={{ 
                                      backgroundColor: 'var(--panel, #fff)', 
                                      borderColor: 'var(--line, #e0e0e0)',
                                      fontSize: '0.85rem'
                                    }}
                                  >
                                    <p className="fw-bold mb-1" style={{ color: 'var(--ink, #0f172a)' }}>
                                      {label}
                                    </p>
                                    <p className="mb-0" style={{ color: '#4e73df' }}>
                                      Ventas: <strong>${Number(data.Ventas).toLocaleString('es-CO')}</strong>
                                    </p>
                                    <p className="mb-0 small" style={{ color: '#6c757d'}}>
                                      Participación: <strong>{data.porcentaje}%</strong> del total
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          
                          <Area 
                            type="monotone" 
                            dataKey="Ventas" 
                            stroke="#4e73df" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorVentas)" 
                          >
                            <LabelList 
                              dataKey="porcentaje" 
                              position="top" 
                              formatter={(val) => `${val}%`}
                              style={{ fill: 'var(--muted, #6c757d)', fontSize: '11px', fontWeight: 'bold' }}
                            />
                          </Area>
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>
            </div>
          } */}
  
          {/* Grafico ventas por rentabilidad (margen) */}
          <div className="col">
            {filters.month.length >= 1 ?
              <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-0'}`} style={{height: '447px', maxWidth: isMobile && '88vw', overflowY: 'auto', overflowX: 'auto'}}>
                {salesData.length === 0 ? (
                  <div className='d-flex h-100 flex-column'>
                    <h5 className="small fw-bold pt-1 mt-1 ps-2 mb-3">Comparativa Ventas Vs Rentabilidad Por C.O.</h5>
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                      Sin datos - Cargue un archivo
                    </div>
                  </div>
                ):(
                  <SalesPerformanceDashboard performanceData={chartMargin} />
                )}
              </div>
              :
              <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-0'}`} style={{height: '447px', maxWidth: isMobile && '88vw', overflowY: 'auto', overflowX: 'auto'}}>
                {salesData.length === 0 ? (
                  <div className='d-flex h-100 flex-column'>
                    <h5 className="small fw-bold pt-1 mt-1 ps-2 mb-3">Comparativa Ventas Vs Rentabilidad ({new Date().getFullYear()})</h5>
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                      Sin datos - Cargue un archivo
                    </div>
                  </div>
                ):(
                  <MonthlyMargin monthlyCompareData={chartMargin} isMobile={isMobile}/>
                )}
              </div>
            }
          </div>

          {/* Ranking por vendedor */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-0'}`} style={{maxWidth: '88vw', overflowX:'auto'}}>
              <h5 className="small fw-bold mb-3 pt-1 mt-1 ps-2 pb-0">Ventas y rentabilidad por vendedor</h5>

              {salesData.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center rounded small" style={{ height: '428px' }}>
                  Sin datos - Cargue un archivo
                </div>
              ) : (() => {
                // 1. Obtención de datos
                const rawRankingData = getSellerRankingWithBudget
                  ? getSellerRankingWithBudget(salesData, totalBudget, filters.year, filters.month)
                  : [];

                // 2. Escala máxima global para mantener proporciones en la barra
                const maxGlobalVal = rawRankingData.reduce((max, item) => {
                  return Math.max(max, Number(item.Ventas) || 0, Number(item.Presupuesto) || 0);
                }, 0);
                
                const maxScale = (maxGlobalVal > 0 ? maxGlobalVal : 1) * 1.15;

                // 3. Mapeo y procesamiento de los indicadores
                const tableData = rawRankingData.map((item) => {
                  const ventas = Number(item.Ventas) || 0;
                  const presupuesto = Number(item.Presupuesto) || 0;
                  const rentabilidad = Number(item.rentabilidad || item.margen) || 0;

                  const cumplimiento = presupuesto > 0 ? (ventas / presupuesto) * 100 : 0;
                  const pctVentaBarra = Math.min((ventas / maxScale) * 100, 100);
                  const pctMetaBarra = Math.min((presupuesto / maxScale) * 100, 100);

                  return {
                    ...item,
                    ventas,
                    presupuesto,
                    cumplimiento,
                    rentabilidad,
                    pctVentaBarra,
                    pctMetaBarra
                  };
                });

                return (
                    <div 
                      style={{ 
                        maxHeight: '398px', 
                        overflowY: 'auto', 
                        overflowX: isMobile ? 'auto' : 'hidden',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      <table 
                        className="table-wrap table-responsive align-middle mb-0"
                        style={{ 
                          minWidth: isMobile ? '600px' : '100%' // Asegura que las barras mantengan su ancho en mobile
                        }}
                      >
                        <thead>
                          <tr 
                            className="fw-bold border-bottom" 
                            style={{ fontSize: '0.8rem', borderColor: 'var(--bs-border-color)' }}
                          >
                            <th scope="col" style={{ width: isMobile ? '120px' : '25%' }} className="ps-1">
                              Vendedor
                            </th>
                            <th scope="col" style={{ width: isMobile ? '220px' : '35%' }}>
                              Ventas / meta
                            </th>
                            <th scope="col" style={{ width: isMobile ? '140px' : '20%' }} className="text-center">
                              Cumplimiento
                            </th>
                            <th scope="col" style={{ width: isMobile ? '160px' : '20%' }} className="text-center pe-1">
                              Rentabilidad
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((row, index) => {
                            const isSuccess = row.cumplimiento >= 100;
                            const isWarning = row.cumplimiento >= 80 && row.cumplimiento < 100;

                            // Color del punto de semáforo
                            const statusColor = isSuccess ? '#10b981' : isWarning ? '#f97316' : '#ef4444';

                            return (
                              <tr 
                                key={`seller-row-${index}`}
                                className="border-bottom"
                                style={{ borderColor: 'var(--bs-border-color-translucent, rgba(127,127,127,0.15))' }}
                              >
                                {/* 1. Vendedor */}
                                <td className="ps-1 fw-bold" style={{ fontSize: '0.72rem' }}>
                                  {row.name}
                                </td>

                                {/* 2. Ventas / Meta (Barra dual) */}
                                <td className="py-2">
                                  <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                                    <span className="fw-bold">${(row.ventas / 1000000).toFixed(0)} M</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                      Meta ${(row.presupuesto / 1000000).toFixed(0)} M
                                    </span>
                                  </div>

                                  {/* Track de la barra */}
                                  <div 
                                    className="position-relative rounded-pill overflow-visible" 
                                    style={{ height: '8px', border: '#334155 solid 2px', width: '100%' }}
                                  >
                                    {/* Barra Azul de Ventas Realizadas */}
                                    <div 
                                      className="rounded-pill" 
                                      style={{ 
                                        height: '100%', 
                                        width: `${row.pctVentaBarra}%`, 
                                        backgroundColor: '#2563eb',
                                        transition: 'width 0.4s ease-in-out'
                                      }} 
                                    />

                                    {/* Marcador Vertical de la Meta */}
                                    {row.presupuesto > 0 && (
                                      <div 
                                        className="position-absolute top-50 translate-middle-y" 
                                        style={{ 
                                          left: `${row.pctMetaBarra}%`, 
                                          height: '14px', 
                                          width: '2px', 
                                          backgroundColor: 'var(--bs-body-color, #ffffff)',
                                          boxShadow: '0 0 3px rgba(0, 0, 0, 0.4)',
                                          zIndex: 2
                                        }} 
                                      />
                                    )}
                                  </div>
                                </td>

                                {/* 3. Cumplimiento */}
                                <td className="text-center">
                                  <span className="fw-bold" style={{ fontSize: '0.82rem' }}>
                                    {row.cumplimiento.toFixed(1).replace('.', ',')}%
                                  </span>
                                  <span style={{ color: statusColor, fontSize: '1rem', lineHeight: 1 }}>●</span>
                                </td>

                                {/* 4. Rentabilidad */}
                                <td className="pe-1">
                                  <div className="d-flex flex-column align-items-center justify-content-center">
                                    <div>
                                      <span className="fw-bold" style={{ fontSize: '0.82rem' }}>
                                        {row.rentabilidad.toFixed(1).replace('.', ',')}%
                                      </span>
                                    </div>
                                    <div 
                                      className="rounded-pill w-75" 
                                      style={{ height: '8px', border: '#334155 solid 2px' }}
                                    >
                                      <div 
                                        className="rounded-pill" 
                                        style={{ 
                                          height: '100%', 
                                          width: `${Math.min(Math.max(row.rentabilidad, 0), 100)}%`, 
                                          backgroundColor: '#10b981' 
                                        }} 
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                );
              })()}
            </div>
          </div>

          {/* Ventas por linea */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-0'}`} style={{maxWidth: '88vw', overflowX:'auto'}}> 
              <h5 className="small fw-bold mb-3 pt-1 mt-1 ps-2 pb-0">Ventas por Línea de producto</h5>
              
              {salesData.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center rounded small" style={{ height: '395px' }}>
                  Sin datos - Cargue un archivo
                </div>
              ) : (() => {
                // 1. Obtener la data con Ventas, Presupuesto y Margen Promedio (rentabilidad)
                const rawLineData = getLineShareWithBudgetData(salesData, totalBudget, filters.year, filters.month);

                // 2. Procesar los indicadores por cada producto/línea
                const tableData = rawLineData.map((item) => {
                  const ventas = Number(item.Ventas) || 0;
                  const presupuesto = Number(item.Presupuesto) || 0;
                  const rentabilidad = Number(item.rentabilidad) || 0;

                  const cumplimiento = presupuesto > 0 ? (ventas / presupuesto) * 100 : 0;

                  // Definir escala visual máxima para la barra de ventas/meta
                  const maxScale = Math.max(ventas, presupuesto, 1) * 1.15;
                  const pctVentaBarra = Math.min((ventas / maxScale) * 100, 100);
                  const pctMetaBarra = Math.min((presupuesto / maxScale) * 100, 100);

                  return {
                    ...item,
                    ventas,
                    presupuesto,
                    cumplimiento,
                    rentabilidad,
                    pctVentaBarra,
                    pctMetaBarra
                  };
                });

                return (
                  // Contenedor con scroll responsivo
                  <div 
                    style={{ 
                      maxHeight: '395px', 
                      overflowY: 'auto', 
                      overflowX: isMobile ? 'auto' : 'hidden', 
                      WebkitOverflowScrolling: 'touch' 
                    }}
                  >
                    <table 
                      className="table-wrap table-responsive align-middle mb-0"
                      style={{ 
                        minWidth: isMobile ? '600px' : '100%' // Asegura espacio para las barras en celular
                      }}
                    >
                      <thead>
                        <tr 
                          className="fw-bold border-bottom" 
                          style={{ fontSize: '0.8rem', borderColor: 'var(--bs-border-color, #2d2d2d)'}}
                        >
                          <th scope="col" style={{ width: isMobile ? '120px' : '25%' }} className="ps-1">
                            Línea
                          </th>
                          <th scope="col" style={{ width: isMobile ? '220px' : '35%' }}>
                            Ventas / meta
                          </th>
                          <th scope="col" style={{ width: isMobile ? '120px' : '20%' }} className="text-center">
                            Cumplimiento
                          </th>
                          <th scope="col" style={{ width: isMobile ? '140px' : '20%' }} className="text-center pe-1">
                            Rentabilidad
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, index) => {
                          const isSuccess = row.cumplimiento >= 100;
                          const isWarning = row.cumplimiento >= 85 && row.cumplimiento < 100;

                          // Color del punto de cumplimiento (Verde, Naranja o Rojo)
                          const statusColor = isSuccess ? '#10b981' : isWarning ? '#f97316' : '#ef4444';

                          return (
                            <tr 
                              key={`row-${index}`}
                              className="border-bottom"
                              style={{ borderColor: 'var(--bs-border-color-translucent, rgba(127,127,127,0.15))' }}
                            >
                              {/* 1. Nombre del Producto */}
                              <td className="ps-1 fw-bold" style={{ fontSize: '0.7rem' }}>
                                {row.name}
                              </td>

                              {/* 2. Ventas / Meta (Barra dual) */}
                              <td className="py-2">
                                <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                                  <span className="fw-bold">${(row.ventas / 1000000).toFixed(0)} M</span>
                                  <span style={{ color: '#888', fontSize: '0.75rem' }}>
                                    Meta ${(row.presupuesto / 1000000).toFixed(0)} M
                                  </span>
                                </div>

                                {/* Barra de Progreso con Marcador de Meta */}
                                <div className="position-relative rounded-pill overflow-visible" style={{ height: '8px', border: '#334155 solid 2px', width: '100%' }}>
                                  {/* Barra Azul de Ventas Realizadas */}
                                  <div 
                                    className="rounded-pill" 
                                    style={{ 
                                      height: '100%', 
                                      width: `${row.pctVentaBarra}%`, 
                                      backgroundColor: '#2563eb',
                                      transition: 'width 0.3s'
                                    }} 
                                  />
                                  {/* Indicador Vertical de la Meta */}
                                  {row.presupuesto > 0 && (
                                    <div 
                                      className="position-absolute top-50 translate-middle-y" 
                                      style={{ 
                                        left: `${row.pctMetaBarra}%`, 
                                        height: '14px', 
                                        width: '2px', 
                                        border: '#334155 solid 1px',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 0 4px rgba(255,255,255,0.8)',
                                        zIndex: 2
                                      }} 
                                    />
                                  )}
                                </div>
                              </td>

                              {/* 3. % Cumplimiento */}
                              <td className="text-center">
                                <span className="fw-bold me-1" style={{ fontSize: '0.82rem' }}>
                                  {row.cumplimiento.toFixed(1).replace('.', ',')}%
                                </span>
                                <span style={{ color: statusColor, fontSize: '1.1rem', lineHeight: 1 }}>●</span>
                              </td>

                              {/* 4. Rentabilidad (Margen) con mini barra verde */}
                              <td className="pe-1 mb-1">
                                <div className="d-flex flex-column align-items-center gap-1 ">
                                  <div>
                                    <span className="fw-bold" style={{ minWidth: '40px', fontSize: '0.82rem' }}>
                                      {row.rentabilidad.toString().replace('.', ',')}%
                                    </span>
                                  </div>
                                  <div className="rounded-pill w-75" style={{ height: '8px', border: '#334155 solid 1px' }}>
                                    <div 
                                      className="rounded-pill" 
                                      style={{ 
                                        height: '100%', 
                                        width: `${Math.min(Math.max(row.rentabilidad, 0), 100)}%`, 
                                        backgroundColor: '#10b981' 
                                      }} 
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
          
          {/* Ranking por cliente */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-3'}`}>
              <h5 className="small fw-bold mb-3">Ranking de clientes (Top 10)</h5>
              <div style={{ width: '100%', height: '380px' }}>
                {salesData.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                    Sin datos - Cargue un archivo
                  </div>
                ) : (() => {
                  // 1. Obtenemos la data base del ranking
                  const rawClientData = getClientRankingData(salesData);

                  // 2. Calculamos la suma total de las ventas del Top 10
                  const totalVentasTop = rawClientData.reduce(
                    (acc, item) => acc + (Number(item.Ventas) || 0), 
                    0
                  );

                  // 3. Inyectamos la participación % de cada cliente
                  const clientWithPercentage = rawClientData.map((item) => {
                    const val = Number(item.Ventas) || 0;
                    const pct = totalVentasTop > 0 ? ((val / totalVentasTop) * 100).toFixed(1) : '0.0';
                    return {
                      ...item,
                      porcentaje: pct, // Ej: "15.4"
                    };
                  });

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={clientWithPercentage}
                        margin={{ top: 5, right: 50, left: 20, bottom: 5 }} // right: 50 asegura que el % no se corte
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line, #f0f0f0)" />
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000)}M`} stroke="var(--muted, #6c757d)" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="var(--muted, #6c757d)" fontSize={11} width={80} />
                        
                        {/* Tooltip con información detallada */}
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div 
                                  className="p-2 shadow-sm rounded border"
                                  style={{ 
                                    backgroundColor: 'var(--panel, #fff)', 
                                    borderColor: 'var(--line, #e0e0e0)',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <p className="fw-bold mb-1" style={{ color: 'var(--ink, #0f172a)' }}>
                                    {label}
                                  </p>
                                  <p className="mb-0" style={{ color: '#4e73df' }}>
                                    Total Ventas: <strong>${Number(data.Ventas).toLocaleString('es-CO')}</strong>
                                  </p>
                                  <p className="mb-0 small" style={{ color: '#6c757d'}}>
                                    Participación: <strong>{data.porcentaje}%</strong> del Top 10
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        {/* Barra de Ventas Estática */}
                        <Bar 
                          dataKey="Ventas" 
                          radius={[0, 4, 4, 0]} 
                          barSize={18}
                          isAnimationActive={false} // 👈 Elimina animaciones para mantener los textos estáticos
                        >
                          {/* Colores individuales para cada cliente */}
                          {clientWithPercentage.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORES_RANKING_CLIENTES[index % COLORES_RANKING_CLIENTES.length]} 
                            />
                          ))}

                          {/* 🎯 ETIQUETA ESTÁTICA NATIVA A LA DERECHA */}
                          <LabelList 
                            dataKey="Ventas" 
                            position="right"
                            dx={8}
                            formatter={(val) => {
                              const num = Number(val) || 0;
                              return `$${(num / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
                            }}
                            style={{ fill: '#6c757d', fontSize: '11px', fontWeight: 'bold' }}
                          />
                          {/* <LabelList
                              dataKey="porcentaje"
                              content={<RenderPercentage />}
                          /> */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Ranking por proveedor */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-3'}`}>
              <h5 className="small fw-bold mb-3">Ranking de proveedores (Top 10)</h5>
              <div style={{ width: '100%', height: '380px' }}>
                {salesData.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                    Sin datos - Cargue un archivo
                  </div>
                ) : (() => {
                  // 1. Obtenemos la data base del ranking
                  const rawClientData = getSupplierRankingData(salesData);

                  // 2. Calculamos la suma total de las ventas del Top 10
                  const totalVentasTop = rawClientData.reduce(
                    (acc, item) => acc + (Number(item.Ventas) || 0), 
                    0
                  );

                  // 3. Inyectamos la participación % de cada cliente
                  const clientWithPercentage = rawClientData.map((item) => {
                    const val = Number(item.Ventas) || 0;
                    const pct = totalVentasTop > 0 ? ((val / totalVentasTop) * 100).toFixed(1) : '0.0';
                    return {
                      ...item,
                      porcentaje: pct, // Ej: "15.4"
                    };
                  });

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={clientWithPercentage}
                        margin={{ top: 5, right: 50, left: 20, bottom: 5 }} // right: 50 asegura que el % no se corte
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line, #f0f0f0)" />
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000)}M`} stroke="var(--muted, #6c757d)" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="var(--muted, #6c757d)" fontSize={11} width={80} />
                        
                        {/* Tooltip con información detallada */}
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div 
                                  className="p-2 shadow-sm rounded border"
                                  style={{ 
                                    backgroundColor: 'var(--panel, #fff)', 
                                    borderColor: 'var(--line, #e0e0e0)',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <p className="fw-bold mb-1" style={{ color: 'var(--ink, #0f172a)' }}>
                                    {label}
                                  </p>
                                  <p className="mb-0" style={{ color: '#4e73df' }}>
                                    Total Ventas: <strong>${Number(data.Ventas).toLocaleString('es-CO')}</strong>
                                  </p>
                                  <p className="mb-0 small" style={{ color: '#6c757d'}}>
                                    Participación: <strong>{data.porcentaje}%</strong> del Top 10
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        {/* Barra de Ventas Estática */}
                        <Bar 
                          dataKey="Ventas" 
                          radius={[0, 4, 4, 0]} 
                          barSize={18}
                          isAnimationActive={false} // 👈 Elimina animaciones para mantener los textos estáticos
                        >
                          {/* Colores individuales para cada cliente */}
                          {clientWithPercentage.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORES_RANKING_CLIENTES[index % COLORES_RANKING_CLIENTES.length]} 
                            />
                          ))}

                          {/* 🎯 ETIQUETA ESTÁTICA NATIVA A LA DERECHA */}
                          <LabelList 
                            dataKey="Ventas" 
                            position="right"
                            dx={8}
                            formatter={(val) => {
                              const num = Number(val) || 0;
                              return `$${(num / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
                            }}
                            style={{ fill: '#6c757d', fontSize: '11px', fontWeight: 'bold' }}
                          />
                          {/* <LabelList
                              dataKey="porcentaje"
                              content={<RenderPercentage />}
                          /> */}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Grafico Ventas por lista de precio */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-3'}`}>
              <h5 className="small fw-bold mb-3">Ventas por Lista de Precio</h5>
              <div style={{ width: '100%', height: '380px' }}>
                {salesData.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                    Sin datos - Cargue un archivo
                  </div>
                ) : (() => {
                  // 1. Agrupamos los datos de ventas por "descLp"
                  const lpGrouped = salesData.reduce((acc, curr) => {
                    const lpName = curr.descLp || curr.desc_lp || 'Sola / Sin Lista';
                    const valor = Number(curr.monto || curr.valor || curr.total || 0);

                    if (!acc[lpName]) {
                      acc[lpName] = 0;
                    }
                    acc[lpName] += valor;
                    return acc;
                  }, {});

                  // 2. Convertimos el objeto agrupado a un array
                  const rawLpData = Object.keys(lpGrouped).map((key) => ({
                    name: key,
                    value: lpGrouped[key]
                  }));

                  // 3. Calculamos el total acumulado
                  const totalVentasLp = rawLpData.reduce(
                    (acc, item) => acc + (Number(item.value) || 0),
                    0
                  );

                  // 4. Inyectamos el % de participación
                  const lpWithPercentage = rawLpData.map((item) => {
                    const val = Number(item.value) || 0;
                    const pct = totalVentasLp > 0 ? ((val / totalVentasLp) * 100).toFixed(1) : '0.0';
                    return {
                      ...item,
                      porcentaje: pct,
                    };
                  });

                  // 🎯 NUEVA PALETA DE 10 COLORES (Estilo Neón/Moderno Dashboard)
                  const COLORES_GRAFICO = [
                    '#0284c7', // Azul Ciel / Sky Blue
                    '#e11d48', // Coral Red / Carmín
                    '#059669', // Verde Esmeralda Oscuro
                    '#d97706', // Ámbar Cálido
                    '#7c3aed', // Violeta Eléctrico
                    '#0d9488', // Teal / Azul Verdoso
                    '#db2777', // Fucsia
                    '#65a30d', // Verde Lima
                    '#4f46e5', // Indigo Neón
                    '#475569'  // Pizarra Oscuro
                  ];

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lpWithPercentage}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={45}
                          paddingAngle={1}
                          isAnimationActive={false}
                          label={({ porcentaje }) => `${porcentaje}%`}
                          labelLine={true}
                        >
                          {lpWithPercentage.map((entry, index) => (
                            <Cell
                              key={`cell-pie-${index}`}
                              fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]}
                            />
                          ))}
                        </Pie>

                        {/* Tooltip personalizado */}
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div
                                  className="p-2 shadow-sm rounded border"
                                  style={{
                                    backgroundColor: 'var(--panel, #fff)',
                                    borderColor: 'var(--line, #e0e0e0)',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <p className="fw-bold mb-1" style={{ color: 'var(--ink, #0f172a)' }}>
                                    {data.name}
                                  </p>
                                  <p className="mb-0" style={{ color: '#0284c7' }}>
                                    Total Ventas: <strong>${Number(data.value).toLocaleString('es-CO')}</strong>
                                  </p>
                                  <p className="mb-0 small" style={{ color: '#6c757d' }}>
                                    Participación: <strong>{data.porcentaje}%</strong> del total
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Leyenda en la parte inferior */}
                        <Legend
                          verticalAlign="bottom"
                          height={isMobile ? 65 : 36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', color: 'var(--muted, #6c757d)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Ventas por tipo de cliente */}
          <div className="col">
            <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-3'}`}>
              <h5 className="small fw-bold mb-3">Ventas por Tipo de cliente</h5>
              <div style={{ width: '100%', height: '380px' }}>
                {salesData.length === 0 ? (
                  <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                    Sin datos - Cargue un archivo
                  </div>
                ) : (() => {
                  // 1. Agrupamos los datos de ventas por "typeClient"
                  const lpGrouped = salesData.reduce((acc, curr) => {
                    const lpName = curr.typeClient || curr.type_client || 'Sola / Sin Lista';
                    const valor = Number(curr.monto || curr.valor || curr.total || 0);

                    if (!acc[lpName]) {
                      acc[lpName] = 0;
                    }
                    acc[lpName] += valor;
                    return acc;
                  }, {});

                  // 2. Convertimos el objeto agrupado a un array
                  const rawLpData = Object.keys(lpGrouped).map((key) => ({
                    name: key,
                    value: lpGrouped[key]
                  }));

                  // 3. Calculamos el total acumulado
                  const totalVentasLp = rawLpData.reduce(
                    (acc, item) => acc + (Number(item.value) || 0),
                    0
                  );

                  // 4. Inyectamos el % de participación
                  const lpWithPercentage = rawLpData.map((item) => {
                    const val = Number(item.value) || 0;
                    const pct = totalVentasLp > 0 ? ((val / totalVentasLp) * 100).toFixed(1) : '0.0';
                    return {
                      ...item,
                      porcentaje: pct,
                    };
                  });

                  // 🎯 PALETA DE 10 COLORES DE ALTO CONTRASTE
                  const COLORES_GRAFICO = [
                    '#2563eb', // Azul Royal
                    '#10b981', // Verde Esmeralda
                    '#f59e0b', // Ámbar / Naranja cálido
                    '#8b5cf6', // Púrpura
                    '#ec4899', // Rosa Intenso
                    '#06b6d4', // Cían / Turquesa
                    '#f97316', // Naranja Vivo
                    '#14b8a6', // Menta / Teal
                    '#6366f1', // Indigo
                    '#64748b'  // Gris Pizarra
                  ];

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lpWithPercentage}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={45}
                          paddingAngle={1}
                          isAnimationActive={false}
                          label={({ porcentaje }) => `${porcentaje}%`}
                          labelLine={true}
                        >
                          {lpWithPercentage.map((entry, index) => (
                            <Cell
                              key={`cell-pie-${index}`}
                              fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]}
                            />
                          ))}
                        </Pie>

                        {/* Tooltip personalizado */}
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div
                                  className="p-2 shadow-sm rounded border"
                                  style={{
                                    backgroundColor: 'var(--panel, #fff)',
                                    borderColor: 'var(--line, #e0e0e0)',
                                    fontSize: '0.85rem'
                                  }}
                                >
                                  <p className="fw-bold mb-1" style={{ color: 'var(--ink, #0f172a)' }}>
                                    {data.name}
                                  </p>
                                  <p className="mb-0" style={{ color: '#2563eb' }}>
                                    Total Ventas: <strong>${Number(data.value).toLocaleString('es-CO')}</strong>
                                  </p>
                                  <p className="mb-0 small" style={{ color: '#6c757d' }}>
                                    Participación: <strong>{data.porcentaje}%</strong> del total
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Leyenda en la parte inferior */}
                        <Legend
                          verticalAlign="bottom"
                          height={isMobile ? 92 : 52}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', color: 'var(--muted, #6c757d)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* PANEL: DETALLE DE VENTAS */}
      <div className="panel rounded shadow-sm mb-4">
        <div className="panel-head p-3 border-bottom d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0 fw-bold">Detalle de ventas</h2>
          <span className="badge bg-secondary p-2">{salesRowsCount.toLocaleString()} Registros</span>
        </div>
        <div className="table-wrap table-responsive p-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table id="salesTable" className="align-middle mb-0">
            <thead className="sticky-top">
              <tr>
                <th>C.O.</th>
                <th>Descripción C.O.</th>
                <th>Nro documento</th>
                <th>Fecha</th>
                <th>Valor subtotal</th>
                <th>Vendedor</th>
                <th>Nombre vendedor</th>
                <th>PROVEEDOR</th>
                <th>Línea</th>
                <th>Cliente factura</th>
                <th>Razon social cliente</th>
                <th>Desc. tipo de cliente</th>
                <th>Sublinea</th>
                <th>Referencia</th>
                <th>Desc. item</th>
                <th>Cantidad</th>
                <th>Valor bruto</th>
                <th>Márgen promedio</th>
                <th>Lista de precio</th>
                {/* <th>Lista de precios</th>
                <th>U.M.</th> */}
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="14" className="text-center py-4 text-muted small">
                    Cargue un archivo Excel para procesar los datos de venta.
                  </td>
                </tr>
              ) : (
                currentRows.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.co}</strong></td>
                    <td>{row.coDesc}</td>
                    <td>{row.doc}</td>
                    <td>{(row.date)}</td>
                    <td>{Number(row.subtotal || 0).toLocaleString('es-CO')}</td>
                    <td>{row.noVendedor}</td>
                    <td>{row.vendedor}</td>
                    <td>{row.proveedor}</td>
                    <td>{row.linea}</td>
                    <td>{row.cliente}</td>
                    <td>{row.razonSocial}</td>
                    <td>{row.typeClient}</td>
                    <td>{row.sublinea}</td>
                    <td>{row.ref}</td>
                    <td>{row.item}</td>
                    <td>{row.cantidad}</td>
                    <td className="fw-bold text-success">${Number(row.valor || 0).toLocaleString('es-CO')}</td>
                    <td>{row.margen}</td>
                    <td>{row.DescLp}</td>
                    {/* <td>{row.listaPrecios}</td>
                    <td>{row.um}</td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🎯 BOTONERA DE PAGINACIÓN DE BOOTSTRAP */}
        {totalPages > 1 && (
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center p-3 border-top gap-2">
            <span className="small">
              Mostrando registros {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, salesData.length)} de {salesData.length.toLocaleString()}
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
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}