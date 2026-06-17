// ============================================================
// LoginScreen.tsx
// Tela de login do aplicativo EcoMatch
// Permite autenticação por e-mail/senha via Firebase Auth
// e recuperação de senha por e-mail
// ============================================================

import React, { useState } from 'react';
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

// Ícones vetoriais de pacotes Expo
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Gradiente linear para o botão de login
import { LinearGradient } from 'expo-linear-gradient';

// Funções de autenticação do Firebase
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

// Instância de autenticação configurada no projeto
import { auth } from '../services/firebaseConfig';

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface LoginScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Componente principal da tela de login
// -------------------------------------------------------
export default function LoginScreen({ navigation }: LoginScreenProps) {

  // Lê a versão do app definida no app.json via expo-constants
  const appVersion = Constants.expoConfig?.version || '0.0.0';

  // Estados do formulário de login
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);  // Alterna visibilidade da senha
  const [loading, setLoading]           = useState(false);  // Controla o spinner do botão

  // Estados de feedback visual para o usuário
  const [message, setMessage]           = useState('');
  const [messageColor, setMessageColor] = useState('#d32f2f'); // Vermelho para erros por padrão

  // -------------------------------------------------------
  // Realiza o login com e-mail e senha via Firebase Auth
  // -------------------------------------------------------
  const handleLogin = async () => {

    // Limpa mensagem anterior antes de nova tentativa
    setMessage('');

    // Validação básica: ambos os campos devem estar preenchidos
    if (!email || !password) {
      setMessageColor('#d32f2f');
      setMessage('Preencha todos os campos');
      return;
    }

    try {

      setLoading(true);

      // Autentica o usuário no Firebase com e-mail e senha
      await signInWithEmailAndPassword(auth, email, password);

      // Redireciona para a tela principal após login bem-sucedido
      navigation.navigate('Home');

    } catch (error: any) {

      console.log(error);
      setMessageColor('#d32f2f');
      setMessage('E-mail ou senha incorretos');

    } finally {

      // Desativa o loading independente de sucesso ou erro
      setLoading(false);

    }
  };

  // -------------------------------------------------------
  // Envia e-mail de recuperação de senha via Firebase Auth
  // -------------------------------------------------------
  const handleForgotPassword = async () => {

    // O campo de e-mail deve estar preenchido para recuperação
    if (!email) {
      setMessageColor('#d32f2f');
      setMessage('Digite seu e-mail para recuperar a senha');
      return;
    }

    try {

      await sendPasswordResetEmail(auth, email);

      // Mensagem de sucesso em verde
      setMessageColor('#2E7D32');
      setMessage('E-mail de recuperação enviado com sucesso!');

    } catch (error: any) {

      console.log(error);
      setMessageColor('#d32f2f');

      // Trata os códigos de erro específicos do Firebase Auth
      switch (error.code) {
        case 'auth/user-not-found':
          setMessage('Nenhuma conta encontrada com este e-mail');
          break;
        case 'auth/invalid-email':
          setMessage('E-mail inválido');
          break;
        default:
          setMessage('Erro ao enviar e-mail de recuperação');
      }
    }
  };

  // -------------------------------------------------------
  // Renderização principal da tela
  // -------------------------------------------------------
  return (

    // SafeAreaView garante que o conteúdo respeite as áreas seguras do dispositivo
    <SafeAreaView style={styles.safeArea}>

      {/* Botão de voltar para a tela de boas-vindas */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Welcome')}
      >
        <Ionicons name="arrow-back" size={20} color="#2E7D32" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/*
        KeyboardAvoidingView ajusta o layout quando o teclado
        aparece — comportamento diferente entre iOS e Android
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

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
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>
              Acesse sua conta para continuar
            </Text>
          </View>

          {/* ── FORMULÁRIO DE LOGIN ── */}
          <View style={styles.formContainer}>

            {/* Campo de e-mail com ícone à esquerda */}
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
                autoCapitalize="none"      // Não capitaliza automaticamente e-mails
                onChangeText={setEmail}
              />
            </View>

            {/* Campo de senha com ícone de olho para alternar visibilidade */}
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
                secureTextEntry={!showPassword} // Oculta texto quando showPassword=false
                value={password}
                onChangeText={setPassword}
              />

              {/* Botão para alternar visibilidade da senha */}
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

            {/* Link de recuperação de senha alinhado à direita */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>

            {/* Mensagem de feedback — só exibida quando não estiver vazia */}
            {message ? (
              <Text style={[styles.message, { color: messageColor }]}>
                {message}
              </Text>
            ) : null}

            {/* Botão de login com gradiente verde e spinner durante carregamento */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={loading} // Desabilita o botão enquanto carrega
            >
              <LinearGradient
                colors={['#43A047', '#2E7D32']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  // Spinner exibido enquanto a autenticação está em andamento
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
                    <Text style={styles.buttonText}>Entrar</Text>
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Link para a tela de cadastro */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerContainer}
          >
            <Text style={styles.registerTextPrefix}>
              Não tem uma conta?{' '}
            </Text>
            <Text style={styles.registerTextAction}>
              Cadastre-se
            </Text>
          </TouchableOpacity>

          {/* Botão de versão — exibe um Alert com a versão atual do app */}
          <TouchableOpacity
            style={styles.versionButton}
            onPress={() =>
              Alert.alert('EcoMatch', `Versão ${appVersion}`)
            }
          >
            <View style={styles.versionContent}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#999"
              />
              <Text style={styles.versionText}>
                Versão {appVersion}
              </Text>
            </View>
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
    marginBottom: 20,
    marginTop: 5,
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

  // Container que agrupa os campos do formulário
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

  // Link "Esqueceu a senha?" alinhado à direita
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },

  forgotPasswordText: {
    color: '#1A5D2A',
    fontSize: 14,
    fontWeight: '600',
  },

  // Mensagem de erro ou sucesso abaixo do formulário
  message: {
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },

  // Botão de login com gradiente e sombra verde
  button: {
    borderRadius: 25,
    height: 65,
    justifyContent: 'center',
    marginTop: 10,
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

  // Link de cadastro com dois textos lado a lado
  registerContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingBottom: 20,
  },

  registerTextPrefix: {
    color: '#666',
    fontSize: 16,
  },

  // "Cadastre-se" sublinhado em verde escuro
  registerTextAction: {
    color: '#1A5D2A',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  // Botão da versão no rodapé da tela
  versionButton: {
    marginTop: 10,
    paddingBottom: 20,
  },

  // Layout interno do botão de versão: ícone + texto
  versionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  versionText: {
    marginLeft: 5,
    fontSize: 13,
    color: '#999',
  },

  // Botão de voltar no topo da tela, fora do ScrollView
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 50,
    marginLeft: 25,
    marginBottom: 15,
  },

  backText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },

});