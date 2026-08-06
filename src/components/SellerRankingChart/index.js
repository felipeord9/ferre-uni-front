import React, { useMemo } from 'react';

export default function SellerRankingChart({
  salesData = [],
  totalBudget = [],
  filters = { year: '', month: '' },
  isMobile = false,
  getSellerRankingWithBudget
}) {
  return (
    <div className="col">
      <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-2'}`}>
        {salesData.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center rounded small" style={{ height: '300px' }}>
            Sin datos - Cargue un archivo
          </div>
        ) : (() => {
          // 1. Obtener la data con Ventas, Presupuesto y Margen Promedio (rentabilidad) para vendedores
          const rawRankingData = getSellerRankingWithBudget
            ? getSellerRankingWithBudget(salesData, totalBudget, filters.year, filters.month)
            : [];

          // 2. Procesar los indicadores por cada vendedor
          const tableData = rawRankingData.map((item) => {
            const ventas = Number(item.Ventas) || 0;
            const presupuesto = Number(item.Presupuesto) || 0;
            const rentabilidad = Number(item.rentabilidad || item.margen) || 0;

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
            <div className="table-responsive" style={{ maxHeight: '430px', overflowY: 'auto' }}>
              <h5 className="small fw-bold mb-3">Ventas por vendedor</h5>
              <table className="table table-borderless align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d2d2d', fontSize: '0.8rem' }}>
                    <th style={{ width: '20%' }}>Vendedor</th>
                    <th style={{ width: '45%' }}>Ventas / meta</th>
                    <th style={{ width: '15%' }} className="text-center">Cumplimiento</th>
                    <th style={{ width: '20%' }}>Rentabilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => {
                    const isSuccess = row.cumplimiento >= 100;
                    const isWarning = row.cumplimiento >= 85 && row.cumplimiento < 100;

                    // Color del punto de cumplimiento (Verde, Naranja o Rojo)
                    const statusColor = isSuccess ? '#10b981' : isWarning ? '#f97316' : '#ef4444';

                    return (
                      <tr key={`seller-row-${index}`} style={{ borderBottom: '1px solid #1e1e1e' }}>
                        {/* 1. Nombre del Vendedor */}
                        <td className="fw-bold py-3" style={{fontSize: '0.7rem'}}>{row.name}</td>

                        {/* 2. Barra dual de Ventas / Meta */}
                        <td className="py-3">
                          <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
                            <span className="fw-bold">${(row.ventas / 1000000).toFixed(0)} M</span>
                            <span style={{ color: '#888' }}>
                              Meta ${(row.presupuesto / 1000000).toFixed(0)} M
                            </span>
                          </div>

                          {/* Barra de Progreso con Marcador de Meta */}
                          <div className="position-relative rounded-pill" style={{ height: '8px', border: '#334155 solid 2px', width: '100%' }}>
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
                            {/* Indicador / Línea Blanca Vertical de la Meta */}
                            <div 
                              className="position-absolute top-50 translate-middle-y" 
                              style={{ 
                                left: `${row.pctMetaBarra}%`, 
                                height: '14px', 
                                width: '2px', 
                                border: '#334155 solid 1px',
                                boxShadow: '0 0 4px rgba(255,255,255,0.8)'
                              }} 
                            />
                          </div>
                        </td>

                        {/* 3. % Cumplimiento con Indicador de Color */}
                        <td className="text-center py-3">
                          <span className="fw-bold me-1">
                            {row.cumplimiento.toFixed(1).replace('.', ',')}%
                          </span>
                          <span style={{ color: statusColor, fontSize: '1.1rem' }}>●</span>
                        </td>

                        {/* 4. Rentabilidad (Margen) con mini barra verde */}
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ minWidth: '40px' }}>
                              {row.rentabilidad.toString().replace('.', ',')}%
                            </span>
                            <div className="flex-grow-1 rounded-pill" style={{ height: '6px', border: '#334155 solid 1px' }}>
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
  );
}