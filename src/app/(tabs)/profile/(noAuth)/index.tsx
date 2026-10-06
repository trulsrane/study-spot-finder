import React from 'react';
import { View, Text, TextInput, TouchableOpacity} from 'react-native';
import signInWithEmail from '@/src/hooks/useAuth';
import signUpWithEmail from '@/src/hooks/useAuth';
import { supabase } from '@/src/utils/supabase';
import { router } from 'expo-router';

const Index = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignUp = async () => {
    console.log('Email:', email);
    console.log('Password:', password);
    await signUpWithEmail();
  };

  const handleLogin = async () => {
    await signInWithEmail();
    const { data: { user } } = await supabase.auth.getUser();
    router.push(user ? '/(tabs)/profile/(auth)' : '/(tabs)/profile/(noAuth)');
  }

  return (
      <View>
        <Text>Login Now</Text>
        <Text>Email:</Text>
        <TextInput
          placeholder="Enter your email"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
        <Text>Password:</Text>
        <TextInput
          onChangeText={setPassword}
          value={password}
          placeholder="Enter your password"
          secureTextEntry
        />

        <TouchableOpacity onPress={handleLogin}>
          <Text>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignUp}>
          <Text>Sign Up</Text>
        </TouchableOpacity>
      </View>
  );
};

export default Index;