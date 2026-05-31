import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Code2, BookOpen, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Corvo Dev</span>
          </div>
          <Button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isAuthenticated ? 'Ir para Dashboard' : 'Entrar na Plataforma'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Domine <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">JavaScript</span> do Básico ao Avançado
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Aprenda programação JavaScript com videoaulas profissionais, estruturadas e práticas. Desde conceitos fundamentais até técnicas avançadas de desenvolvimento web moderno.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-6"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: BookOpen, label: 'Módulos Completos', value: '12+' },
            { icon: Zap, label: 'Horas de Conteúdo', value: '50+' },
            { icon: Users, label: 'Alunos Satisfeitos', value: '1000+' },
          ].map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-200">
              <stat.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-700/50">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Estrutura do Curso</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Fundamentos',
              description: 'Variáveis, tipos de dados, operadores e estruturas de controle',
              lessons: 8,
            },
            {
              title: 'Funções & Escopo',
              description: 'Funções, closures, escopo e contexto de execução',
              lessons: 7,
            },
            {
              title: 'Objetos & Arrays',
              description: 'Manipulação de objetos, arrays e métodos úteis',
              lessons: 9,
            },
            {
              title: 'DOM & Eventos',
              description: 'Seleção de elementos, manipulação e tratamento de eventos',
              lessons: 10,
            },
            {
              title: 'Async & Promises',
              description: 'Callbacks, Promises, async/await e tratamento de erros',
              lessons: 8,
            },
            {
              title: 'APIs & Fetch',
              description: 'Integração com APIs, requisições HTTP e dados em tempo real',
              lessons: 9,
            },
          ].map((module, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <h3 className="text-xl font-semibold text-white mb-3">{module.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{module.description}</p>
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{module.lessons} aulas</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-700/50">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">Por que escolher este curso?</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[
            {
              title: 'Conteúdo Profissional',
              description: 'Aulas estruturadas e didáticas, criadas por especialistas em desenvolvimento web.',
            },
            {
              title: 'Acesso Ilimitado',
              description: 'Assista as aulas quantas vezes quiser, no seu próprio ritmo e horário.',
            },
            {
              title: 'Do Básico ao Avançado',
              description: 'Progressão natural do aprendizado, desde conceitos fundamentais até técnicas avançadas.',
            },
            {
              title: 'Prático e Aplicável',
              description: 'Exemplos reais e projetos práticos que você pode usar imediatamente no seu trabalho.',
            },
            {
              title: 'Suporte Contínuo',
              description: 'Acesso a recursos adicionais, dúvidas respondidas e atualizações constantes.',
            },
            {
              title: 'Certificado de Conclusão',
              description: 'Receba um certificado ao completar todos os módulos do curso.',
            },
          ].map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para começar?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Aceda agora à plataforma e comece a sua jornada para dominar JavaScript.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white hover:bg-slate-100 text-blue-600 font-semibold text-lg px-8 py-6"
          >
            Entrar na Plataforma
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-xl mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400">
          <p>© 2026 Corvo Dev. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
