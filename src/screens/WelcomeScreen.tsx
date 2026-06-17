/**
 * ---------------------------------------------------------
 * Tela Inicial (WelcomeScreen)
 * ---------------------------------------------------------
 * Objetivo:
 * Apresentar o aplicativo EcoMatch ao usuário,
 * permitindo navegar para Login ou Cadastro.
 *
 * Funcionalidades:
 * - Exibe imagem principal do projeto
 * - Apresenta descrição do aplicativo
 * - Navega para tela de Login
 * - Navega para tela de Cadastro
 * - Exibe versão atual do aplicativo
 * ---------------------------------------------------------
 */

import React, { useEffect } from 'react';
import Constants from 'expo-constants';

import {
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';

import * as NavigationBar from 'expo-navigation-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Obtém a largura da tela para responsividade
const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {

  /**
   * Recupera automaticamente a versão
   * configurada no app.json/app.config.js
   */
  const appVersion =
    Constants.expoConfig?.version || '0.0.0';

  /**
   * Executado ao carregar a tela.
   * Configura a aparência da barra de navegação
   * do Android.
   */
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#F8FCF8');
    NavigationBar.setButtonStyleAsync('dark');
  }, []);

  /**
   * Exibe um alerta com a versão do aplicativo.
   */
  const showVersion = () => {
    Alert.alert(
      'EcoMatch',
      `Versão ${appVersion}`
    );
  };

  return (
    <View style={styles.screen}>
      {/* Configuração da barra de status */}
      <StatusBar
        backgroundColor="#F8FCF8"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Folhas decorativas */}
          <View style={styles.leafTopRight}>
            <MaterialCommunityIcons
              name="leaf"
              size={150}
              color="#E8F5E9"
              style={{
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>

          <View style={styles.leafBottomLeft}>
            <MaterialCommunityIcons
              name="leaf"
              size={200}
              color="#E8F5E9"
              style={{
                transform: [{ rotate: '-15deg' }],
              }}
            />
          </View>

          {/* Imagem principal */}
          <Image
            source={require('../../assets/reciclagem.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Área de textos */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Descarte Correto{'\n'}
              <Text style={styles.titleHighlight}>
                Planeta Saudável 🌿
              </Text>
            </Text>

            <Text style={styles.subtitle}>
              Encontre pontos de coleta próximos e
              aprenda a reciclar de forma divertida
              com quizzes e desafios.
            </Text>
          </View>

          {/* Botão Cadastro */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.buttonWrapper}
            onPress={() =>
              navigation.navigate('Register')
            }
          >
            <LinearGradient
              colors={['#43A047', '#2E7D32']}
              style={styles.primaryButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.buttonContent}>
                <View style={styles.buttonLeafCircle}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={18}
                    color="#FFF"
                  />
                </View>

                <Text style={styles.primaryButtonText}>
                  Cadastrar-se
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={28}
                  color="#FFFFFF"
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botão Login */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.secondaryButton}
            onPress={() =>
              navigation.navigate('Login')
            }
          >
            <View style={styles.buttonContent}>
              <Ionicons
                name="person-circle-outline"
                size={28}
                color="#2E7D32"
              />

              <Text style={styles.secondaryButtonText}>
                Login
              </Text>

              <Ionicons
                name="chevron-forward"
                size={28}
                color="#2E7D32"
              />
            </View>
          </TouchableOpacity>

          {/* Exibição da versão */}
          <TouchableOpacity
            style={styles.versionButton}
            onPress={showVersion}
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
      </SafeAreaView>
    </View>
  );
}

/**
 * ---------------------------------------------------------
 * ESTILOS DA TELA
 * ---------------------------------------------------------
 */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FCF8',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  leafTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    opacity: 0.5,
  },

  leafBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    opacity: 0.5,
  },

  heroImage: {
    width: Math.min(width * 0.7, 300),
    height: Math.min(width * 0.7, 300),
    marginTop: -80,
    marginBottom: -60,
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A3616',
    textAlign: 'center',
    lineHeight: 42,
  },

  titleHighlight: {
    color: '#1B5E20',
  },

  subtitle: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 15,
  },

  buttonWrapper: {
    width: '100%',
    marginBottom: 15,
  },

  primaryButton: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',

    elevation: 5,

    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  secondaryButton: {
    width: '100%',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderRadius: 35,
    justifyContent: 'center',

    elevation: 2,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  buttonLeafCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryButtonText: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  secondaryButtonText: {
    flex: 1,
    textAlign: 'center',
    color: '#2E7D32',
    fontSize: 22,
    fontWeight: 'bold',
  },

  versionButton: {
    marginTop: 20,
    paddingVertical: 10,
  },

  versionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  versionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});