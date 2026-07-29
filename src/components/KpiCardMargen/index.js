import React from 'react';

export default function KpiCardMargen({ title, value, subtitle, status = 'success', expectedValue = null }) {
  // Mapeo de estilos y colores dinámicos de Bootstrap
  const statusClasses = {
    success: { border: 'border-success', text: 'text-success', bg: 'bg-success-subtle' },
    warning: { border: 'border-warning', text: 'text-warning', bg: 'bg-warning-subtle' },
    danger:  { border: 'border-danger',  text: 'text-danger',  bg: 'bg-danger-subtle' },
    muted:   { border: 'border-secondary', text: 'text-muted', bg: 'bg-light' },
  };

  const currentTheme = statusClasses[status] || statusClasses.muted;

  return (
    <div className={`panel kpi-card border ${currentTheme.border} rounded`}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className={`fw-bold ${currentTheme.text}`}>{title}</small>
        {/* Indicador de semáforo en forma de punto */}
        <span 
          className={`badge rounded-pill ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`} 
          style={{ fontSize: '0.75rem' }}
        >
          {status === 'success' && '● Cumplido'}
          {status === 'warning' && '● Cerca'}
          {status === 'danger'  && '● Por debajo'}
          {status === 'muted'   && '● Sin meta'}
        </span>
      </div>

      {/* Valor actual de la margen */}
      <div className={`fw-bold ${currentTheme.text}`} style={{ fontSize: 29 }}>
        {value}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-1">
        <p className="percentage text-muted mb-0" style={{ fontSize: 13 }}>
          {subtitle}
        </p>
        
        {/* Muestra la rentabilidad esperada si existe */}
        {expectedValue !== null && expectedValue !== undefined && (
          <small className="text-muted fw-semibold" style={{ fontSize: 11 }}>
            Meta: {expectedValue}%
          </small>
        )}
      </div>
    </div>
  );
}