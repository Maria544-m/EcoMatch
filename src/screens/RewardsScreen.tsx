// ============================================================
// RewardsScreen.tsx
// Tela de recompensas e troféus do aplicativo EcoMatch
// Exibe a EcoStore com itens desbloqueáveis por EcoScore
// e os troféus conquistados pelo usuário
// ============================================================

import React from 'react';

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';

// -------------------------------------------------------
// Tipagem de cada recompensa da EcoStore
// -------------------------------------------------------
interface Reward {
  id: number;
  title: string;
  score: number;    // EcoScore necessário para desbloquear
  unlocked: boolean; // true = disponível para o usuário
}

// -------------------------------------------------------
// Tipagem de cada troféu conquistável
// -------------------------------------------------------
interface Trophy {
  id: number;
  title: string;
  icon: string; // Emoji representativo do troféu
}

// -------------------------------------------------------
// Componente principal da tela de recompensas
// -------------------------------------------------------
export default function RewardsScreen() {

  // Lista estática de recompensas disponíveis na EcoStore
  // O campo 'unlocked' indica se o usuário já atingiu o EcoScore necessário
  const rewards: Reward[] = [
    {
      id: 1,
      title: 'Caneca Ecológica',
      score: 500,
      unlocked: true,  // Desbloqueada — EcoScore suficiente
    },
    {
      id: 2,
      title: 'Sacola Sustentável',
      score: 1000,
      unlocked: false, // Bloqueada — EcoScore insuficiente
    },
    {
      id: 3,
      title: 'Kit Plantio',
      score: 2000,
      unlocked: false, // Bloqueada — EcoScore insuficiente
    },
  ];

  // Lista estática de troféus conquistáveis no aplicativo
  // Representam marcos de progresso do usuário
  const trophies: Trophy[] = [
    {
      id: 1,
      title: 'Primeira Reciclagem',
      icon: '🥉', // Bronze — primeiro passo na jornada ecológica
    },
    {
      id: 2,
      title: 'Eco Iniciante',
      icon: '🥈', // Prata — progresso intermediário
    },
    {
      id: 3,
      title: 'Eco Guardião',
      icon: '🥇', // Ouro — nível máximo de conquista
    },
  ];

  // -------------------------------------------------------
  // Renderização principal: EcoStore + seção de troféus
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >

      <Text style={styles.title}>
        🏆 Recompensas
      </Text>

      <Text style={styles.subtitle}>
        Troque EcoScore por benefícios e conquiste troféus.
      </Text>

      {/* ── ECOSCORE: lista de itens desbloqueáveis ── */}
      <Text style={styles.sectionTitle}>
        🎁 EcoStore
      </Text>

      {/*
        .map() percorre o array de recompensas e renderiza
        um card para cada item. A prop key é obrigatória para
        o React identificar cada elemento da lista.
      */}
      {rewards.map((item) => (

        <View key={item.id} style={styles.card}>

          {/* Nome da recompensa */}
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          {/* EcoScore exigido para desbloquear o item */}
          <Text style={styles.cardText}>
            Necessário: {item.score} EcoScore
          </Text>

          {/*
            Status de desbloqueio com cor dinâmica:
            Verde para desbloqueado, vermelho para bloqueado
          */}
          <Text
            style={[
              styles.status,
              { color: item.unlocked ? '#2E7D32' : '#d32f2f' },
            ]}
          >
            {item.unlocked ? '🔓 Desbloqueado' : '🔒 Bloqueado'}
          </Text>

        </View>

      ))}

      {/* ── TROFÉUS: conquistas por marcos de progresso ── */}
      <Text style={styles.sectionTitle}>
        🏅 Troféus
      </Text>

      {trophies.map((item) => (

        <View key={item.id} style={styles.card}>

          {/* Ícone emoji do troféu em tamanho destacado */}
          <Text style={styles.trophy}>
            {item.icon}
          </Text>

          {/* Nome do troféu */}
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

        </View>

      ))}

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

  // Título principal da tela
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
  },

  // Subtítulo descritivo abaixo do título
  subtitle: {
    color: '#757575',
    marginTop: 10,
    marginBottom: 25,
  },

  // Título de cada seção (EcoStore e Troféus)
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
    marginTop: 10,
  },

  // Card branco com sombra para cada recompensa ou troféu
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,

    // Sombra para iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // Sombra para Android
    elevation: 3,
  },

  // Título do card (nome da recompensa ou troféu)
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },

  // Texto secundário com o EcoScore necessário
  cardText: {
    color: '#616161',
    fontSize: 15,
  },

  // Status de desbloqueio — cor aplicada dinamicamente via inline style
  status: {
    marginTop: 10,
    fontWeight: 'bold',
  },

  // Ícone emoji do troféu em tamanho destacado
  trophy: {
    fontSize: 40,
    marginBottom: 10,
  },

});