import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// Ícones e Gradiente
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Firebase
import { auth } from '../services/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const appVersion = Constants.expoConfig?.version || '0.0.0';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#d32f2f');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      setEmailError('E-mail inválido');
    } else {
      setEmailError('');
    }

    if (password.length > 0 && password.length < 6) {
      setPasswordError('Mínimo 6 caracteres');
    } else {
      setPasswordError('');
    }

    setIsFormValid(!!(email && password && !emailError && !passwordError));
  }, [email, password, emailError, passwordError]);

  const handleLogin = async () => {
    if (!isFormValid || loading) return;
    try {
      setLoading(true);
      setMessage('');
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (err: any) {
      setMessageColor('#d32f2f');
      setMessage('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || emailError) {
      setMessageColor('#d32f2f');
      setMessage('Digite um e-mail válido');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessageColor('#2E7D32');
      setMessage('E-mail de recuperação enviado!');
    } catch (err: any) {
      setMessageColor('#d32f2f');
      setMessage('Erro ao enviar recuperação');
    }
  };

  const inputStyle = [
    styles.input,
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
        <Ionicons name="arrow-back" size={20} color="#2E7D32" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.leafTopRight}>
            <MaterialCommunityIcons name="leaf" size={150} color="#E8F5E9" style={{ transform: [{ rotate: '45deg' }] }} />
          </View>
          <View style={styles.leafBottomLeft}>
            <MaterialCommunityIcons name="leaf" size={200} color="#E8F5E9" style={{ transform: [{ rotate: '-15deg' }] }} />
          </View>

          <View style={styles.logoContainer}>
            <View style={styles.logoIconBg}><MaterialCommunityIcons name="leaf" size={28} color="#2E7D32" /></View>
            <Text style={styles.logoText}>EcoMatch</Text>
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={[styles.inputWrapper, !!emailError && styles.inputError]}>
              <Ionicons name="mail-outline" size={22} color={emailError ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="E-mail" placeholderTextColor="#999" style={inputStyle} value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
            </View>
            {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

            <View style={[styles.inputWrapper, !!passwordError && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={22} color={passwordError ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="Senha" placeholderTextColor="#999" style={inputStyle} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#2E7D32" /></TouchableOpacity>
            </View>
            {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {!!message && <Text style={[styles.message, { color: messageColor }]}>{message}</Text>}

            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={loading || !isFormValid} style={{ opacity: isFormValid ? 1 : 0.6 }}>
              <LinearGradient colors={['#43A047', '#2E7D32']} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <View style={styles.buttonContent}>
                    <View style={styles.buttonLeafCircle}><MaterialCommunityIcons name="leaf" size={16} color="#FFF" /></View>
                    <Text style={styles.buttonText}>Entrar</Text>
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerContainer}>
            <Text style={styles.registerTextPrefix}>Não tem uma conta? <Text style={styles.registerTextAction}>Cadastre-se</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.versionButton} onPress={() => Alert.alert('EcoMatch', `Versão ${appVersion}`)}>
            <View style={styles.versionContent}>
              <Ionicons name="information-circle-outline" size={16} color="#999" />
              <Text style={styles.versionText}>Versão {appVersion}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FCF8' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 20, marginTop: 10 },
  backText: { marginLeft: 5, fontSize: 16, color: '#2E7D32', fontWeight: '600' },
  leafTopRight: { position: 'absolute', top: -40, right: -40, opacity: 0.5 },
  leafBottomLeft: { position: 'absolute', bottom: -60, left: -60, opacity: 0.5 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 5 },
  logoIconBg: { backgroundColor: '#FFF', padding: 6, borderRadius: 50, marginRight: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#1A5D2A' },
  headerContainer: { alignItems: 'center', marginBottom: 35 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#0A3616', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0', marginTop: 15, paddingHorizontal: 15, height: 60, elevation: 1 },
  inputError: { borderColor: '#d32f2f' },
  input: { flex: 1, fontSize: 16, color: '#333', marginLeft: 10 },
  errorText: { color: '#d32f2f', fontSize: 12, marginLeft: 15, marginTop: 5, fontWeight: '500' },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 },
  forgotPasswordText: { color: '#2E7D32', fontSize: 14, fontWeight: '600' },
  message: { textAlign: 'center', marginVertical: 10, fontWeight: '600' },
  button: { borderRadius: 25, height: 65, justifyContent: 'center', marginTop: 10, elevation: 4 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  buttonLeafCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  buttonText: { flex: 1, textAlign: 'center', color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', marginTop: 30 },
  registerTextPrefix: { color: '#666', fontSize: 16 },
  registerTextAction: { color: '#1A5D2A', fontWeight: 'bold', textDecorationLine: 'underline' },
  versionButton: { marginTop: 40, paddingBottom: 20 },
  versionContent: { flexDirection: 'row', alignItems: 'center' },
  versionText: { color: '#999', fontSize: 12, marginLeft: 5 },
});