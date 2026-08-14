import React from 'react';
import './styles.css';

export default function SellerRankingChart({
  salesData = [],
  totalBudget = [],
  filters = { year: '', month: [] },
  isMobile = false,
  getSellerRankingWithBudget
}) {
  return (
    <div className="col">
      <div className={`panel rounded shadow-sm ${isMobile ? 'p-0' : 'p-2'}`} style={{maxWidth: '88vw', overflowX:'auto'}}>
        <h5 className="small fw-bold mb-3 px-1">Ventas por vendedor</h5>

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
                  maxHeight: '390px', 
                  overflowY: 'auto', 
                  overflowX: isMobile ? 'auto' : 'hidden',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <table 
                  className="table table-responsive table-borderless align-middle mb-0"
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
  );
}