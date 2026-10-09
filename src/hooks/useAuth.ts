import { useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '@/src/utils/supabase'

export default function useAuth() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    if (!username.trim()) return Alert.alert('Choose a username')
    setLoading(true)
    // username sparas i användarens metadata, och en trigger i databasen skapar profilen utifrån den
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })
    if (error) Alert.alert(error.message)
    else if (!session) Alert.alert('Check your inbox to verify your email!')
    setLoading(false)
  }

  return { email, setEmail, username, setUsername, password, setPassword, loading, signInWithEmail, signUpWithEmail }
}