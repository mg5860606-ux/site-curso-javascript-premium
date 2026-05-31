import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2, Play, CheckCircle2, Circle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const modulesQuery = trpc.modules.list.useQuery();
  const lessonsQuery = trpc.lessons.listByModule.useQuery(
    { moduleId: selectedModuleId || 0 },
    { enabled: selectedModuleId !== null }
  );
  const progressQuery = trpc.progress.getStudentProgress.useQuery();
  const courseProgressQuery = trpc.progress.getCourseProgress.useQuery();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSelectModule = (moduleId: number) => {
    setSelectedModuleId(moduleId);
  };

  const handleWatchLesson = (lessonId: number) => {
    navigate(`/lesson/${lessonId}`);
  };

  const isLessonCompleted = (lessonId: number) => {
    return progressQuery.data?.some(p => p.lessonId === lessonId && p.completed);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Corvo Dev</h1>
            <p className="text-slate-400 text-sm">Bem-vindo, {user.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Progresso Geral */}
        {courseProgressQuery.data && (
          <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Seu Progresso no Curso</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">{courseProgressQuery.data.completed} de {courseProgressQuery.data.total} aulas concluídas</p>
                <div className="w-64 h-3 bg-blue-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                    style={{ width: `${courseProgressQuery.data.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{courseProgressQuery.data.percentage}%</p>
                <p className="text-blue-100 text-sm">Completo</p>
              </div>
            </div>
          </div>
        )}

        {/* Módulos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8">Módulos do Curso</h2>

          {modulesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : modulesQuery.data && modulesQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesQuery.data.map((module) => (
                <Card
                  key={module.id}
                  className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-xl cursor-pointer transition-all duration-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 ${
                    selectedModuleId === module.id ? 'border-blue-500 shadow-lg shadow-blue-500/20' : ''
                  }`}
                  onClick={() => handleSelectModule(module.id)}
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{module.description}</p>
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectModule(module.id);
                      }}
                    >
                      Ver Aulas
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum módulo disponível no momento.</p>
            </div>
          )}
        </div>

        {/* Aulas do Módulo Selecionado */}
        {selectedModuleId && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Aulas</h2>

            {lessonsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : lessonsQuery.data && lessonsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {lessonsQuery.data.map((lesson) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  return (
                    <Card
                      key={lesson.id}
                      className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-200"
                    >
                      <div className="p-6 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                            <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                          </div>
                          <p className="text-slate-400 text-sm mb-4">{lesson.description}</p>
                        </div>
                        <Button
                          onClick={() => handleWatchLesson(lesson.id)}
                          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Assistir
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Nenhuma aula disponível neste módulo.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
