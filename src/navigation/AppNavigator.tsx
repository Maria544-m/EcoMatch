// ============================================================
// AppNavigator.tsx - Sistema de Navegação EcoMatch
// ============================================================

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';


// 1. Importação da Tela de Animação
import SplashScreen from '../screens/SplashScreen';

// 2. Importação das suas Telas Originais
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

// Instâncias dos Navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================
// COMPONENTE DO MENU INFERIOR (Mantido Original)
// ============================================================
function BottomTabs() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.isAdmin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.log(error);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    loadUserRole();
  }, []);

  if (loading) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#397e3b',
        tabBarInactiveTintColor: '#A0A0A0',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 0,
          height: 60,
          borderTopWidth: 0,
          borderRadius: 5,
          backgroundColor: '#ffffff',
          elevation: 15,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
          marginBottom: 8,
        },
        tabBarIcon: ({ color }) => {
          let iconName: any;
          if (route.name === 'Início') iconName = 'home';
          else if (route.name === 'Acervo') iconName = 'leaf';
          else if (route.name === 'Mapa') iconName = 'location';
          else if (route.name === 'Ranking') iconName = 'gift';
          else if (route.name === 'Admin') iconName = 'shield-checkmark-outline';
          else if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Acervo" component={CollectionScreen} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Ranking" component={RewardsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
      {isAdmin && <Tab.Screen name="Admin" component={AdminScreen} />}
    </Tab.Navigator>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL DE NAVEGAÇÃO (Com Lógica de Splash)
// ============================================================
export default function AppNavigator() {
  // Estado para controlar se a Splash deve ser exibida
  const [showSplash, setShowSplash] = useState(true);

  // Lógica: Se showSplash for verdadeiro, mostra apenas a animação.
  // Quando a animação terminar, ela chama 'onFinish', que muda o estado para false.
  if (showSplash) {
    return (
      <SplashScreen onFinish={() => setShowSplash(false)} />
    );
  }

  // Após a Splash, carrega todo o sistema de navegação original
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Fluxo de Entrada */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Fluxo Principal (Abas) */}
        <Stack.Screen name="Home" component={BottomTabs} />
        
        {/* Telas Adicionais */}
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        
        {/* Telas de Administração (Com Header Visível) */}
        <Stack.Screen 
          name="AdminUsers" 
          component={AdminUsers} 
          options={{ headerShown: true, title: 'Usuários' }} 
        />
        <Stack.Screen 
          name="AdminMissions" 
          component={AdminMissions} 
          options={{ headerShown: true, title: 'Missões' }} 
        />
        <Stack.Screen 
          name="AdminEcoPoints" 
          component={AdminEcoPoints} 
          options={{ headerShown: true, title: 'EcoPontos' }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}