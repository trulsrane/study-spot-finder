import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import useAuth from '@/src/hooks/useAuth'

// Samma formulär som inloggningen, plus användarnamn. När kontot skapats byter profil-layouten till (auth) av sig själv.
export default function SignUpScreen() {
  const { email, setEmail, username, setUsername, password, setPassword, loading, signUpWithEmail } = useAuth()
  return (
    <View style={styles.container}>
      <Text>E-mail</Text>
      <TextInput placeholder="E-post" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <Text>Username</Text>
      <TextInput placeholder="Användarnamn" value={username} onChangeText={setUsername}
        autoCapitalize="none" style={styles.input} />
      <Text>Password</Text>
      <TextInput placeholder="Lösenord" value={password} onChangeText={setPassword}
        secureTextEntry autoCapitalize="none" style={styles.input} />
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
