'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Plus, Send, BarChart3 } from 'lucide-react';

export default function EncuestasPage() {
  const [encuestas, setEncuestas] = useState([]);
  const [encuestaActiva, setEncuestaActiva] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [nuevaEncuesta, setNuevaEncuesta] = useState({ codigo: '', titulo: '', dirigido_a: 'estudiantes' });

  useEffect(() => { cargarEncuestas(); }, []);

  const cargarEncuestas = async () => {
    try {
      const { data } = await axios.get('/api/v1/encuestas');
      setEncuestas(data);
    } catch (err) {
      setEncuestas([
        { id: '1', codigo: 'ENC-2024-I', titulo: 'Satisfacción del Estudiante', dirigido_a: 'estudiantes', estado: 'publicada', anonima: true },
      ]);
    }
  };

  const responder = async (enc) => {
    setEncuestaActiva({
      ...enc,
      preguntas: [
        { id: 'p1', texto: '¿Cómo califica la calidad de enseñanza?', tipo: 'likert_5' },
        { id: 'p2', texto: '¿El docente cumple con el horario?', tipo: 'si_no' },
        { id: 'p3', texto: 'Comentarios adicionales', tipo: 'abierta' },
      ]
    });
    setRespuestas({});
  };

  const enviarRespuesta = async () => {
    try {
      await axios.post('/api/v1/encuestas/responder', {
        encuesta_id: encuestaActiva.id,
        respuestas: Object.entries(respuestas).map(([k, v]) => ({ pregunta_id: k, valor_numerico: typeof v === 'number' ? v : null, valor_texto: typeof v === 'string' ? v : null }))
      });
      alert('Encuesta enviada correctamente');
      setEncuestaActiva(null);
    } catch (err) { alert('Error al enviar'); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/encuestas', nuevaEncuesta);
      setMostrarCrear(false);
      cargarEncuestas();
    } catch (err) { alert('Error'); }
  };

  const renderInput = (p) => {
    if (p.tipo === 'likert_5') return (
      <div className="flex gap-2 mt-2">
        {[1,2,3,4,5].map(v => (
          <button key={v} onClick={() => setRespuestas({...respuestas, [p.id]: v})} className={`w-10 h-10 rounded-lg font-bold ${respuestas[p.id] === v ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{v}</button>
        ))}
      </div>
    );
    if (p.tipo === 'si_no') return (
      <div className="flex gap-2 mt-2">
        {['Sí', 'No'].map(v => (
          <button key={v} onClick={() => setRespuestas({...respuestas, [p.id]: v === 'Sí' ? 1 : 0})} className={`px-4 py-2 rounded-lg ${respuestas[p.id] === (v === 'Sí' ? 1 : 0) ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>{v}</button>
        ))}
      </div>
    );
    return <textarea className="w-full mt-2 p-2 border rounded-lg" rows={3} value={respuestas[p.id] || ''} onChange={e => setRespuestas({...respuestas, [p.id]: e.target.value})} />;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><ClipboardList /> Gestión de la Satisfacción</h2>
          <button onClick={() => setMostrarCrear(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /> Nueva Encuesta</button>
        </div>

        {mostrarCrear && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-semibold mb-4">Crear Encuesta</h3>
            <form onSubmit={handleCrear} className="grid grid-cols-3 gap-4">
              <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevaEncuesta.codigo} onChange={e => setNuevaEncuesta({...nuevaEncuesta, codigo: e.target.value})} required />
              <input placeholder="Título" className="px-3 py-2 border rounded-lg" value={nuevaEncuesta.titulo} onChange={e => setNuevaEncuesta({...nuevaEncuesta, titulo: e.target.value})} required />
              <select className="px-3 py-2 border rounded-lg" value={nuevaEncuesta.dirigido_a} onChange={e => setNuevaEncuesta({...nuevaEncuesta, dirigido_a: e.target.value})}>
                <option value="estudiantes">Estudiantes</option>
                <option value="docentes">Docentes</option>
                <option value="egresados">Egresados</option>
              </select>
              <button type="submit" className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Crear Encuesta</button>
            </form>
          </div>
        )}

        {!encuestaActiva ? (
          <div className="grid grid-cols-2 gap-6">
            {encuestas.map(e => (
              <div key={e.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-mono text-slate-500">{e.codigo}</p>
                    <p className="font-semibold text-slate-900 mt-1">{e.titulo}</p>
                    <p className="text-sm text-slate-500 mt-1">Dirigido a: {e.dirigido_a}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${e.estado === 'publicada' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{e.estado}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => responder(e)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"><Send size={16} /> Responder</button>
                  <button className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"><BarChart3 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-semibold mb-6">{encuestaActiva.titulo}</h3>
            <div className="space-y-6">
              {encuestaActiva.preguntas.map((p, i) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-800 mb-2">{i + 1}. {p.texto}</p>
                  {renderInput(p)}
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setEncuestaActiva(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
              <button onClick={enviarRespuesta} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Enviar Respuestas</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
