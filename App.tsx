// ============================================================
// App.tsx
// Arquivo principal da aplicação EcoMatch
//
// Responsável por:
// - Inicializar o aplicativo
// - Carregar o sistema de navegação
// - Definir a primeira estrutura exibida ao usuário
// ============================================================

// -------------------------------------------------------
// Importa o componente AppNavigator
//
// O AppNavigator é responsável por controlar
// toda a navegação do aplicativo, permitindo
// a troca entre telas como:
//
// • WelcomeScreen
// • LoginScreen
// • RegisterScreen
// • HomeScreen
// • AdminScreen
// • Demais telas do sistema
// -------------------------------------------------------
import AppNavigator from './src/navigation/AppNavigator';

// -------------------------------------------------------
// Componente principal da aplicação
//
// Este é o ponto de entrada (entry point)
// do aplicativo React Native.
//
// Sua função é renderizar o AppNavigator,
// que ficará responsável por gerenciar
// todas as rotas e fluxos de navegação.
// -------------------------------------------------------
export default function App() {

  // -----------------------------------------------------
  // Renderiza o sistema principal de navegação
  // -----------------------------------------------------
  return <AppNavigator />;

}