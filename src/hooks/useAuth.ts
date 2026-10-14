import { useState } from 'react'
import { supabase } from '@/src/utils/supabase'

export default function useAuth() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // Visas på sidan under fälten i stället för som popup
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function signInWithEmail() {
    if (!email.trim() || !password) return setError('Enter your email and password')
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    if (!email.trim() || !password) return setError('Enter your email and password')
    if (!username.trim()) return setError('Choose a username')
    setError(null)
    setInfo(null)
    setLoading(true)
    // username sparas i användarens metadata, och en trigger i databasen skapar profilen utifrån den
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim() } },
    })
    if (error) setError(error.message)
    else if (!session) setInfo('Check your inbox to verify your email!')
    setLoading(false)
  }

  return {
    email, setEmail, username, setUsername, password, setPassword,
    loading, error, info, signInWithEmail, signUpWithEmail,
  }
}
