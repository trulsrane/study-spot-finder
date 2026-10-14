import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import useAuth from '@/src/hooks/useAuth';
import { AuthButton, AuthInput, authStyles } from '@/src/components/AuthForm';

// Samma stil som inloggningen, plus användarnamn. När kontot skapats byter profil-layouten till (auth) av sig själv.
export default function SignUpScreen() {
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { email, setEmail, username, setUsername, password, setPassword, loading, error, info, signUpWithEmail } =
    useAuth();

  return (
    <KeyboardAvoidingView style={authStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={authStyles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={authStyles.title}>Create account</Text>
        <Text style={authStyles.subtitle}>It only takes a minute</Text>

        <View style={authStyles.form}>
          <AuthInput
            icon="mail-outline"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => usernameRef.current?.focus()}
          />
          <AuthInput
            ref={usernameRef}
            icon="person-outline"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            textContentType="username"
            autoComplete="username"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <AuthInput
            ref={passwordRef}
            icon="lock-closed-outline"
            placeholder="Password"
            secure
            value={password}
            onChangeText={setPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={signUpWithEmail}
          />

          {error && <Text style={authStyles.error}>{error}</Text>}
          {info && <Text style={authStyles.info}>{info}</Text>}

          <AuthButton title="Sign up" loading={loading} onPress={signUpWithEmail} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
