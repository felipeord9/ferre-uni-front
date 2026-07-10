import React from 'react';

export default function KpiCard({ title, value, subtitle }) {
  return (
    <div className="panel kpi-card">
      <small className="muted">{title}</small>
      <div className="kpi-value" style={{fontSize: 18}}>{value}</div>
      <p className="hint" style={{fontSize: 23}}>{subtitle}</p>
    </div>
  );
}