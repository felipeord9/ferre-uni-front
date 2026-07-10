import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import AuthContext from '../../context/authContext'; 
import KpiCard from '../../components/KpiCard';
import { NavBarData } from "../../components/Navbar/NavbarData";
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import { 
    BarChart, Bar, 
    Cell, XAxis, YAxis, 
    Tooltip, ResponsiveContainer, 
    CartesianGrid,
    AreaChart, Area,
    Legend, Pie, PieChart
} from 'recharts';
import * as Icons from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const COLORES_RANKING_VENDEDORES = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];
const COLORES_RANKING_CLIENTES = ['#1cc88a', '#4e73df', '#e74a3b', '#f6c23e', '#36b9cc'];
const COLORES_LINEA = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1'];

export default function Ventas() {
  const [filters, setFilters] = useState({
    seller: '',
    line: '',
    city: '',
    clientType: '',
    year: new Date().getFullYear().toString(),
    month: '',
    startDate: '',
    endDate: ''
  });
  
  const [kpiData, setKpiData] = useState({
    totalSales: '$0',
    goalProgress: '0%',
    invoices: '0',
    customers: '0'
  });

  const [salesRowsCount, setSalesRowsCount] = useState(0);
  const [salesData, setSalesData] = useState([]); 
  const [rawSalesData, setRawSalesData] = useState([]);

  // 🎯 ESTADOS PARA LA PAGINACIÓN (Evita el congelamiento del DOM)
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100; // Muestra un máximo de 100 filas por vista

  const [filterOptions, setFilterOptions] = useState({
    sellers: [],
    lines: [],
    cities: [],
    clientTypes: [],
    years: [],
  });

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
    const calculateKPIs = (rows) => {
    if (!rows || rows.length === 0) {
        return { totalSales: '$0', goalProgress: '0%', invoices: '0', customers: '0' };
    }

    // 1. Total Ventas: Suma de la columna 'valor'
    const total = rows.reduce((sum, row) => sum + (Number(row.valor) || 0), 0);

    // 2. Facturas Únicas: Contamos cuántos códigos de documento 'doc' diferentes existen
    const uniqueInvoices = new Set(rows.map(row => row.doc).filter(Boolean)).size;

    // 3. Clientes Únicos: Contamos cuántas cédulas/nit 'cliente' diferentes existen
    const uniqueCustomers = new Set(rows.map(row => row.cliente).filter(Boolean)).size;

    // 4. Cumplimiento Meta: Supongamos una meta estática por ahora (ej: 500 millones)
    // Puedes cambiar este número por el que requiera tu empresa
    const metaEmpresa = 500000000; 
    const porcentajeMeta = Math.min((total / metaEmpresa) * 100, 100); // Tope de 100%

    return {
        totalSales: `$${Math.round(total).toLocaleString('es-CO')}`,
        goalProgress: `${porcentajeMeta.toFixed(1)}%`,
        invoices: uniqueInvoices.toLocaleString('es-CO'),
        customers: uniqueCustomers.toLocaleString('es-CO')
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

/*   const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Swal.fire({
      title: 'Procesando archivo',
      text: 'Por favor, espera mientras se lee el Excel...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const workSheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[workSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(workSheet);

      if (jsonRows.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo vacío',
          text: 'El Excel cargado no contiene registros.',
          showConfirmButton: false,
          timer: 5000,
        });
        return;
      }
      const columnMapping = {
        "Lista de precios": "listaPrecios",
        "C.O.": "co",
        "Nombre vendedor": "vendedor",
        "Desc. tipo de cliente": "typeClient",
        "Cliente factura": "cliente",
        "Razon social cliente factura": "razonSocial",
        "Fecha": "date",
        "Nro documento": "doc",
        "LINEA": "linea",
        "Referencia": "ref",
        "Desc. item": "item",
        "U.M.": "um",
        "Cantidad": "cantidad",
        "Valor bruto": "valor",
      };
      const transformedRows = jsonRows.map(row => {
        const newRow = {};
        for (const originalKey in row) {
          const newKey = columnMapping[originalKey] || originalKey;
          newRow[newKey] = row[originalKey];
        }
        return newRow;
      });
      setRawSalesData(transformedRows);
      setSalesData(transformedRows);
      setSalesRowsCount(transformedRows.length);
      setCurrentPage(1); // Reiniciar paginación al cargar archivo nuevo
      const uniqueSellers = [...new Set(transformedRows.map(item => item.vendedor).filter(Boolean))];
      const uniqueLines = [...new Set(transformedRows.map(item => item.linea).filter(Boolean))];
      const uniqueCities = [...new Set(transformedRows.map(item => item.co).filter(Boolean))];
      const uniqueClientTypes = [...new Set(transformedRows.map(item => item.typeClient).filter(Boolean))];
      setFilterOptions({
        sellers: uniqueSellers,
        lines: uniqueLines,
        cities: uniqueCities,
        clientTypes: uniqueClientTypes
      });
    // 🎯 CALCULAMOS LOS KPIS INICIALES
    const initialKpis = calculateKPIs(transformedRows);
    setKpiData(initialKpis);
      setTimeout(() => {
        Swal.close();
      }, 800);
    };
    reader.readAsBinaryString(file);
  }; */

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Detectamos si es un archivo plano de texto o CSV
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
      };

      const transformedRows = jsonRows.map(row => {
        const newRow = {};
        for (const originalKey in row) {
          const newKey = columnMapping[originalKey] || originalKey;
          
          // 🎯 SI ES LA COLUMNA DE VALOR BRUTO, LA LIMPIAMOS DE UNA VEZ
          if (newKey === 'valor' || newKey === 'subtotal') {
            newRow[newKey] = parseCurrencyToNumber(row[originalKey]);
          }else if(newKey === 'date' ){
            newRow[newKey] = parseExcelDate(row[originalKey]);
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

      setRawSalesData(transformedRows);
      setSalesData(transformedRows);
      setSalesRowsCount(transformedRows.length);
      setCurrentPage(1); 

      const uniqueSellers = [...new Set(transformedRows.map(item => item.vendedor).filter(Boolean))];
      const uniqueLines = [...new Set(transformedRows.map(item => item.linea).filter(Boolean))];
      const uniqueCities = [...new Set(transformedRows.map(item => item.co).filter(Boolean))];
      const uniqueClientTypes = [...new Set(transformedRows.map(item => item.typeClient).filter(Boolean))];
      const uniqueYears = [...new Set(transformedRows.map(item => {
        if (!item.date) return null;
        const parts = item.date.split('/');
        return parts.length === 3 ? parts[2] : null;
      }).filter(Boolean))].sort((a, b) => b - a);
      
      setFilterOptions({
        sellers: uniqueSellers,
        lines: uniqueLines,
        cities: uniqueCities,
        clientTypes: uniqueClientTypes,
        years: uniqueYears,
      });

      if (uniqueYears.length > 0 && !uniqueYears.includes(filters.year)) {
        setFilters(prev => ({ ...prev, year: uniqueYears[0] }));
      }

      const initialKpis = calculateKPIs(transformedRows);
      setKpiData(initialKpis);

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
    if (filters.month) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;
        const parts = row.date.split('/');
        return parts.length === 3 && parts[1] === filters.month;
      });
    }

    // 🎯 3. NUEVO: FILTRO POR RANGO DE FECHAS (startDate y endDate)
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(row => {
        if (!row.date) return false;

        // Convertimos la fecha de la fila "DD/MM/YYYY" a un objeto Date real
        const parts = row.date.split('/');
        if (parts.length !== 3) return false;
        const rowDate = new Date(parts[2], parts[1] - 1, parts[0]);

        // Validamos los límites si existen
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

    // 4. Resto de filtros (Vendedor, Línea, Ciudad...)
    if (filters.seller) {
      filtered = filtered.filter(row => row.vendedor === filters.seller);
    }
    if (filters.line) {
      filtered = filtered.filter(row => row.linea === filters.line);
    }
    if (filters.city) {
      filtered = filtered.filter(row => row.co === filters.city);
    }
    if (filters.clientType) {
      filtered = filtered.filter(row => row.typeClient === filters.clientType);
    }

    setSalesData(filtered);
    setSalesRowsCount(filtered.length);
    setCurrentPage(1);

    const filteredKpis = calculateKPIs(filtered);
    setKpiData(filteredKpis);

  }, [filters, rawSalesData]);

  /* useEffect(() => {
    let filtered = [...rawSalesData];

    if (filters.seller) {
      filtered = filtered.filter(row => row.vendedor === filters.seller); // 👈 Corregido 'vendedor' en minúscula
    }
    if (filters.line) {
      filtered = filtered.filter(row => row.linea === filters.line);
    }
    if (filters.city) {
      filtered = filtered.filter(row => row.co === filters.city);
    }
    if (filters.clientType) {
      filtered = filtered.filter(row => row.typeClient === filters.clientType);
    }

    setSalesData(filtered);
    setSalesRowsCount(filtered.length);
    setCurrentPage(1); // 👈 Al aplicar un filtro, volvemos automáticamente a la página 1
  }, [filters, rawSalesData]); */

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
        .slice(0, 5); // 🏆 Nos quedamos solo con el Top 5 mejores
  };

  /* Funcion para optener el ranking por proveedor */
  const getSupplierRankingData = (rows) => {
    if (!rows || rows.length === 0) return [];

    // Agrupamos y sumamos las ventas por vendedor
    const salesBySupplier = rows.reduce((acc, row) => {
        const supplier = row.razonSocial || 'Desconocido';
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
        .slice(0, 8); // 🏆 Nos quedamos solo con el Top 5 mejores
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

  return (
    <div className="container-fluid p-2 stack gap-4 w-100">
      
      {/* TOOLBAR DE FILTROS */}
      <div className="toolbar p-2 rounded shadow-sm row g-2 align-items-end mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <label className="form-label fw-semibold small mb-1">Archivo Excel</label>
          <input 
            type="file" 
            className="form-sm" 
            accept=".xlsx,.xls,.txt,.csv"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold small mb-1">Vendedor</label>
          <select 
            className=""
            value={filters.seller}
            onChange={e => setFilters({...filters, seller: e.target.value})}
          >
            <option value="">Todos</option>
            {filterOptions.sellers.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold small mb-1">Línea</label>
          <select 
            className=""
            value={filters.line}
            onChange={e => setFilters({...filters, line: e.target.value})}
          >
            <option value="">Todas</option>
            {filterOptions.lines.map((l, idx) => <option key={idx} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold small mb-1">Agencia</label>
          <select 
            className=""
            value={filters.city}
            onChange={e => setFilters({...filters, city: e.target.value})}
          >
            <option value="">Todas</option>
            {filterOptions.cities.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold small mb-1">Tipo cliente</label>
          <select 
            className=""
            value={filters.clientType}
            onChange={e => setFilters({...filters, clientType: e.target.value})}
          >
            <option value="">Todos</option>
            {filterOptions.clientTypes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Filtro por fecha */}
        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold text-secondary small mb-1">Desde</label>
          <input 
            type="date" 
            className="form-control"
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value, month: ''})}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold text-secondary small mb-1">Hasta</label>
          <input 
            type="date" 
            className="form-control"
            value={filters.endDate}
            disabled={filters.startDate ? false : true}
            onChange={e => setFilters({...filters, endDate: e.target.value})}
          />
        </div>

        {/* filtro por mes */}
        <div className="col-12 col-sm-6 col-md-2">
          <label className="form-label fw-semibold text-secondary small mb-1">Mes</label>
          <select 
            className="form-select"
            value={filters.month}
            onChange={e => setFilters({...filters, month: e.target.value, startDate: '', endDate: ''})}
          >
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        {/* filtro por año */}
        <div className="col-12 col-sm-6 col-md-1">
          <label className="form-label fw-semibold text-secondary small mb-1">Año</label>
          <select 
            className="form-select"
            value={filters.year}
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
            <KpiCard title="Facturas" value={kpiData.invoices} subtitle="Documentos únicos" />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
            <KpiCard title="Clientes" value={kpiData.customers} subtitle="Clientes únicos" />
            </div>
        </div>

        {/* Desde aqui comienzan los graficos */}
        <div className="row row-cols-1 row-cols-md-2 g-4 mb-4">
        {/* Grafico comparativo por mes */}
          <div className="col">
            <div className="panel rounded shadow-sm p-3">
                <h5 className="small fw-bold mb-3">Comparativa Mensual de Ventas</h5>
                <div style={{ width: '100%', height: '250px' }}>
                {salesData.length === 0 ? (
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                        Sin datos - Cargue un archivo
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={getMonthCompareData(salesData)}
                        margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                    >
                        {/* Definición del gradiente para el fondo del gráfico */}
                        <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4e73df" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4e73df" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#6c757d" fontSize={12} />
                        
                        {/* Formatea el eje Y para mostrar valores en Millones (M) */}
                        <YAxis 
                        stroke="#6c757d" 
                        fontSize={12} 
                        tickFormatter={(v) => `$${(v / 1000000)}M`} 
                        />
                        
                        <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Ventas Mensuales']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                        />
                        
                        {/* Área suavizada utilizando el color principal de tu paleta premium (#4e73df) */}
                        <Area 
                        type="monotone" 
                        dataKey="Ventas" 
                        stroke="#4e73df" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorVentas)" 
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                )}
                </div>
            </div>
          </div>

          {/* Ranking por vendedor */}
          <div className="col">
            <div className="panel rounded shadow-sm p-3">
                <h5 className="small fw-bold mb-3">Ranking de Vendedores (Top 5)</h5>
                <div style={{ width: '100%', height: '250px' }}>
                {salesData.length === 0 ? (
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                        Sin datos - Cargue un archivo
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={getSellerRankingData(salesData)}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000)}M`} stroke="#6c757d" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#6c757d" fontSize={11} width={80} />
                        <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Total Ventas']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                        />
                        
                        {/* 🎯 MODIFICADO: Quitamos el 'fill' global y mapeamos celdas individuales */}
                        <Bar dataKey="Ventas" radius={[0, 4, 4, 0]} barSize={18}>
                        {
                            getSellerRankingData(salesData).map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORES_RANKING_VENDEDORES[index % COLORES_RANKING_VENDEDORES.length]} 
                            />
                            ))
                        }
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                )}
                </div>
            </div>
          </div>
          
          {/* Ranking por cliente */}
          <div className="col">
            <div className="panel rounded shadow-sm p-3">
                <h5 className="small fw-bold mb-3">Ranking de clientes (Top 8)</h5>
                <div style={{ width: '100%', height: '350px' }}>
                {salesData.length === 0 ? (
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                        Sin datos - Cargue un archivo
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical" // 👈 Hace que las barras sean horizontales
                        data={getSupplierRankingData(salesData)} // Pasamos los datos filtrados y agrupados
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000)}M`} stroke="#6c757d" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="#6c757d" fontSize={11} width={80} />
                        <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Total Ventas']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                        />
                        {/* Barra estilizada con un color verde éxito o azul corporativo */}
                        <Bar dataKey="Ventas" radius={[0, 4, 4, 0]} barSize={18}>
                        {
                            getSupplierRankingData(salesData).map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORES_RANKING_CLIENTES[index % COLORES_RANKING_CLIENTES.length]} 
                            />
                            ))
                        }
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                )}
                </div>
            </div>
          </div>

          {/* Ventas por linea */}
          <div className="col">
            <div className="panel rounded shadow-sm p-3">
                <h5 className="small fw-bold mb-3">Participación por Línea de Producto</h5>
                <div style={{ width: '100%', height: '350px' }}>
                {salesData.length === 0 ? (
                    <div className="h-100 d-flex align-items-center justify-content-center rounded small">
                        Sin datos - Cargue un archivo
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString('es-CO')}`, 'Total Ventas']}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                        />
                        {/* Leyenda inferior que acomoda de forma dinámica los nombres de las líneas */}
                        <Legend 
                            verticalAlign="bottom" 
                            height={150} 
                            iconType="circle"
                            wrapperStyle={{ fontSize: '11px', color: '#6c757d' }}
                        />
                        <Pie
                            data={getLineShareData(salesData)}
                            cx="50%" // Centrado horizontal
                            cy="45%" // Centrado vertical un poco elevado para dejar espacio a la leyenda
                            innerRadius={50} // 🎯 Esto lo convierte en dona. Si lo dejas en 0, será una torta completa.
                            outerRadius={80}
                            paddingAngle={0} // Pequeña separación elegante entre cada rebanada
                            dataKey="value"
                        >
                        {
                            getLineShareData(salesData).map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORES_LINEA[index % COLORES_LINEA.length]} 
                            />
                            ))
                        }
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                )}
                </div>
            </div>
          </div>

          {/* <div className="col">
            <div className="panel border rounded bg-white shadow-sm p-3">
              <h5 className="text-secondary small fw-bold mb-3">Distribución Geográfica</h5>
              <div id="geoMap" className="chart bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                <span className="text-muted small">[Mapa: Distribución]</span>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="panel border rounded bg-white shadow-sm p-3">
              <h5 className="text-secondary small fw-bold mb-3">Participación por Línea</h5>
              <div id="lineShare" className="chart bg-light rounded d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                <span className="text-muted small">[Gráfico: Participación]</span>
              </div>
            </div>
          </div> */}

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