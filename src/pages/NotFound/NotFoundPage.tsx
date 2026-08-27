import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-center">
      <div className="space-y-4 max-w-md">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black text-white">404</h2>
        <p className="text-slate-400 text-sm">La página que estás buscando no existe o no tienes permisos para acceder.</p>
        <Link
          to="/oficina"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel Principal
        </Link>
      </div>
    </div>
  );
};
