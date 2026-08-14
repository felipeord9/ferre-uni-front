import React, { useEffect, useState } from 'react';

const BulletBar = ({ current = 0, target = 0, pct = 0, isCurrency = true }) => {
  // 0. SANITIZACIÓN
  const safeCurrent = Number(current) || 0;
  const safeTarget = Number(target) || 0;
  const safePct = Number(pct) || 0;

  // 1. Color del semáforo según el cumplimiento %
  const getBadgeColor = (percentage) => {
    if (percentage >= 100) return '#10b981'; // Verde (≥ 100%)
    if (percentage >= 80) return '#e2e517';  // Naranja/Amarillo (80% - 99.9%)
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
  const barWidthPct = Math.min((safePct / maxScale) * 100, 100);
  const targetLinePosPct = (100 / maxScale) * 100;

  return (
    <div className="w-100">
      {/* Cabecera: Resultado a la izquierda - Meta a la derecha */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="fw-bold" style={{ fontSize: '0.85rem' }}>
          {isCurrency ? formatMoney(safeCurrent) : `${safeCurrent.toFixed(2)}%`}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Meta {isCurrency ? formatMoney(safeTarget) : `${safeTarget.toFixed(2)}%`}
        </span>
      </div>

      {/* Track contenedor de la barra */}
      <div 
        className="position-relative rounded overflow-visible" 
        style={{ height: '10px', border: '#334155 solid 2px' }}
      >
        {/* Barra de progreso de Resultado */}
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
        <span style={{ color: badgeColor, fontSize: '0.9rem' }}>●</span>
        <span className="fw-bold" style={{ color: badgeColor }}>
          {safePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default function SalesPerformanceDashboard({ performanceData = [] }) {
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

  return (
    <div className="rounded-3" style={{ fontFamily: 'sans-serif' }}>
      <h5 className="small fw-bold pt-1 mt-1 ps-2 mb-3">Comparativa Ventas Vs Rentabilidad Por C.O.</h5>
      
      <div className="" style={{ overflowX: isMobile ? 'auto' : 'hidden' }}>
        <table className="table-wrap table-responsive align-middle mb-0">
          <thead>
            <tr 
              className="fw-bold border-bottom border-secondary border-opacity-25" 
              style={{ fontSize: '0.8rem' }}
            >
              <th  style={{ width: isMobile ? '150px' : '15%' }} className="ps-0">C.O.</th>
              <th  style={{ width: isMobile ? '900px' : '45%' }}>Ventas vs. Presupuesto</th>
              <th  style={{ width: '40%' }} className="pe-0">Rentabilidad Real vs. Meta</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((item, index) => (
              <tr 
                key={item.co || index} 
                className="border-bottom border-secondary border-opacity-25"
              >
                {/* Nombre de la Localización / C.O. */}
                <td className="fw-bold ps-0" style={{ fontSize: '0.75rem' }}>
                  {item.nombre}
                </td>

                {/* Barra de Ventas */}
                <td className="py-1">
                  <BulletBar 
                    current={item.ventas} 
                    target={item.metaVentas} 
                    pct={item.cumplimientoVentasPct}
                    isCurrency={true} 
                  />
                </td>

                {/* Barra de Rentabilidad */}
                <td className="py-1 pe-0">
                  <BulletBar 
                    current={item.rentabilidad} 
                    target={item.metaRentabilidad} 
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