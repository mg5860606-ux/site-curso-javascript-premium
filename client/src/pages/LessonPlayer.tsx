import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Loader2, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

export default function LessonPlayer() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [location, navigate] = useLocation();
  const lessonId = parseInt(location.split('/')[2]);
  const [isCompleted, setIsCompleted] = useState(false);

  const lessonQuery = trpc.lessons.getById.useQuery({ id: lessonId });
  const progressQuery = trpc.progress.getStudentProgress.useQuery();
  const markCompleteMutation = trpc.progress.markComplete.useMutation();
  const markIncompleteMutation = trpc.progress.markIncomplete.useMutation();

  useEffect(() => {
    if (progressQuery.data) {
      const progress = progressQuery.data.find(p => p.lessonId === lessonId);
      setIsCompleted(progress?.completed || false);
    }
  }, [progressQuery.data, lessonId]);

  const handleToggleComplete = async () => {
    try {
      if (isCompleted) {
        await markIncompleteMutation.mutateAsync({ lessonId });
        setIsCompleted(false);
        toast.success('Aula marcada como incompleta');
      } else {
        await markCompleteMutation.mutateAsync({ lessonId });
        setIsCompleted(true);
        toast.success('Aula marcada como completa!');
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar progresso');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (lessonQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!lessonQuery.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Aula não encontrada</p>
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  const lesson = lessonQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-slate-300 hover:bg-slate-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Video Player */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl mb-8 overflow-hidden">
          <div className="aspect-video bg-black flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={lesson.videoUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </Card>

        {/* Lesson Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{lesson.title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed">{lesson.description}</p>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Status da Aula</h3>
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                        <span className="text-green-400 font-medium">Concluída</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-6 h-6 text-slate-500" />
                        <span className="text-slate-400 font-medium">Não concluída</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleToggleComplete}
                  disabled={markCompleteMutation.isPending || markIncompleteMutation.isPending}
                  className={`w-full ${
                    isCompleted
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {markCompleteMutation.isPending || markIncompleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : isCompleted ? (
                    'Marcar como Incompleta'
                  ) : (
                    'Marcar como Completa'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
