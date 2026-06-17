import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  
  useEffect(() => {
    // Timer de 4 segundos para garantir a visualização
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      {/* Container da Animação */}
      <View style={styles.animationContainer}>
        <LottieView
          source={{ uri: 'https://lottie.host/0df2deee-168b-4307-af03-0502397fc0dc/e9L5dbdyb4.lottie' }}
          autoPlay
          loop
          style={styles.lottieAnimation}
          // Propriedade importante para Web: garante que a animação não "vaze" do container
          resizeMode="contain" 
        />
      </View>
      
      {/* Texto EcoMatch com container próprio para garantir visibilidade */}
      <View style={styles.textContainer}>
        <Text style={styles.appName}>EcoMatch</Text>
      </View>
    </View>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Isso substitui o '100vh' e funciona em QUALQUER plataforma
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  animationContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 20,
    zIndex: 10, // Garante que o texto fique "por cima" de qualquer resíduo da animação
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    // Sombra leve para garantir destaque no Web
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;