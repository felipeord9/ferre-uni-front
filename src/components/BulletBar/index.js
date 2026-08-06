const BulletBar = ({ current = 0, target = 0, pct = 0, isCurrency = true }) => {
  // 0. SANITIZACIÓN: Forzamos a que siempre sean números válidos (si vienen undefined/null/NaN toman 0)
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
        <span className="fw-bold" style={{ fontSize: '0.9rem' }}>
          {isCurrency ? formatMoney(safeCurrent) : `${safeCurrent.toFixed(2)}%`}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Meta {isCurrency ? formatMoney(safeTarget) : `${safeTarget.toFixed(2)}%`}
        </span>
      </div>

      {/* Track contenedor de la barra (Gris oscuro/Fondo) */}
      <div 
        className="position-relative rounded overflow-visible" 
        style={{ 
          height: '10px', 
          border: '#334155 solid 2px', // Gris de pista
        }}
      >
        {/* Barra de progreso de Resultado (Azul para ventas, Verde para rentabilidad) */}
        <div 
          className="h-100 rounded-start" 
          style={{ 
            width: `${barWidthPct}%`, 
            backgroundColor: isCurrency ? '#2563eb' : '#22c55e', // Azul vs Verde
            transition: 'width 0.4s ease-in-out'
          }} 
        />

        {/* Linea Vertical Blanca de la META */}
        {safeTarget > 0 && (
          <div 
            className="position-absolute"
            style={{ 
              left: `${targetLinePosPct}%`, 
              top: '-3px',
              height: '16px', 
              width: '2px',
              backgroundColor: '#ffffff', // Línea blanca que resalta
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
              border: '#334155 solid 1px',
              zIndex: 2
            }}
            title={`Meta: ${isCurrency ? formatMoney(safeTarget) : safeTarget + '%'}`}
          />
        )}
      </div>

      {/* Porcentaje y Punto indicador de Semáforo */}
      <div className="d-flex align-items-center gap-0 mt-1" style={{ fontSize: '0.8rem' }}>
        <span style={{ color: badgeColor, fontSize: '0.9rem' }}>●</span>
        <span className="fw-bold" style={{ color: badgeColor }}>
          {safePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default function SalesPerformanceDashboard({ performanceData }) {
  return (
    <div 
      className="rounded-3 " 
      style={{ fontFamily: 'sans-serif' }}
    >
      <h5 className="small fw-bold mb-3">Comparativa Ventas Vs Rentabilidad Por C.O.</h5>
      {/* Encabezados principales */}
      <div className=" row fw-bold mb-3 pb-2 border-bottom border-bottom-secondary border-bottom-opacity-25" style={{ fontSize: '0.8rem' }}>
        <div className="col-1">C.O.</div>
        <div className="col-6 d-flex">Ventas vs. Presupuesto</div>
        <div className="col-5">Rentabilidad Real vs. Meta</div>
      </div>

      {/* Filas dinámicas de C.O. */}
      <div className="d-flex flex-column gap-1">
        {performanceData.map((item) => (
          <div 
            key={item.co} 
            className="row align-items-center py-1 border-bottom border-bottom-secondary border-bottom-opacity-25"
          >
            {/* Nombre de la Localización / C.O. */}
            <div className="col-1 fw-bold" style={{ fontSize: '0.7rem' }}>
              {item.nombre}
            </div>

            {/* Barra de Ventas */}
            <div className="col-6">
              <BulletBar 
                current={item.ventas} 
                target={item.metaVentas} 
                pct={item.cumplimientoVentasPct}
                isCurrency={true} 
              />
            </div>

            {/* Barra de Rentabilidad */}
            <div className="col-5">
              <BulletBar 
                current={item.rentabilidad} 
                target={item.metaRentabilidad} 
                pct={item.cumplimientoMargenPct}
                isCurrency={false} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}