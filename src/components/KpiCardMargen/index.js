import React from 'react';
import { PiSealPercentFill } from "react-icons/pi";
import './styles.css'

export default function KpiCardMargen({ title, value, subtitle }) {
  return (
    <div className="panel kpi-card border border-success">
      <small className="text-success">{title}</small>
      <div className="fw-bold text-success" style={{fontSize: 18, text: 'green'}}>{value}</div>
      <p className="percentage text-success" style={{fontSize: 23}}>{subtitle}</p>
    </div>
  );
}