"use client";

import { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Lightbulb, 
  User, 
  Play, 
  Pause, 
  RotateCcw,
  Trophy,
  Flame,
  DollarSign,
  Clock,
  BarChart3,
  Plus,
  Minus,
  Star,
  Award,
  Zap,
  Brain,
  Shield,
  ArrowRight,
  Home,
  Activity,
  Edit3,
  Trash2,
  Save,
  X,
  BookOpen
} from 'lucide-react';

import { 
  useUserData, 
  useHabits, 
  useMindsetNotes, 
  useProgressData,
  type UserData 
} from '@/hooks/useSupabaseData';

interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  isBreak: boolean;
  cycles: number;
}

export default function AlphaMind() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    personalGoal: '',
    financialGoal: '',
    targetSavings: ''
  });
  const [mindsetNote, setMindsetNote] = useState('');

  // Estados para CRUD
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [editingGoal, setEditingGoal] = useState<'personal' | 'financial' | null>(null);
  const [editGoalValue, setEditGoalValue] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<'personal' | 'financial'>('personal');
  const [newGoalValue, setNewGoalValue] = useState('');

  // Hooks do Supabase
  const { userData, loading: userLoading, saveUserData } = useUserData();
  const { habits, loading: habitsLoading, toggleHabit, addCustomHabit, removeHabit } = useHabits();
  const { notes, saveNote, deleteNote } = useMindsetNotes();
  const { updateProductiveTime } = useProgressData();

  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
    cycles: 0
  });

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timer.isActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev.seconds === 0) {
            if (prev.minutes === 0) {
              // Timer finished - atualizar tempo produtivo
              if (!prev.isBreak) {
                updateProductiveTime((prev.cycles + 1) * 0.42); // 25min = 0.42h
              }
              
              const newCycles = prev.isBreak ? prev.cycles : prev.cycles + 1;
              return {
                minutes: prev.isBreak ? 25 : 5,
                seconds: 0,
                isActive: false,
                isBreak: !prev.isBreak,
                cycles: newCycles
              };
            }
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isActive, updateProductiveTime]);

  // Check if onboarding is completed
  useEffect(() => {
    if (userData?.completed_onboarding) {
      setCurrentScreen('dashboard');
    }
  }, [userData?.completed_onboarding]);

  const startTimer = () => setTimer(prev => ({ ...prev, isActive: true }));
  const pauseTimer = () => setTimer(prev => ({ ...prev, isActive: false }));
  const resetTimer = () => setTimer({
    minutes: 25,
    seconds: 0,
    isActive: false,
    isBreak: false,
    cycles: timer.cycles
  });

  const completeOnboarding = async () => {
    const success = await saveUserData({
      name: formData.name,
      personal_goal: formData.personalGoal,
      financial_goal: formData.financialGoal,
      target_savings: parseInt(formData.targetSavings) || 10000,
      completed_onboarding: true,
      // Dados iniciais
      current_savings: 0,
      daily_discipline: 0,
      productive_time: 0,
      streak: 1,
      level: 1,
      badges: ['Bem-vindo ao AlphaMind']
    });

    if (success) {
      setCurrentScreen('dashboard');
    }
  };

  const saveMindsetNote = async () => {
    if (mindsetNote.trim()) {
      const success = await saveNote(mindsetNote);
      if (success) {
        setMindsetNote('');
        alert('Reflexão salva com sucesso!');
      }
    }
  };

  // Funções CRUD
  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      const success = await addCustomHabit(newHabitName.trim());
      if (success) {
        setNewHabitName('');
        setShowAddHabit(false);
      }
    }
  };

  const handleRemoveHabit = async (habitName: string) => {
    if (confirm(`Tem certeza que deseja remover o hábito "${habitName}"?`)) {
      await removeHabit(habitName);
    }
  };

  const handleEditGoal = (type: 'personal' | 'financial') => {
    setEditingGoal(type);
    setEditGoalValue(type === 'personal' ? userData?.personal_goal || '' : userData?.financial_goal || '');
  };

  const handleSaveGoal = async () => {
    if (editingGoal && editGoalValue.trim()) {
      const updateData = editingGoal === 'personal' 
        ? { personal_goal: editGoalValue.trim() }
        : { financial_goal: editGoalValue.trim() };
      
      const success = await saveUserData(updateData);
      if (success) {
        setEditingGoal(null);
        setEditGoalValue('');
      }
    }
  };

  const handleDeleteGoal = async (type: 'personal' | 'financial') => {
    if (confirm(`Tem certeza que deseja excluir esta meta?`)) {
      const updateData = type === 'personal' 
        ? { personal_goal: '' }
        : { financial_goal: '' };
      
      const success = await saveUserData(updateData);
      if (success) {
        setEditingGoal(null);
        setEditGoalValue('');
      }
    }
  };

  const handleAddGoal = async () => {
    if (newGoalValue.trim()) {
      const updateData = newGoalType === 'personal' 
        ? { personal_goal: newGoalValue.trim() }
        : { financial_goal: newGoalValue.trim() };
      
      const success = await saveUserData(updateData);
      if (success) {
        setNewGoalValue('');
        setShowAddGoal(false);
      }
    }
  };

  const motivationalQuotes = [
    "Disciplina é a ponte entre objetivos e conquistas.",
    "Cada dia é uma nova oportunidade de se tornar melhor.",
    "O sucesso é a soma de pequenos esforços repetidos diariamente.",
    "Sua única competição é quem você foi ontem.",
    "Grandes conquistas requerem grandes sacrifícios."
  ];

  const dailyQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-white">Carregando AlphaMind...</p>
        </div>
      </div>
    );
  }

  // Navigation Component
  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333] px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {[
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'progress', icon: TrendingUp, label: 'Progresso' },
          { id: 'habits', icon: CheckCircle, label: 'Hábitos' },
          { id: 'motivation', icon: Lightbulb, label: 'Motivação' },
          { id: 'profile', icon: User, label: 'Perfil' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentScreen(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
              currentScreen === id 
                ? 'text-[#FF2E2E] bg-[#FF2E2E]/10' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  // Onboarding Screen
  if (currentScreen === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AlphaMind</h1>
            <p className="text-gray-400">Transforme-se na sua melhor versão</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333]">
            {onboardingStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Bem-vindo, Alpha!</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qual é o seu nome?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors"
                    placeholder="Digite seu nome"
                  />
                </div>
                <button
                  onClick={() => setOnboardingStep(1)}
                  disabled={!formData.name}
                  className="w-full bg-[#FF2E2E] text-white py-3 rounded-lg font-semibold hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Meta Pessoal</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qual é seu principal objetivo pessoal?
                  </label>
                  <textarea
                    value={formData.personalGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, personalGoal: e.target.value }))}
                    className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors h-24 resize-none"
                    placeholder="Ex: Desenvolver disciplina para acordar às 6h todos os dias"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOnboardingStep(0)}
                    className="flex-1 bg-[#333] text-white py-3 rounded-lg font-semibold hover:bg-[#444] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => setOnboardingStep(2)}
                    disabled={!formData.personalGoal}
                    className="flex-1 bg-[#FF2E2E] text-white py-3 rounded-lg font-semibold hover:bg-[#FF4444] transition-colors disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Meta Financeira</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qual é seu objetivo financeiro?
                  </label>
                  <textarea
                    value={formData.financialGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, financialGoal: e.target.value }))}
                    className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors h-20 resize-none"
                    placeholder="Ex: Economizar para investir em um negócio próprio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta de economia (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.targetSavings}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetSavings: e.target.value }))}
                    className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors"
                    placeholder="10000"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="flex-1 bg-[#333] text-white py-3 rounded-lg font-semibold hover:bg-[#444] transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={completeOnboarding}
                    disabled={!formData.financialGoal || !formData.targetSavings}
                    className="flex-1 bg-[#FF2E2E] text-white py-3 rounded-lg font-semibold hover:bg-[#FF4444] transition-colors disabled:opacity-50"
                  >
                    Começar Jornada
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  // Dashboard Screen
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] pb-20">
        {/* Header */}
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Olá, {userData.name}</h1>
              <p className="text-gray-400">Nível {userData.level} Alpha</p>
            </div>
            <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#333]">
              <Flame className="w-5 h-5 text-[#FF2E2E]" />
              <span className="text-white font-semibold">{userData.streak} dias</span>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Disciplina Diária */}
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] hover:border-[#FF2E2E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FF2E2E]/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#FF2E2E]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Disciplina</p>
                  <p className="text-white font-bold text-lg">{userData.daily_discipline}%</p>
                </div>
              </div>
              <div className="w-full bg-[#333] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userData.daily_discipline}%` }}
                />
              </div>
            </div>

            {/* Dinheiro Poupado */}
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] hover:border-[#FF2E2E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Economia</p>
                  <p className="text-white font-bold text-lg">R$ {userData.current_savings.toLocaleString()}</p>
                </div>
              </div>
              <div className="w-full bg-[#333] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userData.current_savings / userData.target_savings) * 100}%` }}
                />
              </div>
            </div>

            {/* Tempo Produtivo */}
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] hover:border-[#FF2E2E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Produtivo</p>
                  <p className="text-white font-bold text-lg">{userData.productive_time.toFixed(1)}h</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Hoje</p>
            </div>

            {/* Hábitos Completados */}
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] hover:border-[#FF2E2E]/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Hábitos</p>
                  <p className="text-white font-bold text-lg">
                    {Object.values(habits).filter(Boolean).length}/{Object.keys(habits).length}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Completados</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] mt-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FF2E2E]" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCurrentScreen('habits')}
                className="bg-[#0D0D0D] p-3 rounded-lg border border-[#333] hover:border-[#FF2E2E]/50 transition-all duration-300 text-left"
              >
                <CheckCircle className="w-5 h-5 text-[#FF2E2E] mb-2" />
                <p className="text-white text-sm font-medium">Marcar Hábitos</p>
                <p className="text-gray-400 text-xs">Atualize seu progresso</p>
              </button>
              <button 
                onClick={() => setCurrentScreen('motivation')}
                className="bg-[#0D0D0D] p-3 rounded-lg border border-[#333] hover:border-[#FF2E2E]/50 transition-all duration-300 text-left"
              >
                <Play className="w-5 h-5 text-[#FF2E2E] mb-2" />
                <p className="text-white text-sm font-medium">Modo Foco</p>
                <p className="text-gray-400 text-xs">Timer Pomodoro</p>
              </button>
            </div>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Progress Screen
  if (currentScreen === 'progress') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] pb-20">
        {/* Header */}
        <div className="p-6 border-b border-[#333]">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FF2E2E]" />
            Progresso
          </h1>
          <p className="text-gray-400">Acompanhe sua evolução</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Streak Card */}
          <div className="bg-gradient-to-r from-[#FF2E2E]/20 to-[#FF4444]/20 p-6 rounded-xl border border-[#FF2E2E]/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-xl">Sequência Atual</h3>
                <p className="text-gray-300">Dias consecutivos de disciplina</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#FF2E2E] flex items-center gap-2">
                  <Flame className="w-8 h-8" />
                  {userData.streak}
                </div>
                <p className="text-gray-300 text-sm">dias</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Melhor sequência: {Math.max(userData.streak, 18)} dias
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF2E2E]" />
              Progresso Semanal
            </h3>
            <div className="space-y-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
                const progress = [20, 85, 92, 78, 95, 88, userData.daily_discipline][index];
                return (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm w-8">{day}</span>
                    <div className="flex-1 bg-[#333] rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-white text-sm w-12">{progress}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400 text-sm">Este Mês</span>
              </div>
              <p className="text-white font-bold text-xl">{userData.daily_discipline}%</p>
              <p className="text-gray-400 text-xs">Disciplina média</p>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-400 text-sm">Conquistas</span>
              </div>
              <p className="text-white font-bold text-xl">{userData.badges.length}</p>
              <p className="text-gray-400 text-xs">Badges desbloqueadas</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Nível Alpha</h3>
                <p className="text-gray-400 text-sm">Progresso para o próximo nível</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#FF2E2E]">{userData.level}</span>
                <p className="text-gray-400 text-sm">→ {userData.level + 1}</p>
              </div>
            </div>
            <div className="w-full bg-[#333] rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] h-3 rounded-full transition-all duration-500"
                style={{ width: '65%' }}
              />
            </div>
            <p className="text-gray-400 text-sm">650 / 1000 XP</p>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Habits Screen
  if (currentScreen === 'habits') {
    const eliminateHabits = Object.entries(habits).filter(([habit]) => 
      habit.includes('álcool') || habit.includes('baladas') || habit.includes('redes sociais')
    );
    
    const adoptHabits = Object.entries(habits).filter(([habit]) => 
      !habit.includes('álcool') && !habit.includes('baladas') && !habit.includes('redes sociais')
    );

    return (
      <div className="min-h-screen bg-[#0D0D0D] pb-20">
        {/* Header */}
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[#FF2E2E]" />
                Hábitos Alpha
              </h1>
              <p className="text-gray-400">Construa sua disciplina diária</p>
            </div>
            <button
              onClick={() => setShowAddHabit(true)}
              className="bg-[#FF2E2E] text-white p-2 rounded-lg hover:bg-[#FF4444] transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Habit Modal */}
          {showAddHabit && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333] w-full max-w-md">
                <h3 className="text-white font-semibold mb-4">Adicionar Novo Hábito</h3>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors mb-4"
                  placeholder="Ex: Beber 2L de água por dia"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddHabit(false);
                      setNewHabitName('');
                    }}
                    className="flex-1 bg-[#333] text-white py-2 rounded-lg hover:bg-[#444] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddHabit}
                    disabled={!newHabitName.trim()}
                    className="flex-1 bg-[#FF2E2E] text-white py-2 rounded-lg hover:bg-[#FF4444] transition-colors disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Eliminar Distrações */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Minus className="w-5 h-5 text-red-500" />
              Eliminar Distrações
            </h3>
            <div className="space-y-3">
              {eliminateHabits.map(([habit, completed]) => (
                <div key={habit} className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg border border-[#333]">
                  <span className="text-white flex-1">{habit}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabit(habit)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        completed 
                          ? 'bg-[#FF2E2E] border-[#FF2E2E]' 
                          : 'border-gray-500 hover:border-[#FF2E2E]'
                      }`}
                    >
                      {completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => handleRemoveHabit(habit)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adotar Práticas */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Adotar Práticas de Crescimento
            </h3>
            <div className="space-y-3">
              {adoptHabits.map(([habit, completed]) => (
                <div key={habit} className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded-lg border border-[#333]">
                  <span className="text-white flex-1">{habit}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabit(habit)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-500 hover:border-green-500'
                      }`}
                    >
                      {completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => handleRemoveHabit(habit)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-gradient-to-r from-[#FF2E2E]/20 to-[#FF4444]/20 p-6 rounded-xl border border-[#FF2E2E]/30">
            <h3 className="text-white font-semibold mb-2">Progresso de Hoje</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                {Object.values(habits).filter(Boolean).length} de {Object.keys(habits).length} hábitos completados
              </span>
              <span className="text-[#FF2E2E] font-bold">
                {Math.round((Object.values(habits).filter(Boolean).length / Object.keys(habits).length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#333] rounded-full h-3 mt-3">
              <div 
                className="bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(Object.values(habits).filter(Boolean).length / Object.keys(habits).length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Motivation Screen
  if (currentScreen === 'motivation') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] pb-20">
        {/* Header */}
        <div className="p-6 border-b border-[#333]">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#FF2E2E]" />
            Motivação
          </h1>
          <p className="text-gray-400">Mantenha o foco e a disciplina</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Daily Quote */}
          <div className="bg-gradient-to-r from-[#FF2E2E]/20 to-[#FF4444]/20 p-6 rounded-xl border border-[#FF2E2E]/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#FF2E2E] rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Frase do Dia</h3>
                <p className="text-gray-200 text-lg italic leading-relaxed">"{dailyQuote}"</p>
              </div>
            </div>
          </div>

          {/* Pomodoro Timer */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF2E2E]" />
              Modo Foco - Pomodoro
            </h3>
            
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-white mb-2">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
              <p className="text-gray-400">
                {timer.isBreak ? 'Pausa' : 'Foco'} • Ciclo {timer.cycles}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={timer.isActive ? pauseTimer : startTimer}
                className="bg-[#FF2E2E] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF4444] transition-colors flex items-center gap-2"
              >
                {timer.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {timer.isActive ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={resetTimer}
                className="bg-[#333] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#444] transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>

            <div className="bg-[#0D0D0D] p-4 rounded-lg border border-[#333]">
              <p className="text-gray-400 text-sm mb-2">Sessões completadas hoje:</p>
              <div className="flex gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < timer.cycles ? 'bg-[#FF2E2E]' : 'bg-[#333]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mindset Notes */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FF2E2E]" />
              Anotações de Mindset
            </h3>
            <textarea
              value={mindsetNote}
              onChange={(e) => setMindsetNote(e.target.value)}
              className="w-full h-32 p-4 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors resize-none"
              placeholder="Anote seus pensamentos, reflexões e insights sobre disciplina e crescimento pessoal..."
            />
            <button 
              onClick={saveMindsetNote}
              className="mt-3 bg-[#FF2E2E] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#FF4444] transition-colors"
            >
              Salvar Reflexão
            </button>
          </div>

          {/* Reflexões Salvas */}
          {notes.length > 0 && (
            <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FF2E2E]" />
                Suas Reflexões
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-[#0D0D0D] p-4 rounded-lg border border-[#333]">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-400 text-xs">
                        {new Date(note.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                      <button
                        onClick={() => deleteNote(note.id!)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Motivation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">Meta Diária</p>
              <p className="text-gray-400 text-xs">{userData.daily_discipline}% completa</p>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333] text-center">
              <Flame className="w-8 h-8 text-[#FF2E2E] mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">Sequência</p>
              <p className="text-gray-400 text-xs">{userData.streak} dias</p>
            </div>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  // Profile Screen
  if (currentScreen === 'profile') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] pb-20">
        {/* Header */}
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
              <p className="text-gray-400">Nível {userData.level} Alpha</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Goals */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF2E2E]" />
                Metas de Longo Prazo
              </h3>
              <button
                onClick={() => setShowAddGoal(true)}
                className="text-[#FF2E2E] hover:text-[#FF4444] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Add Goal Modal */}
            {showAddGoal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333] w-full max-w-md">
                  <h3 className="text-white font-semibold mb-4">Adicionar Nova Meta</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Meta</label>
                    <select
                      value={newGoalType}
                      onChange={(e) => setNewGoalType(e.target.value as 'personal' | 'financial')}
                      className="w-full p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors"
                    >
                      <option value="personal">Pessoal</option>
                      <option value="financial">Financeira</option>
                    </select>
                  </div>
                  <textarea
                    value={newGoalValue}
                    onChange={(e) => setNewGoalValue(e.target.value)}
                    className="w-full h-24 p-3 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors resize-none mb-4"
                    placeholder="Descreva sua meta..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowAddGoal(false);
                        setNewGoalValue('');
                      }}
                      className="flex-1 bg-[#333] text-white py-2 rounded-lg hover:bg-[#444] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddGoal}
                      disabled={!newGoalValue.trim()}
                      className="flex-1 bg-[#FF2E2E] text-white py-2 rounded-lg hover:bg-[#FF4444] transition-colors disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Meta Pessoal */}
              {userData.personal_goal && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-sm">Meta Pessoal</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGoal('personal')}
                        className="text-[#FF2E2E] hover:text-[#FF4444] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal('personal')}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingGoal === 'personal' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editGoalValue}
                        onChange={(e) => setEditGoalValue(e.target.value)}
                        className="flex-1 p-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors resize-none"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={handleSaveGoal}
                          className="bg-[#FF2E2E] text-white p-2 rounded hover:bg-[#FF4444] transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoal(null);
                            setEditGoalValue('');
                          }}
                          className="bg-[#333] text-white p-2 rounded hover:bg-[#444] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white">{userData.personal_goal}</p>
                  )}
                </div>
              )}

              {/* Meta Financeira */}
              {userData.financial_goal && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-sm">Meta Financeira</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGoal('financial')}
                        className="text-[#FF2E2E] hover:text-[#FF4444] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal('financial')}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingGoal === 'financial' ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editGoalValue}
                        onChange={(e) => setEditGoalValue(e.target.value)}
                        className="flex-1 p-2 bg-[#0D0D0D] border border-[#333] rounded-lg text-white focus:border-[#FF2E2E] focus:outline-none transition-colors resize-none"
                        rows={2}
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={handleSaveGoal}
                          className="bg-[#FF2E2E] text-white p-2 rounded hover:bg-[#FF4444] transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingGoal(null);
                            setEditGoalValue('');
                          }}
                          className="bg-[#333] text-white p-2 rounded hover:bg-[#444] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white">{userData.financial_goal}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-sm">R$ {userData.current_savings.toLocaleString()}</span>
                        <span className="text-gray-400 text-sm">R$ {userData.target_savings.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-[#333] rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(userData.current_savings / userData.target_savings) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF2E2E]" />
              Conquistas Desbloqueadas
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {userData.badges.map((badge, index) => (
                <div key={index} className="bg-[#0D0D0D] p-3 rounded-lg border border-[#333] flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#333]">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF2E2E]" />
              Estatísticas Alpha
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#FF2E2E]">{userData.streak}</p>
                <p className="text-gray-400 text-sm">Dias de sequência</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{userData.level}</p>
                <p className="text-gray-400 text-sm">Nível atual</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{userData.badges.length}</p>
                <p className="text-gray-400 text-sm">Badges conquistadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">{userData.daily_discipline}%</p>
                <p className="text-gray-400 text-sm">Disciplina média</p>
              </div>
            </div>
          </div>

          {/* Next Level */}
          <div className="bg-gradient-to-r from-[#FF2E2E]/20 to-[#FF4444]/20 p-6 rounded-xl border border-[#FF2E2E]/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Próximo Nível</h3>
                <p className="text-gray-300 text-sm">Continue evoluindo para desbloquear</p>
              </div>
              <ArrowRight className="w-6 h-6 text-[#FF2E2E]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FF2E2E] rounded-full flex items-center justify-center mb-2">
                  <span className="text-white font-bold">{userData.level}</span>
                </div>
                <p className="text-gray-400 text-xs">Atual</p>
              </div>
              <div className="flex-1 bg-[#333] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#FF2E2E] to-[#FF4444] h-2 rounded-full transition-all duration-500"
                  style={{ width: '65%' }}
                />
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#333] rounded-full flex items-center justify-center mb-2 border-2 border-[#FF2E2E]">
                  <span className="text-[#FF2E2E] font-bold">{userData.level + 1}</span>
                </div>
                <p className="text-gray-400 text-xs">Próximo</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">350 XP restantes para o próximo nível</p>
          </div>
        </div>

        <Navigation />
      </div>
    );
  }

  return null;
}