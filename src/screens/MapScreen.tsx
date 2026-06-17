import { Platform } from 'react-native';

// O React Native/Expo seleciona automaticamente o arquivo baseado na extensão .web ou .native
// mas para garantir o suporte total do TypeScript e IDEs, esta estrutura é a mais recomendada.

let MapScreen: any;

if (Platform.OS === 'web') {
  MapScreen = require('./MapScreen.web').default;
} else {
  MapScreen = require('./MapScreen.native').default;
}

export default MapScreen;