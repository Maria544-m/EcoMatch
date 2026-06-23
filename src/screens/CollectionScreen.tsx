// ============================================================================
// CollectionScreen.tsx
// Tela de acervo educativo sobre reciclagem com cards expansíveis.
// ============================================================================

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// Habilita animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ----------------------------------------------------------------------------
// Tipagem dos Materiais
// ----------------------------------------------------------------------------
interface MaterialDetail {
  id: number;
  emoji: string;
  title: string;
  color: string;
  summary: string;
  fullGuide: string[];
  curiosity: string;
}

// ----------------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------------
export default function CollectionScreen() {
  // Estado para controlar qual card está expandido
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const materials: MaterialDetail[] = [
    {
      id: 1,
      emoji: '📄',
      title: 'Papéis',
      color: '#3498DB',
      summary: 'Cadernos, jornais e caixas.',
      fullGuide: ['Remova espirais de plástico', 'Não recicle papel higiênico', 'Pique o papel para ocupar menos espaço'],
      curiosity: 'Reciclar 1 tonelada de papel poupa 20 árvores.',
    },
    {
      id: 2,
      emoji: '🧴',
      title: 'Plásticos',
      color: '#E74C3C',
      summary: 'Garrafas, potes e sacolas.',
      fullGuide: ['Lave com água de reuso', 'Separe por tipo (PET, PEAD)', 'Retire rótulos adesivos'],
      curiosity: 'O plástico leva 450 anos para se decompor.',
    },
    {
      id: 3,
      emoji: '🍾',
      title: 'Vidros',
      color: '#27AE60',
      summary: 'Garrafas e potes de conserva.',
      fullGuide: ['Lave e retire as tampas', 'Cuidado com cacos', 'Não misture com cerâmica'],
      curiosity: 'O vidro é infinitamente reciclável.',
    },
    {
      id: 4,
      emoji: '🥫',
      title: 'Metais',
      color: '#F1C40F',
      summary: 'Latas de alumínio e aço.',
      fullGuide: ['Lave para evitar odores', 'Dobre a tampa para dentro', 'Não amasse latas de spray'],
      curiosity: 'Latas voltam à prateleira em 60 dias.',
    },
  ];

  // Função para alternar a expansão do card com animação
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Estilo Dashboard */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Guia Interativo</Text>
            <Text style={styles.title}>Reciclagem Inteligente</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>🌱 Ativo</Text>
          </View>
        </View>

        {/* Cards de Material */}
        <View style={styles.grid}>
          {materials.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
                style={[
                  styles.card,
                  isExpanded && styles.cardExpanded,
                  { borderColor: isExpanded ? item.color : '#F0F0F0' }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                    <Text style={styles.emoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    {!isExpanded && <Text style={styles.cardSummary}>{item.summary}</Text>}
                  </View>
                  <Text style={[styles.arrow, { color: item.color }]}>
                    {isExpanded ? '▲' : '▼'}
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionLabel}>PASSO A PASSO:</Text>
                    {item.fullGuide.map((step, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <View style={[styles.stepNumber, { backgroundColor: item.color }]}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}

                    <View style={[styles.curiosityBox, { backgroundColor: item.color + '10' }]}>
                      <Text style={[styles.curiosityTitle, { color: item.color }]}>Você sabia?</Text>
                      <Text style={styles.curiosityText}>{item.curiosity}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dica do Dia */}
        <View style={styles.tipOfTheDay}>
          <Text style={styles.tipTitle}>💡 Dica </Text>
          <Text style={styles.tipDescription}>
            Separe o lixo orgânico do reciclável. O orgânico pode virar adubo através da compostagem doméstica!
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Estilos
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120, // espaço extra para a barra inferior
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
  marginBottom: 30,
  minHeight: 50,
},
  welcomeText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginTop: 15,
    
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  progressBadge: {
  backgroundColor: '#E8F5E9',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
progressText: {
  color: '#2E7D32',
  fontWeight: '700',
  fontSize: 12,
  lineHeight: 20,
},
grid: {
  gap: 16,
},
card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 16,
  borderWidth: 2,
  borderColor: '#F5F5F5',
  // Sombra leve
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 2,
},
cardExpanded: {
  backgroundColor: '#FFFFFF',
  shadowOpacity: 0.1,
},
cardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emoji: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardSummary: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  curiosityBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 16,
  },
  curiosityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  curiosityText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  tipOfTheDay: {
    marginTop: 30,
    backgroundColor: '#FDF7E2',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F9E79F',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7D6608',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#9A7D0A',
    lineHeight: 20,
  },
});