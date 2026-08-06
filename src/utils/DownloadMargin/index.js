import * as XLSX from 'xlsx';

export const downloadMarginTemplate = () => {
  // 1. Datos exactos de la plantilla basándonos en tu imagen
  const templateData = [
    { co: "001", presupuesto: 240000000, ren_esperada: 16, mes: 'Enero', año: '2026' },
    { co: "002", presupuesto: 150000000, ren_esperada: 24, mes: 'Enero', año: '2026' },
  ];

  // 2. Crear una nueva hoja a partir del JSON
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // 3. Forzar tipo texto ('s') en la columna 'co' para que Excel preserve los ceros (009, 008, etc.)
  templateData.forEach((row, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 0 }); // c: 0 es la columna 'co'
    if (worksheet[cellRef]) {
      worksheet[cellRef].t = 's'; // 's' indica tipo String / Texto
      worksheet[cellRef].z = '@'; // Formato de celda texto
    }
  });

  // 4. Configurar el ancho automático de las columnas
  worksheet['!cols'] = [
    { wch: 10 }, // Ancho para 'co'
    { wch: 18 }, // Ancho para 'presupuesto'
    { wch: 16 }  // Ancho para 'ren_esperada'
  ];

  // 5. Crear el libro de trabajo y adjuntar la hoja
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Margen Esperado");

  // 6. Generar y descargar el archivo de Excel
  XLSX.writeFile(workbook, "Plantilla_Margen.xlsx");
};