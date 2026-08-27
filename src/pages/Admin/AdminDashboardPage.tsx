import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarios.service';
import { Profile, Grua } from '../../types/domain';
import { ShieldCheck, Truck, Users, CheckCircle, Plus } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    const pData = await usuariosService.getProfiles();
    const gData = await usuariosService.getGruas();
    setProfiles(pData);
    setGruas(gData);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-2xl shadow-saas">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            Panel de Administración Global
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Gestión de usuarios, conductores, roles y flota de grúas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gruas Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-saas p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Flota de Grúas ({gruas.length})
            </h3>
          </div>

          <div className="space-y-2">
            {gruas.map(g => (
              <div key={g.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{g.nombre}</div>
                  <div className="text-xs text-slate-500 font-mono">Matrícula: {g.matricula}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded">
                    Capacidad: {g.capacidad} plazas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-saas p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Usuarios Registrados ({profiles.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {profiles.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900">{p.nombre}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </div>
                <span className={`px-2.5 py-0.5 font-bold text-xs rounded-full ${
                  p.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  p.rol === 'OFICINA' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {p.rol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
