import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Activity,
  Receipt,
  History,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/oficina', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/oficina/crear-viaje', icon: PlusCircle, label: 'Crear viaje' },
    { to: '/oficina/montaje', icon: Package, label: 'Montaje diario' },
    { to: '/oficina/seguimiento', icon: Activity, label: 'Seguimiento' },
    { to: '/oficina/facturacion', icon: Receipt, label: 'Facturación' },
    { to: '/oficina/historial', icon: History, label: 'Historial' },
  ];

  if (user?.rol === 'ADMIN') {
    navItems.push({ to: '/admin', icon: ShieldCheck, label: 'Administración' });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b border-slate-800/60">
        <div className="text-xs uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
          Menú Oficina
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/60 text-xs text-slate-500 text-center">
        Grúas App v1.0 MVP Demo
      </div>
    </aside>
  );
};
