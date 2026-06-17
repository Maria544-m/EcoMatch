// ============================================================
// AdminScreen.tsx
// Painel administrativo principal do aplicativo
// Exibe contadores de usuários, missões e EcoPontos
// e oferece navegação para as telas de gerenciamento
// ============================================================

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

// Instância do Firestore configurada no projeto
import { db } from '../services/firebaseConfig';

// Componente reutilizável de botão customizado
import CustomButton from '../components/CustomButton';

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface AdminScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Componente principal da tela administrativa
// -------------------------------------------------------
export default function AdminScreen({ navigation }: AdminScreenProps) {

  // Estados que armazenam as contagens de cada coleção do Firestore
  const [usersCount, setUsersCount] = useState(0);
  const [missionsCount, setMissionsCount] = useState(0);
  const [ecoPointsCount, setEcoPointsCount] = useState(0);

  // Estado que controla a exibição do indicador de carregamento
  const [loading, setLoading] = useState(true);

  // useEffect dispara loadData() assim que o componente é montado
  useEffect(() => {
    loadData();
  }, []); // Array vazio = executa apenas uma vez, na montagem

  // -------------------------------------------------------
  // Busca em paralelo os dados das três coleções do Firestore
  // -------------------------------------------------------
  async function loadData() {

    try {

      // Executa as três consultas simultaneamente para melhor performance
      const [usersSnapshot, missionsSnapshot, ecoPointsSnapshot] =
        await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'missions')),
          getDocs(collection(db, 'ecopoints')),
        ]);

      // Atualiza os estados com o total de documentos de cada coleção
      setUsersCount(usersSnapshot.size);
      setMissionsCount(missionsSnapshot.size);
      setEcoPointsCount(ecoPointsSnapshot.size);

    } catch (error) {

      // Exibe o erro no console caso alguma consulta falhe
      console.log('Erro ao carregar painel admin:', error);

    } finally {

      // Desativa o loading independente de sucesso ou erro
      setLoading(false);

    }
  }

  // -------------------------------------------------------
  // Tela de carregamento exibida enquanto os dados são buscados
  // -------------------------------------------------------
  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Carregando painel...
        </Text>

      </View>

    );
  }

  // -------------------------------------------------------
  // Renderização principal: cards de resumo + botões de navegação
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.title}>
        🛠️ Painel Administrativo
      </Text>

      <Text style={styles.subtitle}>
        Gerencie usuários, missões e EcoPontos.
      </Text>

      {/* Card com total de usuários cadastrados */}
      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          👥 Usuários
        </Text>

        <Text style={styles.number}>
          {usersCount}
        </Text>

      </View>

      {/* Card com total de EcoPontos cadastrados */}
      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          📍 EcoPontos
        </Text>

        <Text style={styles.number}>
          {ecoPointsCount}
        </Text>

      </View>

      {/* Card com total de missões cadastradas */}
      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          🎯 Missões
        </Text>

        <Text style={styles.number}>
          {missionsCount}
        </Text>

      </View>

      {/*
        Botões de navegação para as sub-telas administrativas.
        navigation.navigate() redireciona para a rota especificada.
      */}
      <CustomButton
        title="Gerenciar Missões"
        onPress={() => navigation.navigate('AdminMissions')}
      />

      <CustomButton
        title="Gerenciar EcoPontos"
        onPress={() => navigation.navigate('AdminEcoPoints')}
      />

      <CustomButton
        title="Ver Usuários"
        onPress={() => navigation.navigate('AdminUsers')}
      />

    </ScrollView>

  );
}

// ============================================================
// Estilos do componente utilizando StyleSheet do React Native
// ============================================================
const styles = StyleSheet.create({

  // Container exibido durante o carregamento dos dados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FFF6',
  },

  // Texto exibido abaixo do spinner de carregamento
  loadingText: {
    marginTop: 15,
    color: '#757575',
    fontSize: 16,
  },

  // Container principal com scroll vertical
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    paddingHorizontal: 20,
  },

  // Estilo interno do ScrollView para espaçamento do conteúdo
  content: {
    paddingTop: 20,
    paddingBottom: 150, // Espaço extra para não sobrepor a tab bar
  },

  // Título principal da tela
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Subtítulo descritivo abaixo do título
  subtitle: {
    color: '#757575',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 25,
  },

  // Card de resumo de cada coleção
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Sombra para Android
    elevation: 3,
  },

  // Título do card (nome da coleção)
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Número em destaque com a contagem total
  number: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 10,
  },

});