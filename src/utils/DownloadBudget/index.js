import * as XLSX from 'xlsx';

export const downloadBudgetTemplate = () => {
  const cleanStr = (val) => String(val || '').trim().replace(/\s+/g, ' ');

  // 1. HOJA 1: Presupuesto CO
  const dataHoja1 = [
    { "CO": cleanStr("001"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 240000000 },
    { "CO": cleanStr("002"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 150000000 },
    { "CO": cleanStr("003"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 130000000 },
    { "CO": cleanStr("004"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 18000000 },
    { "CO": cleanStr("007"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 70000000 },
    { "CO": cleanStr("008"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 150000000 },
    { "CO": cleanStr("009"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 160000000 },
    { "CO": cleanStr("010"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 70000000 },
    { "CO": cleanStr("020"), "mes": cleanStr("ENERO"), "año": 2026, "presupuesto": 110000000 }
  ];

  // Listado base de líneas y porcentajes exactos según la imagen
  const lineasBase = [
    { linea: "CEMENTOS", pct: "1,12782343746845%" },
    { linea: "COCINA LAVAPLATOS Y LAVADEROS", pct: "0,137037845614382%" },
    { linea: "CUBIERTAS Y TECHOS", pct: "0,496923019068693%" },
    { linea: "DECORADOS", pct: "1,22463328930922%" },
    { linea: "ELECTRICOS", pct: "0,0150042419419929%" },
    { linea: "GRIFERIAS Y ACCESORIOS", pct: "0,494794073396863%" },
    { linea: "HERRAMIENTAS", pct: "0,080124343479364%" },
    { linea: "LINEA BLANCA", pct: "0,080124343479364%" },
    { linea: "MOLDURAS Y PIRAGUAS", pct: "0,345549121512689%" },
    { linea: "OBRA NEGRA", pct: "0,330304688201899%" },
    { linea: "PAREDES IMPORTADAS", pct: "0,150326434922113%" },
    { linea: "PAREDES NACIONALES", pct: "19,1751297238246%" },
    { linea: "PEGANTES", pct: "8,7914745306428%" },
    { linea: "PINTURAS", pct: "0,377462748023378%" },
    { linea: "PISOS IMPORTADOS", pct: "3,78340496396471%" },
    { linea: "PISOS NACIONALES", pct: "44,246139379181%" },
    { linea: "PORCELANA SANITARIA", pct: "19,0022383962621%" },
    { linea: "SERVICIO", pct: "0,0740932940442783%" },
    { linea: "SISTEMA LIVIANO", pct: "0,144142988709323%" },
    { linea: "TUBERIA Y ACCESORIOS PVC", pct: "0,00339348043219521%" },
  ];

  const centrosOperacion = ["001", "002", "003", "004", "007", "008", "009", "010", "020"];

  // 2. HOJA 2: Generación dinámica respetando la estructura de la imagen
  const dataHoja2 = centrosOperacion.flatMap(co =>
    lineasBase.map(item => ({
      "co": cleanStr(co),
      "linea": cleanStr(item.linea),
      "%": item.pct,
      "mes": cleanStr("ENERO"),
      "año": 2026
    }))
  );

  // 3. HOJA 3: Vendedores
  const dataHoja3 = [
    { "co": cleanStr("001"), "vendedor": cleanStr("MORENO IMBAJOA DARLYN ANDREA"), "presupuesto": 35000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("001"), "vendedor": cleanStr("MORALES IVONNE"), "presupuesto": 68333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("001"), "vendedor": cleanStr("HERRERA MOLINA LEYDI JHOANNA"), "presupuesto": 68333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("001"), "vendedor": cleanStr("BUITRAGO MUÑOZ CARLOS ALBERTO"), "presupuesto": 68333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("002"), "vendedor": cleanStr("VALVERDE ANGULO ASTRID CAROLINA"), "presupuesto": 30000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("002"), "vendedor": cleanStr("RENGIFO ESCALANTE GERMAN EDUARDO"), "presupuesto": 30000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("002"), "vendedor": cleanStr("ZAPATA MARULANDA EDIER DARIO"), "presupuesto": 30000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("002"), "vendedor": cleanStr("PUERTAS MICHAEL STEVEN"), "presupuesto": 30000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("002"), "vendedor": cleanStr("VARON FLOREZ JHOSEP DAVID"), "presupuesto": 30000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("003"), "vendedor": cleanStr("LOPEZ GUERRA JANETH"), "presupuesto": 75000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("003"), "vendedor": cleanStr("ASTAIZA BECERRA LUIS ALBERTO"), "presupuesto": 75000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("007"), "vendedor": cleanStr("FERNANDEZ GONZALEZ DAYANA"), "presupuesto": 35000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("007"), "vendedor": cleanStr("ANGULO ANGULO WILMER JAVIER"), "presupuesto": 35000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("008"), "vendedor": cleanStr("DIAZ PORTILLO RUBEN DARIO"), "presupuesto": 80000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("008"), "vendedor": cleanStr("RUIZ CANO LUIS CARLOS"), "presupuesto": 80000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("009"), "vendedor": cleanStr("MAYA SALAZAR LEIDY ESMERALDA"), "presupuesto": 53333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("009"), "vendedor": cleanStr("LLANOS SALAZAR RAFAEL RICARDO"), "presupuesto": 53333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("009"), "vendedor": cleanStr("NARANJO NARANJO PAULA ANDREA"), "presupuesto": 53333333, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("010"), "vendedor": cleanStr("VELASCO SANCHEZ JORGE EDUARDO"), "presupuesto": 35000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("010"), "vendedor": cleanStr("GONZALEZ ERAZO MONICA NATALIA"), "presupuesto": 35000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("004"), "vendedor": cleanStr("OROZCO TRIVINO ALEX ANDRES"), "presupuesto": 18000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("020"), "vendedor": cleanStr("GALINDO ENRIQUEZ SANDRA MARCELA"), "presupuesto": 55000000, "mes": cleanStr("ENERO"), "año": 2026 },
    { "co": cleanStr("020"), "vendedor": cleanStr("SANCHEZ GONZALEZ JUAN CAMILO"), "presupuesto": 55000000, "mes": cleanStr("ENERO"), "año": 2026 }
  ];

  const workbook = XLSX.utils.book_new();

  const worksheet1 = XLSX.utils.json_to_sheet(dataHoja1);
  const worksheet2 = XLSX.utils.json_to_sheet(dataHoja2);
  const worksheet3 = XLSX.utils.json_to_sheet(dataHoja3);

  const autoWidth = (data) => {
    const keys = Object.keys(data[0] || {});
    return keys.map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 5
    }));
  };

  worksheet1['!cols'] = autoWidth(dataHoja1);
  worksheet2['!cols'] = autoWidth(dataHoja2);
  worksheet3['!cols'] = autoWidth(dataHoja3);

  XLSX.utils.book_append_sheet(workbook, worksheet1, "Presupuesto CO");
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Participacion Lineas");
  XLSX.utils.book_append_sheet(workbook, worksheet3, "Presupuesto Vendedores");

  XLSX.writeFile(workbook, "Plantilla_Presupuesto.xlsx");
};