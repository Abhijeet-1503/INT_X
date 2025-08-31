import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://bywjdldrqfcxwsuwobxt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5d2pkbGRycWZjeHdzdXdvYnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyODIwODcsImV4cCI6MjA3MTg1ODA4N30.JVHd6usxumygoj4FVPgtvD-1iEA9R9n_YO-lRXVWarE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface ProctorSession {
  id: string
  user_id: string
  level: number
  start_time: string
  end_time?: string
  status: 'active' | 'completed' | 'terminated'
  suspicion_score: number
  violations: number
  metadata?: any
}

export interface Violation {
  id: string
  session_id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  screenshot_url?: string
  metadata?: any
}

export interface UserProfile {
  id: string
  email: string
  role: 'student' | 'proctor' | 'admin'
  display_name: string
  created_at: string
  last_login?: string
}

// Supabase service functions
export const supabaseService = {
  // Session management
  createSession: async (session: Partial<ProctorSession>) => {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .insert([session])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateSession: async (id: string, updates: Partial<ProctorSession>) => {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getActiveSessions: async () => {
    const { data, error } = await supabase
      .from('proctor_sessions')
      .select(`
        *,
        user_profiles (
          email,
          display_name,
          role
        )
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Violation management
  createViolation: async (violation: Partial<Violation>) => {
    const { data, error } = await supabase
      .from('violations')
      .insert([violation])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getSessionViolations: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data
  },

  // User management
  createUserProfile: async (profile: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  getUserProfile: async (id: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  updateUserProfile: async (id: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToActiveSessions: (callback: (sessions: ProctorSession[]) => void) => {
    return supabase
      .channel('active-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proctor_sessions',
          filter: 'status=eq.active'
        },
        () => {
          // Refetch active sessions when changes occur
          supabaseService.getActiveSessions().then(callback)
        }
      )
      .subscribe()
  },

  subscribeToViolations: (sessionId: string, callback: (violations: Violation[]) => void) => {
    return supabase
      .channel(`violations-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'violations',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          // Refetch violations when new ones are added
          supabaseService.getSessionViolations(sessionId).then(callback)
        }
      )
      .subscribe()
  },

  // Storage for screenshots/recordings
  uploadScreenshot: async (file: File, sessionId: string, violationId: string) => {
    const fileName = `screenshots/${sessionId}/${violationId}-${Date.now()}.jpg`
    
    const { data, error } = await supabase.storage
      .from('proctoring-data')
      .upload(fileName, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('proctoring-data')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
  },

  // Analytics and reporting
  getSessionStats: async (userId?: string, dateRange?: { start: string; end: string }) => {
    let query = supabase
      .from('proctor_sessions')
      .select(`
        *,
        violations (count)
      `)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (dateRange) {
      query = query
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end)
    }
    
    const { data, error } = await query.order('start_time', { ascending: false })
    
    if (error) throw error
    return data
  }
}

export default supabase

