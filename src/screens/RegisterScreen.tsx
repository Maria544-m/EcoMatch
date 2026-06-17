// ============================================================
// RegisterScreen.tsx
// Tela de cadastro de novos usuários no aplicativo EcoMatch
// Cria a conta no Firebase Auth, atualiza o displayName e
// salva o perfil completo do usuário na coleção 'users' do Firestore
// ============================================================

import React, { useState } from 'react';

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

// Ícones vetoriais de pacotes Expo
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Gradiente linear para o botão de cadastro
import { LinearGradient } from 'expo-linear-gradient';

// Funções de autenticação do Firebase
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

// Função do Firestore para criar o documento do usuário
import { doc, setDoc } from 'firebase/firestore';

// Instâncias de autenticação e banco de dados configuradas no projeto
import { auth, db } from '../services/firebaseConfig';

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface RegisterScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Componente principal da tela de cadastro
// -------------------------------------------------------
export default function RegisterScreen({ navigation }: RegisterScreenProps) {

  // Estados do formulário de cadastro
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [cpf,             setCpf]             = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de visibilidade dos campos de senha
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de feedback visual para o usuário
  const [message,      setMessage]      = useState('');
  const [messageColor, setMessageColor] = useState('#d32f2f'); // Vermelho por padrão
  const [loading,      setLoading]      = useState(false);

  // -------------------------------------------------------
  // Valida o CPF usando o algoritmo oficial de dígitos verificadores
  // Retorna true se válido, false caso contrário
  // -------------------------------------------------------
  function validateCPF(cpf: string): boolean {

    // Remove qualquer caractere não numérico
    cpf = cpf.replace(/\D/g, '');

    // CPF deve ter exatamente 11 dígitos
    if (cpf.length !== 11) return false;

    // Rejeita sequências repetidas como 111.111.111-11
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 1; i <= 9; i++) {
      sum += Number(cpf.substring(i - 1, i)) * (11 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== Number(cpf.substring(9, 10))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += Number(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;

    return remainder === Number(cpf.substring(10, 11));
  }

  // -------------------------------------------------------
  // Valida o número de celular — deve ter 11 dígitos (com DDD)
  // -------------------------------------------------------
  function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
  }

  // -------------------------------------------------------
  // Processa o cadastro: valida os campos e cria a conta
  // -------------------------------------------------------
  async function handleRegister() {

    // Limpa mensagem anterior antes de nova tentativa
    setMessage('');

    // ── Validações sequenciais do formulário ──

    // Todos os campos são obrigatórios
    if (!name || !email || !cpf || !phone || !password || !confirmPassword) {
      setMessageColor('#d32f2f');
      setMessage('Preencha todos os campos');
      return;
    }

    // Nome completo deve ter entre 10 e 60 caracteres
    if (name.length < 10 || name.length > 60) {
      setMessageColor('#d32f2f');
      setMessage('Nome deve ter entre 10 e 60 caracteres');
      return;
    }

    // Valida formato básico de e-mail com expressão regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessageColor('#d32f2f');
      setMessage('Email inválido');
      return;
    }

    // Valida CPF usando o algoritmo de dígitos verificadores
    if (!validateCPF(cpf)) {
      setMessageColor('#d32f2f');
      setMessage('CPF inválido');
      return;
    }

    // Valida celular: deve ter 11 dígitos com DDD
    if (!validatePhone(phone)) {
      setMessageColor('#d32f2f');
      setMessage('Celular inválido');
      return;
    }

    // Senha deve ter no mínimo 6 caracteres (requisito do Firebase Auth)
    if (password.length < 6) {
      setMessageColor('#d32f2f');
      setMessage('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    // Confirmação de senha deve ser idêntica à senha
    if (password !== confirmPassword) {
      setMessageColor('#d32f2f');
      setMessage('As senhas não coincidem');
      return;
    }

    try {

      setLoading(true);

      // 1. Cria a conta no Firebase Auth com e-mail e senha
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Atualiza o displayName do usuário no Firebase Auth
      //    Isso permite exibir o nome em outras telas via auth.currentUser
      await updateProfile(userCredential.user, { displayName: name });

      // 3. Cria o documento do usuário no Firestore com todos os campos
      //    O ID do documento é o UID gerado pelo Firebase Auth
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        cpf,
        phone,

        // Campos de gamificação inicializados com zero
        ecoScore:     0,
        xp:           0,
        missionsDone: 0,
        treesHelped:  0,
        waterSaved:   0,
        co2Avoided:   0,

        // Perfil padrão — diferente de 'admin' para controle de acesso
        role:      'user',

        // Data de criação para auditoria e ordenação
        createdAt: new Date(),
      });

      // Exibe mensagem de sucesso em verde
      setMessageColor('#2E7D32');
      setMessage('Conta criada com sucesso!');

      // Aguarda 1,5s para o usuário ver a mensagem antes de navegar
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);

    } catch (error: any) {

      console.log('Erro ao criar conta:', error);
      setMessageColor('#d32f2f');

      // Trata os códigos de erro específicos do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Este email já está cadastrado');
      } else {
        setMessage('Erro ao criar conta');
      }

    } finally {

      // Desativa o loading independente de sucesso ou erro
      setLoading(false);

    }
  }

  // -------------------------------------------------------
  // Renderização principal da tela de cadastro
  // -------------------------------------------------------
  return (

    // SafeAreaView garante que o conteúdo respeite as áreas seguras do dispositivo
    <SafeAreaView style={styles.safeArea}>

      {/*
        KeyboardAvoidingView ajusta o layout quando o teclado aparece —
        comportamento diferente entre iOS ('padding') e Android ('height')
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Botão de voltar para a tela de boas-vindas */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Ionicons name="arrow-back" size={20} color="#2E7D32" />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          {/* Folhas decorativas posicionadas absolutamente nos cantos */}
          <View style={styles.leafTopRight}>
            <MaterialCommunityIcons
              name="leaf"
              size={150}
              color="#E8F5E9"
              style={{ transform: [{ rotate: '45deg' }] }}
            />
          </View>

          <View style={styles.leafBottomLeft}>
            <MaterialCommunityIcons
              name="leaf"
              size={200}
              color="#E8F5E9"
              style={{ transform: [{ rotate: '-15deg' }] }}
            />
          </View>

          {/* Logo do app com ícone e nome */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconBg}>
              <MaterialCommunityIcons
                name="leaf"
                size={28}
                color="#2E7D32"
              />
            </View>
            <Text style={styles.logoText}>EcoMatch</Text>
          </View>

          {/* Cabeçalho com título e subtítulo da tela */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>
              Junte-se à nossa comunidade sustentável
            </Text>
          </View>

          {/* ── FORMULÁRIO DE CADASTRO ── */}
          <View style={styles.formContainer}>

            {/* Campo: Nome Completo */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nome Completo"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Campo: E-mail */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="E-mail"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
              />
            </View>

            {/* Campo: CPF — apenas números, máx. 11 dígitos */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="card-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="CPF (somente números)"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                value={cpf}
                keyboardType="numeric"
                maxLength={11}
                onChangeText={setCpf}
              />
            </View>

            {/* Campo: Celular — com DDD, máx. 11 dígitos */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Celular com DDD"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                value={phone}
                keyboardType="phone-pad"
                maxLength={11}
                onChangeText={setPhone}
              />
            </View>

            {/* Campo: Senha com botão de visibilidade */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Senha"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            </View>

            {/* Campo: Confirmar Senha com botão de visibilidade */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#2E7D32"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirmar Senha"
                placeholderTextColor="#999"
                style={[
    styles.input,
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' } as any)
      : {},
  ]}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#2E7D32"
                />
              </TouchableOpacity>
            </View>

            {/* Mensagem de feedback — só exibida quando não estiver vazia */}
            {message ? (
              <Text style={[styles.message, { color: messageColor }]}>
                {message}
              </Text>
            ) : null}

            {/* Botão de cadastro com gradiente verde e spinner durante loading */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={loading} // Desabilita o botão enquanto processa
            >
              <LinearGradient
                colors={['#43A047', '#2E7D32']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  // Spinner exibido enquanto o cadastro está em andamento
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonContent}>
                    <View style={styles.buttonLeafCircle}>
                      <MaterialCommunityIcons
                        name="leaf"
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Link para a tela de login para usuários já cadastrados */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginContainer}
          >
            <Text style={styles.loginTextPrefix}>
              Já tem uma conta?{' '}
            </Text>
            <Text style={styles.loginTextAction}>
              Faça Login
            </Text>
          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}

// ============================================================
// Estilos do componente utilizando StyleSheet do React Native
// ============================================================
const styles = StyleSheet.create({

  // Área segura que respeita notch e barras do sistema
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FCF8',
  },

  // Container do KeyboardAvoidingView
  container: {
    flex: 1,
  },

  // Conteúdo interno do ScrollView centralizado horizontalmente
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  // Botão de voltar no topo do formulário
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },

  // Texto do botão de voltar
  backText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },

  // Folha decorativa no canto superior direito (posição absoluta)
  leafTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    opacity: 0.5,
  },

  // Folha decorativa no canto inferior esquerdo (posição absoluta)
  leafBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    opacity: 0.5,
  },

  // Container do logo com ícone e texto lado a lado
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },

  // Fundo circular branco ao redor do ícone do logo
  logoIconBg: {
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 50,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Nome do app em verde escuro e negrito
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A5D2A',
  },

  // Container do cabeçalho centralizado
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },

  // Título principal da tela
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0A3616',
    marginBottom: 8,
  },

  // Subtítulo descritivo
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Container que agrupa todos os campos do formulário
  formContainer: {
    width: '100%',
  },

  // Wrapper de cada campo de input com ícone e borda suave
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 60,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // Ícone à esquerda do campo de input
  inputIcon: {
    marginRight: 10,
  },

  // Campo de texto expansível dentro do wrapper
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  // Botão do ícone de olho para mostrar/ocultar senha
  eyeIcon: {
    padding: 5,
  },

  // Mensagem de erro ou sucesso abaixo do formulário
  message: {
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },

  // Botão de cadastro com gradiente e sombra verde
  button: {
    borderRadius: 25,
    height: 65,
    justifyContent: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  // Layout interno do botão: ícone + texto + seta
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Círculo semi-transparente ao redor do ícone de folha no botão
  buttonLeafCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Texto centralizado dentro do botão
  buttonText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Link de login com dois textos lado a lado
  loginContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingBottom: 20,
  },

  loginTextPrefix: {
    color: '#666',
    fontSize: 16,
  },

  // "Faça Login" sublinhado em verde escuro
  loginTextAction: {
    color: '#1A5D2A',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

});