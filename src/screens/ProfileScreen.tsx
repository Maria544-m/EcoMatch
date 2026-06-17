// ============================================================
// ProfileScreen.tsx
// Tela de perfil do usuário autenticado
// Exibe nome, e-mail, EcoScore, XP, nível, missões concluídas
// e oferece a opção de logout com redirecionamento para o Login
// ============================================================

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Função de logout do Firebase Auth
import { signOut } from 'firebase/auth';

// Instâncias de autenticação e banco de dados configuradas no projeto
import { auth, db } from '../services/firebaseConfig';

// Funções do Firestore para buscar o documento do usuário
import { doc, getDoc } from 'firebase/firestore';

// Hook de navegação do React Navigation
import { useNavigation } from '@react-navigation/native';

// -------------------------------------------------------
// Componente principal da tela de perfil
// -------------------------------------------------------
export default function ProfileScreen() {

  // Hook que fornece acesso ao objeto de navegação
  const navigation = useNavigation<any>();

  // Estados com os dados do perfil carregados do Firestore
  const [ecoScore, setEcoScore]       = useState(0);
  const [xp, setXp]                   = useState(0);
  const [missionsDone, setMissionsDone] = useState(0);

  // Dados do usuário autenticado disponíveis diretamente no Firebase Auth
  const user = auth.currentUser;

  // -------------------------------------------------------
  // Busca os dados do usuário no Firestore ao montar a tela
  // -------------------------------------------------------
  useEffect(() => {

    async function loadData() {

      const uid = auth.currentUser?.uid;

      // Interrompe se o usuário não estiver autenticado
      if (!uid) return;

      try {

        // Referência ao documento do usuário na coleção 'users'
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {

          const data = snapshot.data();

          // Atualiza os estados — ?? garante 0 como fallback seguro para números
          setEcoScore(data.ecoScore ?? 0);
          setXp(data.xp ?? 0);
          setMissionsDone(data.missionsDone ?? 0);
        }

      } catch (error) {

        console.log('Erro ao carregar perfil:', error);

      }
    }

    loadData();

  }, []); // Array vazio = executa apenas uma vez, na montagem

  // Nível calculado com base no XP: a cada 300 XP o usuário sobe um nível
  const level = Math.floor(xp / 300);

  // -------------------------------------------------------
  // Realiza o logout e redireciona para a tela de Login
  // -------------------------------------------------------
  async function handleLogout() {

    try {

      // Encerra a sessão do usuário no Firebase Auth
      await signOut(auth);

      // navigation.reset() limpa o histórico de navegação,
      // impedindo que o usuário volte para telas autenticadas
      // ao pressionar o botão de voltar
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

    } catch (error) {

      console.log('Erro ao fazer logout:', error);

    }
  }

  // -------------------------------------------------------
  // Renderização principal: header + cards de estatísticas + logout
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >

      {/* ── HEADER: avatar, nome e e-mail do usuário ── */}
      <View style={styles.header}>

        {/* Avatar em emoji — substituto visual enquanto não há foto de perfil */}
        <Text style={styles.avatar}>
          👤
        </Text>

        {/* Nome do usuário com fallback para 'Usuário' se não definido */}
        <Text style={styles.name}>
          {user?.displayName || 'Usuário'}
        </Text>

        {/* E-mail da conta autenticada */}
        <Text style={styles.email}>
          {user?.email}
        </Text>

      </View>

      {/* ── CARDS DE ESTATÍSTICAS ── */}

      {/* Card do EcoScore — pontuação ecológica principal */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌱 EcoScore</Text>
        <Text style={styles.bigNumber}>{ecoScore}</Text>
      </View>

      {/* Card de XP — pontos de experiência acumulados */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ XP Atual</Text>
        <Text style={styles.bigNumber}>{xp}</Text>
      </View>

      {/* Card de nível — calculado a partir do XP (300 XP por nível) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Nível</Text>
        <Text style={styles.bigNumber}>{level}</Text>
        <Text style={styles.subtitle}>Eco Guardião</Text>
      </View>

      {/* Card de missões concluídas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>♻️ Missões Concluídas</Text>
        <Text style={styles.bigNumber}>{missionsDone}</Text>
      </View>

      {/*
        Botão de logout em vermelho — cor convencionalmente usada
        para ações destrutivas ou de saída
      */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Sair da Conta
        </Text>
      </TouchableOpacity>

    </ScrollView>

  );
}

// ============================================================
// Estilos do componente utilizando StyleSheet do React Native
// ============================================================
const styles = StyleSheet.create({

  // Container principal com scroll vertical
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    padding: 20,
  },

  // Header centralizado com avatar, nome e e-mail
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },

  // Avatar emoji de grande dimensão
  avatar: {
    fontSize: 70,
  },

  // Nome do usuário em verde e negrito
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },

  // E-mail em cinza abaixo do nome
  email: {
    color: '#757575',
    marginTop: 5,
    fontSize: 15,
  },

  // Card branco com sombra para cada estatística
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Sombra para Android
    elevation: 3,
  },

  // Título do card com ícone e nome da estatística
  cardTitle: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Valor numérico em destaque dentro do card
  bigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
  },

  // Texto secundário abaixo do número (ex: "Eco Guardião")
  subtitle: {
    color: '#757575',
    marginTop: 5,
  },

  // Botão de logout em vermelho — ação de saída da conta
  logoutButton: {
    backgroundColor: '#d32f2f',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 40,
  },

  // Texto centralizado e em branco dentro do botão de logout
  logoutText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

});