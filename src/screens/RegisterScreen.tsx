import React, { useState, useEffect } from 'react';
import {
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
import { auth, db } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de erro individuais
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Visibilidade e Feedback
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [globalMessage, setGlobalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Validação de CPF
  const validateCPF = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
    let sum = 0;
    for (let i = 1; i <= 9; i++) sum += Number(cleaned.substring(i - 1, i)) * (11 - i);
    let res = (sum * 10) % 11;
    if (res === 10 || res === 11) res = 0;
    if (res !== Number(cleaned.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += Number(cleaned.substring(i - 1, i)) * (12 - i);
    res = (sum * 10) % 11;
    if (res === 10 || res === 11) res = 0;
    return res === Number(cleaned.substring(10, 11));
  };

  // Efeito de Validação em Tempo Real
  useEffect(() => {
    const newErrors = { name: '', email: '', cpf: '', phone: '', password: '', confirmPassword: '' };

    if (name.length > 0 && (name.length < 10 || name.length > 60)) newErrors.name = 'Nome deve ter entre 10 e 60 caracteres';
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'E-mail inválido';
    if (cpf.length > 0 && !validateCPF(cpf)) newErrors.cpf = 'CPF inválido';
    if (phone.length > 0 && phone.replace(/\D/g, '').length !== 11) newErrors.phone = 'Celular deve ter 11 dígitos';
    if (password.length > 0 && password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (confirmPassword.length > 0 && confirmPassword !== password) newErrors.confirmPassword = 'As senhas não coincidem';

    setErrors(newErrors);
    const allFilled = !!(name && email && cpf && phone && password && confirmPassword);
    const noErrors = Object.values(newErrors).every(err => err === '');
    setIsFormValid(allFilled && noErrors);
  }, [name, email, cpf, phone, password, confirmPassword]);

  const handleRegister = async () => {
    if (!isFormValid || loading) return;
    try {
      setLoading(true);
      setGlobalMessage('');
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name, email, cpf, phone,
        ecoScore: 0, xp: 0, role: 'user', createdAt: new Date(),
      });
      setGlobalMessage('Conta criada com sucesso!');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err: any) {
      setGlobalMessage(err.code === 'auth/email-already-in-use' ? 'E-mail já cadastrado' : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
            <Ionicons name="arrow-back" size={20} color="#2E7D32" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

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
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>Junte-se à nossa comunidade sustentável</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Nome */}
            <View style={[styles.inputWrapper, !!errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={22} color={errors.name ? "#d32f2f" : "#2E7D32"} />
              <TextInput 
                placeholder="Nome Completo" 
                placeholderTextColor="#999" 
                style={inputStyle} 
                value={name} 
                onChangeText={t => setName(t.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} 
              />
            </View>
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email */}
            <View style={[styles.inputWrapper, !!errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={22} color={errors.email ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="E-mail" placeholderTextColor="#999" style={inputStyle} value={email} keyboardType="email-address" autoCapitalize="none" onChangeText={setEmail} />
            </View>
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* CPF */}
            <View style={[styles.inputWrapper, !!errors.cpf && styles.inputError]}>
              <Ionicons name="card-outline" size={22} color={errors.cpf ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="CPF (somente números)" placeholderTextColor="#999" style={inputStyle} value={cpf} keyboardType="numeric" maxLength={11} onChangeText={t => setCpf(t.replace(/\D/g, ''))} />
            </View>
            {!!errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

            {/* Celular */}
            <View style={[styles.inputWrapper, !!errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={22} color={errors.phone ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="Celular com DDD" placeholderTextColor="#999" style={inputStyle} value={phone} keyboardType="phone-pad" maxLength={11} onChangeText={t => setPhone(t.replace(/\D/g, ''))} />
            </View>
            {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            {/* Senha */}
            <View style={[styles.inputWrapper, !!errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={22} color={errors.password ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="Senha" placeholderTextColor="#999" style={inputStyle} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#2E7D32" /></TouchableOpacity>
            </View>
            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Confirmar Senha */}
            <View style={[styles.inputWrapper, !!errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={22} color={errors.confirmPassword ? "#d32f2f" : "#2E7D32"} />
              <TextInput placeholder="Confirmar Senha" placeholderTextColor="#999" style={inputStyle} secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#2E7D32" /></TouchableOpacity>
            </View>
            {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {!!globalMessage && <Text style={[styles.globalMessage, { color: globalMessage.includes('sucesso') ? '#2E7D32' : '#d32f2f' }]}>{globalMessage}</Text>}

            <TouchableOpacity activeOpacity={0.8} onPress={handleRegister} disabled={!isFormValid || loading} style={{ opacity: isFormValid ? 1 : 0.6 }}>
              <LinearGradient colors={['#43A047', '#2E7D32']} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <View style={styles.buttonContent}>
                    <View style={styles.buttonLeafCircle}><MaterialCommunityIcons name="leaf" size={16} color="#FFF" /></View>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginContainer}>
            <Text style={styles.loginTextPrefix}>Já tem uma conta? <Text style={styles.loginTextAction}>Faça Login</Text></Text>
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
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 15 },
  backText: { marginLeft: 5, fontSize: 16, color: '#2E7D32', fontWeight: '600' },
  leafTopRight: { position: 'absolute', top: -40, right: -40, opacity: 0.5 },
  leafBottomLeft: { position: 'absolute', bottom: -60, left: -60, opacity: 0.5 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 20 },
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
  globalMessage: { textAlign: 'center', marginVertical: 10, fontWeight: '600' },
  button: { borderRadius: 25, height: 65, justifyContent: 'center', marginTop: 25, elevation: 4 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  buttonLeafCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  buttonText: { flex: 1, textAlign: 'center', color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', marginTop: 30, paddingBottom: 20 },
  loginTextPrefix: { color: '#666', fontSize: 16 },
  loginTextAction: { color: '#1A5D2A', fontWeight: 'bold', textDecorationLine: 'underline' },
});