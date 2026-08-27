import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Truck, Shield, Building2, RefreshCw } from 'lucide-react';
import { UserRole } from '../../config/appConfig';
import { resetLocalSeed } from '../../services/seedLocal';

export const Header: React.FC = () => {
  const { user, loginAsDemoUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl text-white font-black text-xl shadow-md">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">Gestión de Grúas</h1>
          <span className="text-xs text-slate-500 font-medium">Demo Local App</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Role Switcher for Demo Evaluation */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <span className="px-2 text-slate-500 font-semibold">Cambiar rol:</span>
          <button
            onClick={() => loginAsDemoUser('OFICINA')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              user?.rol === 'OFICINA'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Oficina
          </button>
          <button
            onClick={() => loginAsDemoUser('CONDUCTOR')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              user?.rol === 'CONDUCTOR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Conductor
          </button>
          <button
            onClick={() => loginAsDemoUser('ADMIN')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              user?.rol === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => { resetLocalSeed(); window.location.reload(); }}
          title="Resetear datos de prueba"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm">
              {user.nombre.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user.nombre}</div>
              <div className="text-[11px] font-medium text-slate-500">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
