import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { viajesService } from '../../services/viajes.service';
import { PlusCircle, CheckCircle, ArrowLeft, Truck, AlertTriangle } from 'lucide-react';

export const CrearViajePage: React.FC = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cliente: '',
    matricula: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_recogida: '',
    direccion: '',
    latitud: 40.300,
    longitud: -3.800,
    rueda: true,
    doble: false,
    tipo_calle: 'Calle Normal',
    observaciones: '',
    importe: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await viajesService.createViaje({
      cliente: formData.cliente,
      matricula: formData.matricula.toUpperCase(),
      telefono: formData.telefono,
      fecha: formData.fecha,
      hora_recogida: formData.hora_recogida || null,
      direccion: formData.direccion,
      latitud: Number(formData.latitud),
      longitud: Number(formData.longitud),
      rueda: formData.rueda,
      doble: formData.doble,
      tipo_calle: formData.tipo_calle,
      observaciones: formData.observaciones,
      importe: Number(formData.importe),
      estado: 'PENDIENTE_MONTAR'
    });

    setLoading(false);
    setSuccessMessage(true);

    setTimeout(() => {
      navigate('/oficina/montaje');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/oficina')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Crear Nuevo Viaje / Servicio</h2>
          <p className="text-sm text-slate-500 font-medium">
            Registra una solicitud de auxilio o traslado para montaje diario
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">¡Viaje creado con éxito!</div>
            <div className="text-xs text-emerald-700">Guardado con estado PENDIENTE_MONTAR. Redirigiendo a Montaje Diario...</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-saas p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Cliente / Aseguradora <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              placeholder="ej. Aseguradora Mapfre"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Matrícula */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Matrícula <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              placeholder="ej. 1234-BBB"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Teléfono de Contacto <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="ej. 600111222"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Fecha de Servicio <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Dirección de Recogida <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="ej. Calle Mayor 12, Alcorcón"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Optional Hora Recogida */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Hora Recogida Fija (Opcional)
            </label>
            <input
              type="time"
              value={formData.hora_recogida}
              onChange={(e) => setFormData({ ...formData, hora_recogida: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Importe */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Importe Estimado (€)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={formData.importe}
              onChange={(e) => setFormData({ ...formData, importe: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Rueda & Doble Toggles */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-slate-900">¿Tiene rueda / Rueda gira?</span>
              <span className="text-xs text-slate-500">Afecta la regla NO RUEDA del algoritmo</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, rueda: !formData.rueda })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                formData.rueda ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-slate-900">¿Vehículo DOBLE (2 plazas)?</span>
              <span className="text-xs text-slate-500">Furgón / Camión ligero / Vehículo voluminoso</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, doble: !formData.doble })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                formData.doble ? 'bg-amber-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          {/* Tipo de calle */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tipo de Calle</label>
            <select
              value={formData.tipo_calle}
              onChange={(e) => setFormData({ ...formData, tipo_calle: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Calle Normal">Calle Normal</option>
              <option value="Avenida">Avenida / Vía Rápida</option>
              <option value="Estrecha">Calle Estrecha</option>
              <option value="Peatonal">Zona Peatonal</option>
              <option value="Carretera">Carretera / Autovía</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Observaciones</label>
            <textarea
              rows={3}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Detalles sobre avería, acceso o indicaciones especiales..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/oficina')}
            className="px-5 py-2.5 text-slate-600 font-semibold text-sm hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Crear Viaje (PENDIENTE_MONTAR)'}
          </button>
        </div>
      </form>
    </div>
  );
};
