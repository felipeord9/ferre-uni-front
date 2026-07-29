import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export const exportBudgetTo3Sheets = (budgetData) => {
  if (!budgetData || budgetData.length === 0) {
    Swal.fire('Atención', 'No hay datos de presupuesto disponibles para exportar.', 'warning');
    return;
  }

  // --- 1. HOJA 1: PRESUPUESTO POR C.O. (Techo total agrupado por CO + Mes + Año) ---
  const mapCO = new Map();

  budgetData.forEach(item => {
    const key = `${item.co}_${item.mes}_${item.anio}`;
    const monto = parseFloat(item.monto) || 0;

    if (!mapCO.has(key)) {
      mapCO.set(key, {
        CO: item.co,
        mes: item.mes,
        año: item.anio,
        presupuesto: monto
      });
    } else {
      mapCO.get(key).presupuesto += monto;
    }
  });

  const dataHoja1 = Array.from(mapCO.values());


  // --- 2. HOJA 2: PARTICIPACIÓN POR LÍNEA (%) ---
  // Sumamos los montos por línea en cada CO/Mes/Año para calcular su % respecto al total del CO
  const mapLineas = new Map();

  budgetData.forEach(item => {
    const key = `${item.co}_${item.linea}_${item.mes}_${item.anio}`;
    const monto = parseFloat(item.monto) || 0;

    if (!mapLineas.has(key)) {
      mapLineas.set(key, {
        co: item.co,
        linea: item.descripLinea,
        mes: item.mes,
        año: item.anio,
        montoTotalLinea: monto
      });
    } else {
      mapLineas.get(key).montoTotalLinea += monto;
    }
  });

  const dataHoja2 = Array.from(mapLineas.values()).map(lineaItem => {
    const keyCO = `${lineaItem.co}_${lineaItem.mes}_${lineaItem.año}`;
    const totalCO = mapCO.get(keyCO)?.presupuesto || 1;
    
    // Calculamos el porcentaje de participación
    const pctCalculado = Math.round((lineaItem.montoTotalLinea / totalCO) * 100);

    return {
      co: lineaItem.co,
      linea: lineaItem.linea,
      "%": `${pctCalculado}%`,
      mes: lineaItem.mes,
      año: lineaItem.año
    };
  });


  // --- 3. HOJA 3: PRESUPUESTO POR VENDEDOR (Suma agrupada por Vendedor + CO + Mes + Año) ---
  const mapVendedores = new Map();

  budgetData.forEach(item => {
    const key = `${item.co}_${item.vendedor}_${item.mes}_${item.anio}`;
    const monto = parseFloat(item.monto) || 0;

    if (!mapVendedores.has(key)) {
      mapVendedores.set(key, {
        co: item.co,
        vendedor: item.rzsVendedor,
        presupuesto: monto,
        mes: item.mes,
        año: item.anio
      });
    } else {
      mapVendedores.get(key).presupuesto += monto;
    }
  });

  const dataHoja3 = Array.from(mapVendedores.values());


  // --- 4. CONSTRUCCIÓN Y DESCARGA DEL EXCEL ---
  const workbook = XLSX.utils.book_new();

  const worksheet1 = XLSX.utils.json_to_sheet(dataHoja1);
  const worksheet2 = XLSX.utils.json_to_sheet(dataHoja2);
  const worksheet3 = XLSX.utils.json_to_sheet(dataHoja3);

  // Auto-ajuste de ancho de columnas
  const autoWidth = (data) => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 4
    }));
  };

  worksheet1['!cols'] = autoWidth(dataHoja1);
  worksheet2['!cols'] = autoWidth(dataHoja2);
  worksheet3['!cols'] = autoWidth(dataHoja3);

  // Adjuntar las 3 hojas al libro
  XLSX.utils.book_append_sheet(workbook, worksheet1, "Presupuesto CO");
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Participacion Lineas");
  XLSX.utils.book_append_sheet(workbook, worksheet3, "Presupuesto Vendedores");

  // Descargar archivo Excel
  const filename = `Presupuesto_Consolidado_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
};