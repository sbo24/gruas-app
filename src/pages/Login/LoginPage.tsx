import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, Shield, Building2, User, Key, ArrowRight } from 'lucide-react';
import { UserRole } from '../../config/appConfig';

export const LoginPage: React.FC = () => {
  const { loginAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('conductor')) {
      await loginAsDemoUser('CONDUCTOR', email);
      navigate('/conductor');
    } else if (email.includes('admin')) {
      await loginAsDemoUser('ADMIN', email);
      navigate('/admin');
    } else {
      await loginAsDemoUser('OFICINA', email);
      navigate('/oficina');
    }
  };

  const handleQuickLogin = async (role: UserRole, targetEmail?: string) => {
    await loginAsDemoUser(role, targetEmail);
    if (role === 'CONDUCTOR') {
      navigate('/conductor');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/oficina');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Gestión de Grúas SaaS</h2>
          <p className="text-sm text-slate-400 mt-1">Plataforma Inteligente de Auxilio y Transporte</p>
        </div>

        {/* Quick Demo Login Switcher */}
        <div className="mb-6 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Acceso Rápido Demo (1-Click)
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('OFICINA', 'oficina@gruas.demo')}
              className="flex items-center justify-between p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-semibold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Oficina (Elena)</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => handleQuickLogin('CONDUCTOR', 'juan.conductor@gruas.demo')}
              className="flex items-center justify-between p-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-sm font-semibold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Conductor (Juan Pérez)</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => handleQuickLogin('ADMIN', 'admin@gruas.demo')}
              className="flex items-center justify-between p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-semibold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Administrador Principal</span>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase font-semibold">o con email</span>
        </div>

        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo electrónico</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. oficina@gruas.demo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};
