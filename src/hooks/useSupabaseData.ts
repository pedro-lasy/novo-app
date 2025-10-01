import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface UserData {
  id?: string
  name: string
  personal_goal: string
  financial_goal: string
  current_savings: number
  target_savings: number
  daily_discipline: number
  productive_time: number
  streak: number
  level: number
  badges: string[]
  completed_onboarding: boolean
}

export interface Habit {
  id?: string
  user_id: string
  name: string
  completed: boolean
  date: string
}

export interface ProgressLog {
  id?: string
  user_id: string
  date: string
  discipline_score: number
  productive_hours: number
  habits_completed: number
  total_habits: number
}

export interface MindsetNote {
  id?: string
  user_id: string
  content: string
  created_at?: string
}

// Hook para gerenciar dados do usuário
export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Gerar um ID único para o usuário (simulando autenticação)
  const getUserId = () => {
    let userId = localStorage.getItem('alphamind_user_id')
    if (!userId) {
      userId = crypto.randomUUID()
      localStorage.setItem('alphamind_user_id', userId)
    }
    return userId
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setUserData({
          id: data.id,
          name: data.name,
          personal_goal: data.personal_goal,
          financial_goal: data.financial_goal,
          current_savings: data.current_savings,
          target_savings: data.target_savings,
          daily_discipline: data.daily_discipline,
          productive_time: parseFloat(data.productive_time),
          streak: data.streak,
          level: data.level,
          badges: data.badges || [],
          completed_onboarding: data.completed_onboarding
        })
      } else {
        // Usuário não existe, criar dados padrão
        setUserData({
          name: '',
          personal_goal: '',
          financial_goal: '',
          current_savings: 0,
          target_savings: 10000,
          daily_discipline: 0,
          productive_time: 0,
          streak: 0,
          level: 1,
          badges: [],
          completed_onboarding: false
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const saveUserData = async (data: Partial<UserData>) => {
    try {
      const userId = getUserId()
      
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          ...data,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setUserData(prev => prev ? { ...prev, ...data } : null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados')
      return false
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  return {
    userData,
    loading,
    error,
    saveUserData,
    refreshUserData: loadUserData
  }
}

// Hook para gerenciar hábitos
export function useHabits() {
  const [habits, setHabits] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)

  const defaultHabits = {
    'Eliminar álcool': false,
    'Evitar baladas': false,
    'Reduzir redes sociais': false,
    'Exercitar-se diariamente': false,
    'Ler 30min/dia': false,
    'Meditar 10min': false,
    'Acordar 6h': false,
    'Planejar o dia': false,
  }

  const getUserId = () => {
    return localStorage.getItem('alphamind_user_id') || crypto.randomUUID()
  }

  const loadHabits = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)

      if (error) throw error

      const habitsMap = { ...defaultHabits }
      data?.forEach(habit => {
        habitsMap[habit.name] = habit.completed
      })

      setHabits(habitsMap)
    } catch (err) {
      console.error('Erro ao carregar hábitos:', err)
      setHabits(defaultHabits)
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (habitName: string) => {
    try {
      const userId = getUserId()
      const today = new Date().toISOString().split('T')[0]
      const newValue = !habits[habitName]

      // Verificar se o hábito já existe hoje
      const { data: existingHabit } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', userId)
        .eq('name', habitName)
        .eq('date', today)
        .single()

      if (existingHabit) {
        // Atualizar hábito existente
        await supabase
          .from('habits')
          .update({ completed: newValue })
          .eq('id', existingHabit.id)
      } else {
        // Criar novo hábito
        await supabase
          .from('habits')
          .insert({
            user_id: userId,
            name: habitName,
            completed: newValue,
            date: today
          })
      }

      setHabits(prev => ({ ...prev, [habitName]: newValue }))
      
      // Atualizar progresso do usuário
      await updateDailyProgress()
    } catch (err) {
      console.error('Erro ao atualizar hábito:', err)
    }
  }

  const addCustomHabit = async (habitName: string) => {
    try {
      const userId = getUserId()
      const today = new Date().toISOString().split('T')[0]

      // Adicionar hábito ao estado local
      setHabits(prev => ({ ...prev, [habitName]: false }))

      // Criar registro no banco
      await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: habitName,
          completed: false,
          date: today
        })

      await updateDailyProgress()
      return true
    } catch (err) {
      console.error('Erro ao adicionar hábito:', err)
      return false
    }
  }

  const removeHabit = async (habitName: string) => {
    try {
      const userId = getUserId()

      // Remover TODOS os registros deste hábito do banco (não apenas hoje)
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('user_id', userId)
        .eq('name', habitName)

      if (error) {
        console.error('Erro ao remover do banco:', error)
        return false
      }

      // Remover do estado local APÓS sucesso no banco
      const newHabits = { ...habits }
      delete newHabits[habitName]
      setHabits(newHabits)

      await updateDailyProgress(newHabits)
      return true
    } catch (err) {
      console.error('Erro ao remover hábito:', err)
      return false
    }
  }

  const updateDailyProgress = async (currentHabits?: { [key: string]: boolean }) => {
    try {
      const userId = getUserId()
      const today = new Date().toISOString().split('T')[0]
      
      // Usar hábitos passados como parâmetro ou do estado atual
      const habitsToUse = currentHabits || habits
      const completedHabits = Object.values(habitsToUse).filter(Boolean).length
      const totalHabits = Object.keys(habitsToUse).length
      const disciplineScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

      // Salvar log de progresso
      await supabase
        .from('progress_logs')
        .upsert({
          user_id: userId,
          date: today,
          discipline_score: disciplineScore,
          productive_hours: 0, // Será atualizado pelo timer
          habits_completed: completedHabits,
          total_habits: totalHabits
        })

      // Atualizar dados do usuário
      await supabase
        .from('users')
        .update({
          daily_discipline: disciplineScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

    } catch (err) {
      console.error('Erro ao atualizar progresso:', err)
    }
  }

  useEffect(() => {
    loadHabits()
  }, [])

  return {
    habits,
    loading,
    toggleHabit,
    addCustomHabit,
    removeHabit,
    refreshHabits: loadHabits
  }
}

// Hook para anotações de mindset
export function useMindsetNotes() {
  const [notes, setNotes] = useState<MindsetNote[]>([])
  const [loading, setLoading] = useState(true)

  const getUserId = () => {
    return localStorage.getItem('alphamind_user_id') || crypto.randomUUID()
  }

  const loadNotes = async () => {
    try {
      setLoading(true)
      const userId = getUserId()

      const { data, error } = await supabase
        .from('mindset_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (err) {
      console.error('Erro ao carregar anotações:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async (content: string) => {
    try {
      const userId = getUserId()

      const { error } = await supabase
        .from('mindset_notes')
        .insert({
          user_id: userId,
          content
        })

      if (error) throw error
      await loadNotes() // Recarregar notas
      return true
    } catch (err) {
      console.error('Erro ao salvar anotação:', err)
      return false
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('mindset_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      await loadNotes() // Recarregar notas
      return true
    } catch (err) {
      console.error('Erro ao deletar anotação:', err)
      return false
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  return {
    notes,
    loading,
    saveNote,
    deleteNote,
    refreshNotes: loadNotes
  }
}

// Hook para dados de progresso
export function useProgressData() {
  const [progressData, setProgressData] = useState<ProgressLog[]>([])
  const [loading, setLoading] = useState(true)

  const getUserId = () => {
    return localStorage.getItem('alphamind_user_id') || crypto.randomUUID()
  }

  const loadProgressData = async () => {
    try {
      setLoading(true)
      const userId = getUserId()

      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30) // Últimos 30 dias

      if (error) throw error
      setProgressData(data || [])
    } catch (err) {
      console.error('Erro ao carregar dados de progresso:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProductiveTime = async (hours: number) => {
    try {
      const userId = getUserId()
      const today = new Date().toISOString().split('T')[0]

      await supabase
        .from('progress_logs')
        .upsert({
          user_id: userId,
          date: today,
          productive_hours: hours
        })

      await supabase
        .from('users')
        .update({
          productive_time: hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      await loadProgressData()
    } catch (err) {
      console.error('Erro ao atualizar tempo produtivo:', err)
    }
  }

  useEffect(() => {
    loadProgressData()
  }, [])

  return {
    progressData,
    loading,
    updateProductiveTime,
    refreshProgressData: loadProgressData
  }
}