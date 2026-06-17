// ============================================================
// CollectionScreen.tsx
// Tela de acervo educativo sobre reciclagem e descarte correto
// Exibe cards informativos por tipo de material e uma dica
// sustentável ao final da lista
// ============================================================

import React from 'react';

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';

// -------------------------------------------------------
// Tipagem de cada item de material reciclável
// -------------------------------------------------------
interface Material {
  id: number;
  icon: string;
  title: string;
  color: string;
  description: string;
}

// -------------------------------------------------------
// Componente principal da tela de acervo ambiental
// -------------------------------------------------------
export default function CollectionScreen() {

  // Lista estática dos materiais recicláveis com seus dados
  // Cada item possui cor de fundo própria para diferenciação visual
  const materials: Material[] = [
    {
      id: 1,
      icon: '📄',
      title: 'Papel',
      color: '#BBDEFB', // azul claro
      description:
        'Jornais, revistas, caixas de papelão e folhas podem ser reciclados. Evite papel molhado ou engordurado.',
    },
    {
      id: 2,
      icon: '🧴',
      title: 'Plástico',
      color: '#FFCDD2', // vermelho claro
      description:
        'Garrafas PET, embalagens e recipientes plásticos devem estar limpos antes do descarte.',
    },
    {
      id: 3,
      icon: '🍾',
      title: 'Vidro',
      color: '#C8E6C9', // verde claro
      description:
        'Garrafas e potes de vidro podem ser reciclados. Tome cuidado com materiais quebrados.',
    },
    {
      id: 4,
      icon: '🥫',
      title: 'Metal',
      color: '#FFF9C4', // amarelo claro
      description:
        'Latas de alumínio e aço possuem alto valor de reciclagem e ajudam a reduzir impactos ambientais.',
    },
    {
      id: 5,
      icon: '💻',
      title: 'Eletrônicos',
      color: '#D1C4E9', // roxo claro
      description:
        'Celulares, computadores e baterias devem ser descartados em pontos especializados.',
    },
    {
      id: 6,
      icon: '🛢️',
      title: 'Óleo de Cozinha',
      color: '#FFE0B2', // laranja claro
      description:
        'Nunca descarte óleo na pia. Armazene em garrafas e entregue em um EcoPonto.',
    },
  ];

  // -------------------------------------------------------
  // Renderização principal: título + cards de materiais + dica
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >

      <Text style={styles.title}>
        📚 Acervo Ambiental
      </Text>

      <Text style={styles.subtitle}>
        Aprenda a reciclar corretamente e ajude o planeta.
      </Text>

      {/*
        .map() percorre o array de materiais e renderiza
        um card para cada item. A prop key é obrigatória
        para o React identificar cada elemento da lista.
      */}
      {materials.map((item) => (

        <View
          key={item.id}
          style={[
            styles.card,
            { backgroundColor: item.color }, // cor dinâmica por material
          ]}
        >

          {/* Ícone representativo do tipo de material */}
          <Text style={styles.icon}>
            {item.icon}
          </Text>

          {/* Nome do material reciclável */}
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          {/* Descrição com instruções de descarte correto */}
          <Text style={styles.cardDescription}>
            {item.description}
          </Text>

        </View>

      ))}

      {/* Card de dica sustentável exibido ao final da lista */}
      <View style={styles.tipCard}>

        <Text style={styles.tipTitle}>
          🌱 Dica Sustentável
        </Text>

        <Text style={styles.tipText}>
          Pequenas atitudes diárias fazem grande diferença.
          Separar corretamente os resíduos ajuda a preservar
          recursos naturais e reduz a poluição.
        </Text>

      </View>

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
    fontSize: 15,
    marginTop: 10,
    marginBottom: 25,
  },

  // Card de cada material — cor de fundo aplicada dinamicamente
  card: {
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

  // Ícone emoji do material
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },

  // Título do card (nome do material)
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },

  // Texto descritivo com orientações de descarte
  cardDescription: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 22, // Espaçamento entre linhas para melhor legibilidade
  },

  // Card de dica sustentável com fundo verde suave
  tipCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 40,
  },

  // Título da dica sustentável
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },

  // Texto da dica sustentável
  tipText: {
    color: '#2E7D32',
    lineHeight: 22,
  },

});