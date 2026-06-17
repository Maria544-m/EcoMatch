// ============================================================
// AdminUsers.tsx
// Tela administrativa para visualização de usuários cadastrados
// Acessa a coleção 'users' do Firestore e exibe em lista
// ============================================================

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import {
  collection,
  getDocs,
} from 'firebase/firestore';

// Importa a instância do banco de dados Firestore configurada no projeto
import { db } from '../../services/firebaseConfig';

// -------------------------------------------------------
// Tipagem dos dados de cada usuário retornado do Firestore
// -------------------------------------------------------
interface User {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  ecoScore?: number;
  xp?: number;
  missionsDone?: number;
}

// -------------------------------------------------------
// Componente principal da tela de administração de usuários
// -------------------------------------------------------
export default function AdminUsers() {

  // Estado que armazena a lista de usuários carregados do Firestore
  const [users, setUsers] = useState<User[]>([]);

  // Estado que controla o indicador de carregamento (loading spinner)
  const [loading, setLoading] = useState(true);

  // useEffect executa loadUsers() assim que o componente é montado
  useEffect(() => {
    loadUsers();
  }, []); // Array vazio = executa apenas uma vez, na montagem

  // -------------------------------------------------------
  // Função assíncrona que busca todos os usuários no Firestore
  // -------------------------------------------------------
  async function loadUsers() {

    try {

      // Busca todos os documentos da coleção 'users' no Firestore
      const snapshot = await getDocs(
        collection(db, 'users')
      );

      // Array temporário para montar a lista de usuários
      const usersList: User[] = [];

      // Itera sobre cada documento retornado e extrai os dados
      snapshot.forEach((document) => {

        usersList.push({
          id: document.id,       // ID único do documento no Firestore
          ...document.data(),    // Spread dos demais campos do documento
        });

      });

      // Atualiza o estado com a lista de usuários carregados
      setUsers(usersList);

    } catch (error) {

      // Exibe erro no console caso a leitura do Firestore falhe
      console.log('Erro ao carregar usuários:', error);

    } finally {

      // Sempre desativa o loading, independente de sucesso ou erro
      setLoading(false);

    }
  }

  // -------------------------------------------------------
  // Enquanto os dados são carregados, exibe um spinner
  // -------------------------------------------------------
  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Carregando usuários...
        </Text>

      </View>

    );
  }

  // -------------------------------------------------------
  // Renderização principal: título + contador + lista de cards
  // -------------------------------------------------------
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        👥 Usuários Cadastrados
      </Text>

      {/* Exibe a contagem total de usuários encontrados */}
      <Text style={styles.subtitle}>
        Total de usuários: {users.length}
      </Text>

      {/*
        FlatList renderiza listas longas de forma eficiente,
        pois só processa os itens visíveis na tela (virtualização)
      */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id} // Chave única para cada item da lista
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (

          // Card individual de cada usuário
          <View style={styles.card}>

            {/* Nome do usuário — usa fallbacks caso o campo esteja ausente */}
            <Text style={styles.name}>
              {item.name || item.displayName || 'Sem nome'}
            </Text>

            {/* Email do usuário */}
            <Text style={styles.info}>
              📧 {item.email || 'Email não informado'}
            </Text>

            {/* Pontuação ecológica do usuário no app */}
            <Text style={styles.info}>
              🌱 EcoScore: {item.ecoScore ?? 0}
            </Text>

            {/* Pontos de experiência acumulados */}
            <Text style={styles.info}>
              ⭐ XP: {item.xp ?? 0}
            </Text>

            {/* Quantidade de missões concluídas */}
            <Text style={styles.info}>
              🎯 Missões: {item.missionsDone ?? 0}
            </Text>

            {/* ID do documento no Firestore (útil para debug/admin) */}
            <Text style={styles.userId}>
              ID: {item.id}
            </Text>

          </View>

        )}
      />

    </View>

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

  // Container principal da tela
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    padding: 15,
  },

  // Título da tela
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
  },

  // Subtítulo com contagem de usuários
  subtitle: {
    color: '#757575',
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
  },

  // Card de cada usuário na lista
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    // Sombra para Android
    elevation: 3,
  },

  // Nome do usuário no card
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },

  // Informações secundárias do usuário (email, XP, etc.)
  info: {
    fontSize: 15,
    color: '#616161',
    marginBottom: 5,
  },

  // ID do documento exibido discretamente no rodapé do card
  userId: {
    marginTop: 10,
    fontSize: 12,
    color: '#9E9E9E',
  },

});