import React, { useState } from 'react';
import { Activity, Calendar, User, Compass, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewActivityView({
  students,
  exercises,
  setActivities,
  setCurrentView,
  setSelectedActivity
}) {
  const activeStudents = students.filter(s => s.status === 'Activo');
  const activeExercises = exercises.filter(e => e.status === 'Activo');

  const [studentId, setStudentId] = useState(activeStudents[0]?.id || '');
  const [exerciseId, setExerciseId] = useState(activeExercises[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!studentId || !exerciseId || !date) {
      setError('Por favor seleccione al estudiante, el ejercicio y la fecha de realización.');
      return;
    }

    const selectedStudent = students.find(s => s.id === Number(studentId));
    const selectedExercise = exercises.find(e => e.id === Number(exerciseId));

    setIsSubmitting(true);

    setTimeout(() => {
      const newActivity = {
        id: Date.now(),
        studentId: Number(studentId),
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        exerciseId: Number(exerciseId),
        exerciseName: selectedExercise.name,
        patternType: selectedExercise.patternType,
        date: date,
        status: 'Pendiente de imagen',
        imageUrl: null,
        imageMetadata: null,
        features: null
      };

      setActivities(prev => [newActivity, ...prev]);
      setSelectedActivity(newActivity);
      setIsSubmitting(false);
      setCurrentView('activity-detail');
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setCurrentView('activities')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a actividades</span>
      </button>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Nueva Actividad Grafomotora</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Vincule al alumno con el ejercicio de trazo realizado en el aula
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Estudiante dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Estudiante de Nivel Inicial
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              >
                {activeStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.courseName || 'Kinder A'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Seleccione el niño que realizó el trazo en la hoja física.</p>
          </div>

          {/* Ejercicio dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Ejercicio Grafomotor
            </label>
            <div className="relative">
              <Compass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              >
                {activeExercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name} [{exercise.patternType}]
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Define el patrón geométrico de la ficha entregada.</p>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Fecha de Realización
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                required
              />
            </div>
          </div>

          {/* Initial Status Notification */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-medium">Estado inicial:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Pendiente de imagen
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Registrando actividad...</span>
            ) : (
              <>
                <span>Registrar y Cargar Fotografía</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
