import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import useAuth from '@/src/hooks/useAuth'

export default function Auth() {
  const { email, setEmail, password, setPassword, loading, signInWithEmail, signUpWithEmail } = useAuth()
  console.log('Auth component rendered with email:', email, 'and password:', password) // Log

  return (
    <View style={styles.container}>
      <TextInput placeholder="E-post" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Lösenord" value={password} onChangeText={setPassword}
        secureTextEntry autoCapitalize="none" style={styles.input} />
      <TouchableOpacity disabled={loading} onPress={signInWithEmail} style={styles.button}>
        <Text>Log in</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={loading} onPress={signUpWithEmail} style={styles.button}>
        <Text>Sign up</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  button: { padding: 12, alignItems: 'center', borderWidth: 1, borderRadius: 8 },
})