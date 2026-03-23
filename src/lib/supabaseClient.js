import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export async function getCurrentAuthUser() {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw error
  }

  return data.user ?? null
}

export async function signUpWithEmail(email, password) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signInWithEmail(email, password) {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOutAuth() {
  if (!supabase) {
    return
  }

  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function getNextAttemptNumber(sessionId) {
  if (!supabase) {
    return 1
  }

  const { data, error } = await supabase
    .from('quiz_results')
    .select('attempt_number')
    .eq('session_id', sessionId)
    .order('attempt_number', { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) {
    return 1
  }

  return Number(data[0].attempt_number) + 1
}

export async function insertQuizResult(payload) {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('quiz_results')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function getPreviousAttempt(sessionId, currentAttemptNumber) {
  if (!supabase || currentAttemptNumber <= 1) {
    return null
  }

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('session_id', sessionId)
    .eq('attempt_number', currentAttemptNumber - 1)
    .limit(1)

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}

export async function getAllResults() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .order('taken_at', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getResultsBySessionId(sessionId) {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('attempt_number', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}