import * as XLSX from 'xlsx';

export const downloadBudgetTemplate = () => {
  // 1. Datos de ejemplo para la Hoja 1: Presupuesto Total por C.O.
  const dataHoja1 = [
    {
      "CO": "001",
      "mes": "ENERO",
      "año": 2026,
      "presupuesto": 50000000
    },
    {
      "CO": "002",
      "mes": "ENERO",
      "año": 2026,
      "presupuesto": 100000000
    }
  ];

  // 2. Datos de ejemplo para la Hoja 2: Participación por Línea (%)
  const dataHoja2 = [
    {
      "co": "001",
      "linea": "HERRAMIENTAS",
      "%": "30%",
      "mes": "ENERO",
      "año": 2026
    },
    {
      "co": "001",
      "linea": "PISOS",
      "%": "50%",
      "mes": "ENERO",
      "año": 2026
    },
    {
      "co": "001",
      "linea": "PAREDES",
      "%": "20%",
      "mes": "ENERO",
      "año": 2026
    }
  ];

  // 3. Datos de ejemplo para la Hoja 3: Presupuesto por Vendedor
  const dataHoja3 = [
    {
      "co": "001",
      "vendedor": "MORALES IVONNE",
      "presupuesto": 30000000,
      "mes": "ENERO",
      "año": 2026
    },
    {
      "co": "001",
      "vendedor": "HERRERA MOLINA LEYDI JHOANNA",
      "presupuesto": 20000000,
      "mes": "ENERO",
      "año": 2026
    }
  ];

  // 4. Crear el libro de trabajo y convertir los JSONs a Hojas de Excel
  const workbook = XLSX.utils.book_new();

  const worksheet1 = XLSX.utils.json_to_sheet(dataHoja1);
  const worksheet2 = XLSX.utils.json_to_sheet(dataHoja2);
  const worksheet3 = XLSX.utils.json_to_sheet(dataHoja3);

  // 5. Ajustar anchos de columnas automáticamente para que se vea ordenado
  const autoWidth = (data) => {
    const keys = Object.keys(data[0] || {});
    return keys.map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 5
    }));
  };

  worksheet1['!cols'] = autoWidth(dataHoja1);
  worksheet2['!cols'] = autoWidth(dataHoja2);
  worksheet3['!cols'] = autoWidth(dataHoja3);

  // 6. Adjuntar las 3 pestañas al libro en el orden que lee tu función
  XLSX.utils.book_append_sheet(workbook, worksheet1, "Presupuesto CO");
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Participacion Lineas");
  XLSX.utils.book_append_sheet(workbook, worksheet3, "Presupuesto Vendedores");

  // 7. Disparar la descarga del archivo en el navegador
  XLSX.writeFile(workbook, "Plantilla_Presupuesto.xlsx");
};