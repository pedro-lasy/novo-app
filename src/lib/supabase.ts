import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          personal_goal: string
          financial_goal: string
          current_savings?: number
          target_savings?: number
          daily_discipline?: number
          productive_time?: number
          streak?: number
          level?: number
          badges?: string[]
          completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          personal_goal?: string
          financial_goal?: string
          current_savings?: number
          target_savings?: number
          daily_discipline?: number
          productive_time?: number
          streak?: number
          level?: number
          badges?: string[]
          completed_onboarding?: boolean
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          completed: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          completed?: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          completed?: boolean
          date?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          discipline_score: number
          productive_hours: number
          habits_completed: number
          total_habits: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          discipline_score: number
          productive_hours: number
          habits_completed: number
          total_habits: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          discipline_score?: number
          productive_hours?: number
          habits_completed?: number
          total_habits?: number
        }
      }
      mindset_notes: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
        }
      }
    }
  }
}