import { useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '@/src/utils/supabase'

export default function useAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { data: { session }, error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert(error.message)
    else if (!session) Alert.alert('Kolla din inkorg för att verifiera e-posten!')
    setLoading(false)
  }

  return { email, setEmail, password, setPassword, loading, signInWithEmail, signUpWithEmail }
}