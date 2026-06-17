// ============================================================
// RankingScreen.tsx
// Tela de ranking global dos usuários do aplicativo
// Busca todos os usuários no Firestore, ordena pelo EcoScore
// e exibe os três primeiros com destaque de pódio
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
  orderBy,
  query,
  limit,
} from 'firebase/firestore';

// Instâncias de autenticação e banco de dados configuradas no projeto
import { auth, db } from '../services/firebaseConfig';

// -------------------------------------------------------
// Tipagem de cada usuário exibido no ranking
// -------------------------------------------------------
interface RankedUser {
  id: string;
  name: string;
  ecoScore: number;
  xp: number;
  position: number; // Posição calculada após ordenação
}

// -------------------------------------------------------
// Medalhas exibidas nas três primeiras posições do pódio
// -------------------------------------------------------
const MEDALS: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

// -------------------------------------------------------
// Componente principal da tela de ranking
// -------------------------------------------------------
export default function RankingScreen() {

  // Estado com a lista de usuários ordenada por EcoScore
  const [ranking, setRanking] = useState<RankedUser[]>([]);

  // Estado que controla o indicador de carregamento
  const [loading, setLoading] = useState(true);

  // ID do usuário autenticado para destacar sua posição na lista
  const currentUid = auth.currentUser?.uid;

  // Executa a busca do ranking assim que o componente é montado
  useEffect(() => {
    loadRanking();
  }, []); // Array vazio = executa apenas uma vez, na montagem

  // -------------------------------------------------------
  // Busca os 20 melhores usuários do Firestore ordenados
  // por EcoScore de forma decrescente
  // -------------------------------------------------------
  async function loadRanking() {

    try {

      // query() constrói uma consulta com filtros e ordenação
      // orderBy('ecoScore', 'desc') ordena do maior para o menor
      // limit(20) restringe o resultado aos 20 primeiros
      const rankingQuery = query(
        collection(db, 'users'),
        orderBy('ecoScore', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(rankingQuery);

      // Mapeia os documentos retornados para o formato RankedUser
      // O índice + 1 define a posição de cada usuário no ranking
      const list: RankedUser[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id:        doc.id,
          name:      data.name || data.displayName || 'Usuário',
          ecoScore:  data.ecoScore ?? 0,
          xp:        data.xp ?? 0,
          position:  index + 1,
        };
      });

      setRanking(list);

    } catch (error) {

      console.log('Erro ao carregar ranking:', error);

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

        <ActivityIndicator size="large" color="#2E7D32" />

        <Text style={styles.loadingText}>
          Carregando ranking...
        </Text>

      </View>

    );
  }

  // -------------------------------------------------------
  // Renderização de cada item da lista de ranking
  // -------------------------------------------------------
  function renderItem({ item }: { item: RankedUser }) {

    // Verifica se este item pertence ao usuário logado
    const isCurrentUser = item.id === currentUid;

    // Verifica se é uma das três primeiras posições (pódio)
    const isPodium = item.position <= 3;

    return (

      <View
        style={[
          styles.row,
          isPodium     && styles.podiumRow,     // Destaque visual para o pódio
          isCurrentUser && styles.currentUserRow, // Destaque para o usuário logado
        ]}
      >

        {/* Posição: medalha para pódio ou número para demais */}
        <Text style={styles.position}>
          {MEDALS[item.position] ?? `${item.position}º`}
        </Text>

        {/* Informações do usuário: nome e XP */}
        <View style={styles.userInfo}>

          <Text
            style={[
              styles.userName,
              isCurrentUser && styles.currentUserName,
            ]}
            numberOfLines={1} // Evita quebra de linha em nomes longos
          >
            {item.name}
            {isCurrentUser ? '  (você)' : ''}
          </Text>

          <Text style={styles.userXp}>
            ⭐ {item.xp} XP
          </Text>

        </View>

        {/* EcoScore em destaque no lado direito do card */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>
            {item.ecoScore}
          </Text>
          <Text style={styles.scoreLabel}>
            EcoScore
          </Text>
        </View>

      </View>

    );
  }

  // -------------------------------------------------------
  // Renderização principal: título + lista de ranking
  // -------------------------------------------------------
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        🏆 Ranking Global
      </Text>

      <Text style={styles.subtitle}>
        Top 20 EcoGuardiões do planeta
      </Text>

      {/*
        FlatList renderiza listas longas de forma eficiente,
        processando apenas os itens visíveis na tela.
        keyExtractor usa o ID do documento do Firestore como chave única.
      */}
      <FlatList
        data={ranking}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          // Exibido caso a lista venha vazia do Firestore
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum usuário encontrado.
            </Text>
          </View>
        }
      />

    </View>

  );
}

// ============================================================
// Estilos do componente utilizando StyleSheet do React Native
// ============================================================
const styles = StyleSheet.create({

  // Container principal que ocupa toda a tela
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    paddingHorizontal: 20,
  },

  // Container exibido durante o carregamento dos dados
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FFF6',
  },

  // Texto abaixo do spinner de carregamento
  loadingText: {
    marginTop: 15,
    color: '#757575',
    fontSize: 16,
  },

  // Título principal da tela
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 60,
  },

  // Subtítulo descritivo abaixo do título
  subtitle: {
    color: '#757575',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
  },

  // Espaçamento interno da lista
  listContent: {
    paddingBottom: 140,
  },

  // Card de cada posição do ranking
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,

    // Sombra para Android
    elevation: 2,
  },

  // Estilo adicional para as três primeiras posições (pódio)
  podiumRow: {
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },

  // Estilo adicional para destacar o usuário logado na lista
  currentUserRow: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
  },

  // Número ou medalha da posição
  position: {
    fontSize: 24,
    width: 44,
    textAlign: 'center',
  },

  // Container com nome e XP do usuário
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  // Nome do usuário
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },

  // Nome do usuário logado em azul para destaque
  currentUserName: {
    color: '#1565C0',
  },

  // XP exibido abaixo do nome
  userXp: {
    fontSize: 13,
    color: '#757575',
    marginTop: 3,
  },

  // Container do EcoScore alinhado à direita
  scoreContainer: {
    alignItems: 'flex-end',
  },

  // Valor numérico do EcoScore em destaque
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Rótulo "EcoScore" abaixo do número
  scoreLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },

  // Container exibido quando a lista está vazia
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },

  // Mensagem de lista vazia
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
  },

});