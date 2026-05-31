import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2, Plus, Trash2, Edit2, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminDashboard() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'students' | 'modules' | 'lessons'>('students');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  // Queries
  const studentsQuery = trpc.students.list.useQuery();
  const modulesQuery = trpc.modules.list.useQuery();
  const lessonsQuery = trpc.lessons.listByModule.useQuery(
    { moduleId: selectedModuleId || 0 },
    { enabled: selectedModuleId !== null }
  );

  // Mutations
  const createStudentMutation = trpc.students.create.useMutation();
  const deleteStudentMutation = trpc.students.delete.useMutation();
  const createModuleMutation = trpc.modules.create.useMutation();
  const deleteModuleMutation = trpc.modules.delete.useMutation();
  const createLessonMutation = trpc.lessons.create.useMutation();
  const deleteLessonMutation = trpc.lessons.delete.useMutation();

  const [studentForm, setStudentForm] = useState({ email: '', name: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '' });
  const [createdStudent, setCreatedStudent] = useState<{ email: string; name: string; temporaryPassword: string } | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCreateStudent = async () => {
    if (!studentForm.email || !studentForm.name) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const result = await createStudentMutation.mutateAsync(studentForm);
      setCreatedStudent(result);
      toast.success('Aluno criado com sucesso!');
      setStudentForm({ email: '', name: '' });
      studentsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar aluno');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await deleteStudentMutation.mutateAsync({ id });
      toast.success('Aluno removido com sucesso!');
      studentsQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao remover aluno');
    }
  };

  const handleCreateModule = async () => {
    if (!moduleForm.title) {
      toast.error('Preencha o título do módulo');
      return;
    }

    try {
      await createModuleMutation.mutateAsync(moduleForm);
      toast.success('Módulo criado com sucesso!');
      setModuleForm({ title: '', description: '' });
      modulesQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao criar módulo');
    }
  };

  const handleDeleteModule = async (id: number) => {
    try {
      await deleteModuleMutation.mutateAsync({ id });
      toast.success('Módulo removido com sucesso!');
      modulesQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao remover módulo');
    }
  };

  const handleCreateLesson = async () => {
    if (!lessonForm.title || !lessonForm.videoUrl || !selectedModuleId) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await createLessonMutation.mutateAsync({
        moduleId: selectedModuleId,
        ...lessonForm,
      });
      toast.success('Aula criada com sucesso!');
      setLessonForm({ title: '', description: '', videoUrl: '' });
      lessonsQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao criar aula');
    }
  };

  const handleDeleteLesson = async (id: number) => {
    try {
      await deleteLessonMutation.mutateAsync({ id });
      toast.success('Aula removida com sucesso!');
      lessonsQuery.refetch();
    } catch (error: any) {
      toast.error('Erro ao remover aula');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Acesso negado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-slate-400 text-sm">Bem-vindo, {user.name}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700/50">
          {['students', 'modules', 'lessons'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                if (tab === 'lessons' && !selectedModuleId && modulesQuery.data?.[0]) {
                  setSelectedModuleId(modulesQuery.data[0].id);
                }
              }}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'students' && 'Alunos'}
              {tab === 'modules' && 'Módulos'}
              {tab === 'lessons' && 'Aulas'}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {createdStudent && (
              <Card className="bg-green-900/30 border-green-600/50 backdrop-blur-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">Aluno Criado com Sucesso!</h3>
                    <p className="text-slate-300 mb-2"><strong>Email:</strong> {createdStudent.email}</p>
                    <p className="text-slate-300 mb-2"><strong>Nome:</strong> {createdStudent.name}</p>
                    <p className="text-slate-300 mb-2"><strong>Senha Temporária:</strong></p>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-700 font-mono text-sm text-green-400 break-all">
                      {createdStudent.temporaryPassword}
                    </div>
                    <p className="text-slate-400 text-xs mt-3">Partilhe esta senha com o aluno. Ele pode alterá-la após o primeiro login.</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(createdStudent.temporaryPassword);
                      toast.success('Senha copiada!');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Copiar Senha
                  </Button>
                </div>
              </Card>
            )}

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Criar Novo Aluno</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Input
                  placeholder="Nome"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  onClick={handleCreateStudent}
                  disabled={createStudentMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Aluno
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Lista de Alunos</h2>
              {studentsQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : studentsQuery.data && studentsQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {studentsQuery.data.map((student) => (
                    <Card key={student.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{student.name}</p>
                        <p className="text-slate-400 text-sm">{student.email}</p>
                      </div>
                      <Button
                        onClick={() => handleDeleteStudent(student.id)}
                        disabled={deleteStudentMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Nenhum aluno criado ainda.</p>
              )}
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Criar Novo Módulo</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Título do Módulo"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Input
                  placeholder="Descrição"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  onClick={handleCreateModule}
                  disabled={createModuleMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createModuleMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Módulo
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Lista de Módulos</h2>
              {modulesQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : modulesQuery.data && modulesQuery.data.length > 0 ? (
                <div className="space-y-3">
                  {modulesQuery.data.map((module) => (
                    <Card key={module.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{module.title}</p>
                        <p className="text-slate-400 text-sm">{module.description}</p>
                      </div>
                      <Button
                        onClick={() => handleDeleteModule(module.id)}
                        disabled={deleteModuleMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">Nenhum módulo criado ainda.</p>
              )}
            </div>
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {modulesQuery.data && modulesQuery.data.length > 0 && (
              <>
                <div className="flex gap-2 mb-4">
                  {modulesQuery.data.map((module) => (
                    <Button
                      key={module.id}
                      onClick={() => setSelectedModuleId(module.id)}
                      variant={selectedModuleId === module.id ? 'default' : 'outline'}
                      className={selectedModuleId === module.id ? 'bg-blue-600' : 'border-slate-600'}
                    >
                      {module.title}
                    </Button>
                  ))}
                </div>

                {selectedModuleId && (
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Criar Nova Aula</h2>
                    <div className="space-y-4">
                      <Input
                        placeholder="Título da Aula"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Descrição"
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="URL do Vídeo (YouTube embed)"
                        value={lessonForm.videoUrl}
                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <Button
                        onClick={handleCreateLesson}
                        disabled={createLessonMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {createLessonMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Aula
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Aulas do Módulo</h2>
                  {lessonsQuery.isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : lessonsQuery.data && lessonsQuery.data.length > 0 ? (
                    <div className="space-y-3">
                      {lessonsQuery.data.map((lesson) => (
                        <Card key={lesson.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{lesson.title}</p>
                            <p className="text-slate-400 text-sm">{lesson.description}</p>
                          </div>
                          <Button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={deleteLessonMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">Nenhuma aula criada neste módulo.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
