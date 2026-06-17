// ============================================================
// AppNavigator.tsx
// Sistema principal de navegação do aplicativo EcoMatch
//
// Responsável por:
// - Controlar todas as rotas do sistema
// - Gerenciar a navegação entre telas
// - Exibir o menu inferior (Bottom Tabs)
// - Controlar acesso de administradores
// ============================================================

import React, { useEffect, useState } from 'react';

// -------------------------------------------------------
// Biblioteca principal de navegação do React Navigation
// -------------------------------------------------------
import { NavigationContainer } from '@react-navigation/native';

// -------------------------------------------------------
// Serviços do Firebase utilizados para verificar
// permissões e informações do usuário autenticado
// -------------------------------------------------------
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// -------------------------------------------------------
// Navegação em pilha (Stack Navigation)
// Utilizada para transição entre telas
// -------------------------------------------------------
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// -------------------------------------------------------
// Navegação inferior por abas (Bottom Tabs)
// -------------------------------------------------------
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// -------------------------------------------------------
// Biblioteca de ícones utilizada nas abas
// -------------------------------------------------------
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// IMPORTAÇÃO DAS TELAS PRINCIPAIS
// ============================================================

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import HomeScreen from '../screens/HomeScreen';
import CollectionScreen from '../screens/CollectionScreen';
import MapScreen from '../screens/MapScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import QuizScreen from '../screens/QuizScreen';
import GameScreen from '../screens/GameScreen';

import AdminScreen from '../screens/AdminScreen';

import AdminUsers from '../screens/admin/AdminUsers';
import AdminMissions from '../screens/admin/AdminMissions';
import AdminEcoPoints from '../screens/admin/AdminEcoPoints';

// -------------------------------------------------------
// Instância da navegação Stack
// -------------------------------------------------------
const Stack = createNativeStackNavigator();

// -------------------------------------------------------
// Instância da navegação por abas
// -------------------------------------------------------
const Tab = createBottomTabNavigator();

// ============================================================
// COMPONENTE RESPONSÁVEL PELO MENU INFERIOR
// ============================================================
function BottomTabs() {

  // -------------------------------------------------------
  // Controla se o usuário possui permissão
  // de administrador
  // -------------------------------------------------------
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------------------------------------
  // Controla o carregamento das informações
  // do usuário
  // -------------------------------------------------------
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------
  // Executado quando o componente é carregado
  //
  // Busca o documento do usuário no Firestore
  // para verificar se ele possui permissão
  // administrativa
  // -------------------------------------------------------
  useEffect(() => {

    const loadUserRole = async () => {

      const user = auth.currentUser;

      // ---------------------------------------------------
      // Caso não exista usuário autenticado
      // ---------------------------------------------------
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {

        // -------------------------------------------------
        // Busca os dados do usuário na coleção users
        // -------------------------------------------------
        const userDoc = await getDoc(
          doc(db, 'users', user.uid)
        );

        if (userDoc.exists()) {

          const data = userDoc.data();

          // -----------------------------------------------
          // Verifica se o usuário possui a propriedade
          // isAdmin configurada como true
          // -----------------------------------------------
          setIsAdmin(data.isAdmin === true);

        } else {

          setIsAdmin(false);

        }

      } catch (error) {

        // -----------------------------------------------
        // Em caso de erro assume usuário comum
        // -----------------------------------------------
        console.log(error);
        setIsAdmin(false);

      }

      setLoading(false);

    };

    loadUserRole();

  }, []);

  // -------------------------------------------------------
  // Enquanto as permissões estão sendo carregadas
  // nenhuma interface é exibida
  // -------------------------------------------------------
  if (loading) return null;

  // =======================================================
  // MENU INFERIOR DO APLICATIVO
  // =======================================================
  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({

        // Oculta o cabeçalho padrão
        headerShown: false,

        // Cor do item selecionado
        tabBarActiveTintColor: '#4CAF50',

        // Cor dos itens não selecionados
        tabBarInactiveTintColor: '#A0A0A0',

        // Oculta menu quando teclado aparece
        tabBarHideOnKeyboard: true,

        // -------------------------------------------------
        // Personalização visual da barra inferior
        // -------------------------------------------------
        tabBarStyle: {

          position: 'absolute',

          left: 10,
          right: 10,
          bottom: 18,

          height: 80,

          borderRadius: 25,

          backgroundColor: '#1B1B1B',

          borderTopWidth: 0,

          elevation: 15,
        },

        // Estilo dos textos das abas
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 8,
        },

        // -------------------------------------------------
        // Define o ícone de cada aba
        // -------------------------------------------------
        tabBarIcon: ({ color }) => {

          let iconName: any;

          if (route.name === 'Início') {
            iconName = 'home';
          } else if (route.name === 'Acervo') {
            iconName = 'leaf';
          } else if (route.name === 'Mapa') {
            iconName = 'location';
          } else if (route.name === 'Recompensas') {
            iconName = 'gift';
          } else if (route.name === 'Admin') {
            iconName = 'shield-checkmark-outline';
          } else if (route.name === 'Perfil') {
            iconName = 'person';
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
            />
          );
        },

      })}
    >

      {/* Tela inicial do sistema */}
      <Tab.Screen
        name="Início"
        component={HomeScreen}
      />

      {/* Tela de acervo sustentável */}
      <Tab.Screen
        name="Acervo"
        component={CollectionScreen}
      />

      {/* Tela do mapa de EcoPontos */}
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
      />

      {/* Tela de recompensas */}
      <Tab.Screen
        name="Recompensas"
        component={RewardsScreen}
      />

      {/* Perfil do usuário */}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
      />

      {/* Exibida somente para administradores */}
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
        />
      )}

    </Tab.Navigator>

  );
}

// ============================================================
// COMPONENTE PRINCIPAL DE NAVEGAÇÃO
// ============================================================
export default function AppNavigator() {

  return (

    <NavigationContainer>

      {/* Navegação principal do aplicativo */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >

        {/* Tela de boas-vindas */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />

        {/* Tela de login */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        {/* Tela de cadastro */}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        {/* Área principal do aplicativo */}
        <Stack.Screen
          name="Home"
          component={BottomTabs}
        />

        {/* Tela de Quiz */}
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
        />

        {/* Tela do jogo educativo */}
        <Stack.Screen
          name="Game"
          component={GameScreen}
        />

        {/* Administração de usuários */}
        <Stack.Screen
          name="AdminUsers"
          component={AdminUsers}
          options={{
            headerShown: true,
            title: 'Usuários',
          }}
        />

        {/* Administração de missões */}
        <Stack.Screen
          name="AdminMissions"
          component={AdminMissions}
          options={{
            headerShown: true,
            title: 'Missões',
          }}
        />

        {/* Administração de EcoPontos */}
        <Stack.Screen
          name="AdminEcoPoints"
          component={AdminEcoPoints}
          options={{
            headerShown: true,
            title: 'EcoPontos',
          }}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );
}