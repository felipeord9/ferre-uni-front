import React from 'react';

// Componente BulletBar (sin cambios en su lógica interna)
const BulletBar = ({ current = 0, target = 0, pct = 0, isCurrency = true }) => {
  // Safe numbers: nos aseguramos de que siempre sean números válidos
  const safeCurrent = Number(current) || 0;
  const safeTarget = Number(target) || 0;
  const safePct = Number(pct) || 0;

  // 1. Color del semáforo según el cumplimiento %
  const getBadgeColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // Verde (≥ 100%)
    if (percentage >= 80) return '#e2e517';  // Naranja (80% - 99.9%)
    return '#ef4444';                        // Rojo (< 80%)
  };

  const badgeColor = getBadgeColor(safePct);

  // 2. Formateador de moneda ($ M / $ k)
  const formatMoney = (val) => {
    if (Math.abs(val) >= 1000000) {
      return `$${(val / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 0 })} M`;
    }
    return `$${(val / 1000).toLocaleString('es-CO', { maximumFractionDigits: 0 })} k`;
  };

  // 3. Lógica Proporcional de la Barra Bullet
  const maxScale = Math.max(safePct, 100) * 1.15; 
  
  // Posición dinámica de la barra azul/verde y de la línea blanca de la meta
  const barWidthPct = Math.min((safePct / maxScale) * 100, 100);
  const targetLinePosPct = (100 / maxScale) * 100;

  return (
    <div className="w-100">
      {/* Cabecera: Resultado a la izquierda - Meta a la derecha */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>
          {isCurrency ? formatMoney(safeCurrent) : `${safeCurrent.toFixed(2)}%`}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Meta {isCurrency ? formatMoney(safeTarget) : `${safeTarget.toFixed(2)}%`}
        </span>
      </div>

      {/* Track contenedor de la barra */}
      <div 
        className="position-relative rounded overflow-visible" 
        style={{ 
          height: '10px', 
          border: '#334155 solid 2px',
        }}
      >
        {/* Barra de progreso */}
        <div 
          className="h-100 rounded-start" 
          style={{ 
            width: `${barWidthPct}%`, 
            backgroundColor: isCurrency ? '#2563eb' : '#22c55e',
            transition: 'width 0.4s ease-in-out'
          }} 
        />

        {/* Línea Vertical Blanca de la META */}
        {safeTarget > 0 && (
          <div 
            className="position-absolute"
            style={{ 
              left: `${targetLinePosPct}%`, 
              top: '-3px',
              height: '16px', 
              width: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              border: '#334155 solid 1px',
              zIndex: 2
            }}
            title={`Meta: ${isCurrency ? formatMoney(safeTarget) : safeTarget + '%'}`}
          />
        )}
      </div>

      {/* Porcentaje y Punto indicador de Semáforo */}
      <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
        <span style={{ color: badgeColor, fontSize: '0.9rem', lineHeight: 1 }}>●</span>
        <span className="fw-bold" style={{ color: badgeColor }}>
          {safePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

// Componente principal para visualizar la comparación mensual
export default function MonthlyMargin({ monthlyCompareData, isMobile = false }) {
  return (
    <div className="rounded-3" style={{ fontFamily: 'sans-serif' }}>
      <h5 className="small fw-bold pt-1 mt-1 ps-2 mb-3">
        Comparativa Ventas Vs Rentabilidad ({new Date().getFullYear()})
      </h5>

      {/* Contenedor responsivo para permitir scroll suave en dispositivos móviles */}
      <div 
        style={{ 
          maxHeight: '390px', 
          overflowY: 'auto', 
          overflowX: isMobile ? 'auto' : 'hidden', 
          WebkitOverflowScrolling: 'touch' 
        }}
      >
        <table className="table-wrap table-responsive align-middle mb-0">
          <thead>
            <tr 
              className="fw-bold border-bottom" 
              style={{ fontSize: '0.8rem', borderColor: 'var(--bs-border-color-translucent, rgba(127,127,127,0.25))' }}
            >
              <th scope="col" style={{ width: '12%' }} className="ps-2">
                Mes
              </th>
              <th scope="col" style={{ width: '48%' }}>
                Ventas vs. Presupuesto
              </th>
              <th scope="col" style={{ width: '40%' }} className="pe-2">
                Rentabilidad Real vs. Meta
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyCompareData && monthlyCompareData.map((item) => (
              <tr 
                key={item.name} 
                className="border-bottom"
                style={{ 
                  fontSize: '0.7rem',
                  borderColor: 'var(--bs-border-color-translucent, rgba(127,127,127,0.15))' 
                }}
              >
                {/* 1. Nombre del Mes */}
                <td className="ps-2 fw-bold" style={{ fontSize: '0.75rem' }}>
                  {item.name}
                </td>

                {/* 2. Barra de Ventas */}
                <td className="py-1">
                  <BulletBar 
                    current={item.Ventas} 
                    target={item.Presupuesto} 
                    pct={item.cumplimientoVentasPct}
                    isCurrency={true} 
                  />
                </td>

                {/* 3. Barra de Rentabilidad */}
                <td className="py-1 pe-1">
                  <BulletBar 
                    current={item.Rentabilidad} 
                    target={item.MetaRentabilidad} 
                    pct={item.cumplimientoMargenPct}
                    isCurrency={false} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}