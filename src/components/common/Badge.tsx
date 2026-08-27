import React from 'react';
import { ViajeEstado } from '../../config/appConfig';

interface BadgeProps {
  estado: ViajeEstado | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ estado, size = 'md' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'PENDIENTE_MONTAR':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'EN_PAQUETE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ASIGNADO':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'EN_CAMINO':
      case 'EN_UBICACION':
      case 'CARGANDO':
      case 'CARGADO':
      case 'EN_RUTA':
      case 'EN_BASE':
      case 'DESCARGANDO':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300 font-semibold animate-pulse';
      case 'TERMINADO':
      case 'PAGADO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'INCIDENCIA':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'PENDIENTE':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ');
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClass} ${getBadgeStyle(estado)} shadow-xs`}>
      {formatText(estado)}
    </span>
  );
};
