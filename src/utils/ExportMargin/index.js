import * as XLSX from 'xlsx';

/**
 * Exporta la plantilla de margen esperado utilizando un arreglo de datos suministrado.
 * @param {Array} dataList - Lista de objetos con la estructura: [{ co, presupuesto, ren_esperada }, ...]
 */
export const exportMarginData = (dataList) => {
  if (!dataList || dataList.length === 0) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  // 1. Mapeamos y estructuramos los datos garantizando los encabezados exactos
  const formattedData = dataList.map(item => ({
    co: String(item.co || '').padStart(3, '0'), // Asegura '001', '009', etc.
    presupuesto: Number(item.budget) || 0,
    ren_esperada: Number(item.ren_esperada || item.expectedMargin) || 0
  }));

  // 2. Crear la hoja a partir del JSON limpiado
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // 3. Formatear la columna 'co' como Texto explícito para que Excel no remueva los ceros
  formattedData.forEach((row, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 0 }); // Columna 0 ('co')
    if (worksheet[cellRef]) {
      worksheet[cellRef].t = 's'; // Marca la celda como String
      worksheet[cellRef].z = '@'; // Formato texto
    }
  });

  // 4. Configurar el ancho automático de las columnas
  worksheet['!cols'] = [
    { wch: 10 }, // 'co'
    { wch: 18 }, // 'presupuesto'
    { wch: 16 }  // 'ren_esperada'
  ];

  // 5. Crear el libro de trabajo y adjuntar la hoja
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Margen Esperado");

  // 6. Generar el nombre de archivo con la fecha actual y descargar
  const filename = `Margen_Esperado_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
};