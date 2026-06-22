// ============================================================================
// GameScreen.tsx (Versão: Simulador de Triagem Pro)
// Jogo desafiador focado em decisões críticas de descarte.
// Desafio: Reciclável vs Rejeito vs Especial (Ecoponto).
// Design: Fundo Branco, Estilo Minimalista Industrial, UX de Alta Performance.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

// Firebase
import { auth, db } from '../services/firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------------
// Tipagem e Dados Desafiadores
// ----------------------------------------------------------------------------
type Destino = 'RECICLÁVEL' | 'REJEITO' | 'ECOPONTO';

interface Residuo {
  id: number;
  nome: string;
  emoji: string;
  condicao: string;
  destinoCorreto: Destino;
  explicacao: string;
}

const LISTA_RESIDUOS: Residuo[] = [
  { id: 1, emoji: '🍕', nome: 'Caixa de Pizza', condicao: 'Com restos de gordura', destinoCorreto: 'REJEITO', explicacao: 'Papel engordurado não pode ser reciclado.' },
  { id: 2, emoji: '📦', nome: 'Caixa de Papelão', condicao: 'Limpa e dobrada', destinoCorreto: 'RECICLÁVEL', explicacao: 'Papel limpo é excelente para reciclagem.' },
  { id: 3, emoji: '🔋', nome: 'Pilha Usada', condicao: 'Descarregada', destinoCorreto: 'ECOPONTO', explicacao: 'Contém metais pesados. Exige descarte especial.' },
  { id: 4, emoji: '🧴', nome: 'Frasco de Shampoo', condicao: 'Enxaguado', destinoCorreto: 'RECICLÁVEL', explicacao: 'Plásticos limpos são recicláveis.' },
  { id: 5, emoji: '🧻', nome: 'Papel Higiênico', condicao: 'Usado', destinoCorreto: 'REJEITO', explicacao: 'Papéis sanitários vão para o lixo comum.' },
  { id: 6, emoji: '💻', nome: 'Mouse Quebrado', condicao: 'Eletrônico', destinoCorreto: 'ECOPONTO', explicacao: 'Lixo eletrônico deve ir para pontos específicos.' },
  { id: 7, emoji: '🍷', nome: 'Taça Quebrada', condicao: 'Cacos de vidro', destinoCorreto: 'RECICLÁVEL', explicacao: 'Vidro quebrado é reciclável, mas deve ser embalado.' },
  { id: 8, emoji: '☕', nome: 'Copo Descartável', condicao: 'Com resto de café', destinoCorreto: 'REJEITO', explicacao: 'A sujeira orgânica inviabiliza a reciclagem rápida.' },
  { id: 9, emoji: '🩹', nome: 'Curativo (Band-aid)', condicao: 'Usado', destinoCorreto: 'REJEITO', explicacao: 'Materiais contaminados são rejeitos.' },
  { id: 10, emoji: '🛢️', nome: 'Óleo de Cozinha', condicao: 'Na garrafa PET', destinoCorreto: 'ECOPONTO', explicacao: 'Óleo nunca vai no ralo ou lixo comum.' },
];

export default function GameScreen({ navigation }: { navigation: any }) {
  const [score, setScore] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [itemAtual, setItemAtual] = useState<Residuo>(LISTA_RESIDUOS[0]);
  const [feedback, setFeedback] = useState<{ tipo: 'certo' | 'errado' | 'none', msg: string }>({ tipo: 'none', msg: '' });
  const [gameActive, setGameActive] = useState(true);

  // Animações
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Função para sortear próximo item sem repetir o atual
  const sortearProximo = () => {
    let novo;
    do {
      novo = LISTA_RESIDUOS[Math.floor(Math.random() * LISTA_RESIDUOS.length)];
    } while (novo.id === itemAtual.id);
    
    // Animação de entrada
    slideAnim.setValue(width);
    setItemAtual(novo);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50 }).start();
  };

  const handleDecisao = async (destino: Destino) => {
    if (!gameActive || feedback.tipo !== 'none') return;

    if (destino === itemAtual.destinoCorreto) {
      // ACERTO
      setScore(s => s + 1);
      setFeedback({ tipo: 'certo', msg: 'Excelente! ' + itemAtual.explicacao });
      
      if (score + 1 >= 15) {
        await finalizarJogo(true);
      } else {
        setTimeout(() => {
          setFeedback({ tipo: 'none', msg: '' });
          sortearProximo();
        }, 2000);
      }
    } else {
      // ERRO
      const novasVidas = vidas - 1;
      setVidas(novasVidas);
      setFeedback({ tipo: 'errado', msg: 'Ops! ' + itemAtual.explicacao });

      if (novasVidas <= 0) {
        setGameActive(false);
        setTimeout(() => setFeedback({ tipo: 'none', msg: '' }), 2000);
      } else {
        setTimeout(() => {
          setFeedback({ tipo: 'none', msg: '' });
          sortearProximo();
        }, 2500);
      }
    }
  };

  const finalizarJogo = async (vitoria: boolean) => {
    setGameActive(false);
    if (vitoria) {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), {
            ecoScore: increment(800),
            xp: increment(300),
          });
        }
      } catch (e) { console.error(e); }
    }
  };

  const reiniciar = () => {
    setScore(0);
    setVidas(3);
    setFeedback({ tipo: 'none', msg: '' });
    setGameActive(true);
    sortearProximo();
  };

  // --------------------------------------------------------------------------
  // Renderização de Fim de Jogo
  // --------------------------------------------------------------------------
  if (!gameActive && feedback.tipo === 'none') {
    const venceu = score >= 15;
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.endScreen}>
          <Text style={styles.endEmoji}>{venceu ? '🏆' : '♻️'}</Text>
          <Text style={styles.endTitle}>{venceu ? 'Mestre da Triagem' : 'Fim da Simulação'}</Text>
          <Text style={styles.endText}>
            {venceu 
              ? 'Você demonstrou conhecimento avançado em descarte correto!' 
              : `Você classificou ${score} itens corretamente. Continue praticando!`}
          </Text>
          <View style={styles.finalScoreCard}>
            <Text style={styles.finalScoreVal}>{score}</Text>
            <Text style={styles.finalScoreLab}>Pontos</Text>
          </View>
          <TouchableOpacity style={styles.btnPrimary} onPress={reiniciar}>
            <Text style={styles.btnPrimaryText}>Reiniciar Simulação</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnSecondaryText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>PONTUAÇÃO</Text>
          <Text style={styles.headerVal}>{score}</Text>
        </View>
        <View style={styles.vidasContainer}>
          {[...Array(3)].map((_, i) => (
            <Text key={i} style={styles.vidaEmoji}>{i < vidas ? '⚡' : '🔘'}</Text>
          ))}
        </View>
      </View>

      <View style={styles.main}>
        {/* Item na Esteira */}
        <Animated.View style={[styles.itemCard, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.emojiCircle}>
            <Text style={styles.itemEmoji}>{itemAtual.emoji}</Text>
          </View>
          <Text style={styles.itemName}>{itemAtual.nome}</Text>
          <View style={styles.condicaoBadge}>
            <Text style={styles.condicaoText}>{itemAtual.condicao.toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Feedback Overlay */}
        {feedback.tipo !== 'none' && (
          <View style={[styles.feedbackOverlay, { backgroundColor: feedback.tipo === 'certo' ? '#F1F9F4' : '#FFF5F5' }]}>
            <Text style={[styles.feedbackTitle, { color: feedback.tipo === 'certo' ? '#27AE60' : '#EB5757' }]}>
              {feedback.tipo === 'certo' ? '✓ CORRETO' : '✕ INCORRETO'}
            </Text>
            <Text style={styles.feedbackMsg}>{feedback.msg}</Text>
          </View>
        )}

        {/* Controles de Decisão */}
        <View style={styles.controles}>
          <Text style={styles.controlesLabel}>PARA ONDE VAI ESTE ITEM?</Text>
          <View style={styles.btnRow}>
            <DecisaoBtn label="RECICLÁVEL" sub="Papel, Plast, Vidro, Met" color="#2D5AF6" onPress={() => handleDecisao('RECICLÁVEL')} />
            <DecisaoBtn label="REJEITO" sub="Lixo Comum / Sujo" color="#444" onPress={() => handleDecisao('REJEITO')} />
          </View>
          <DecisaoBtn label="ECOPONTO" sub="Eletrônicos, Óleo, Pilhas" color="#F39C12" onPress={() => handleDecisao('ECOPONTO')} full />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Subcomponente de Botão de Decisão
function DecisaoBtn({ label, sub, color, onPress, full }: any) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[styles.btnDecisao, { borderColor: color + '30', width: full ? '100%' : '48%' }]}
    >
      <View style={[styles.btnIndicator, { backgroundColor: color }]} />
      <Text style={[styles.btnLabel, { color }]}>{label}</Text>
      <Text style={styles.btnSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, alignItems: 'center' },
  headerLabel: { fontSize: 10, fontWeight: '900', color: '#AAA', letterSpacing: 1 },
  headerVal: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  vidasContainer: { flexDirection: 'row' },
  vidaEmoji: { fontSize: 20, marginLeft: 5 },

  main: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 40 },
  itemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  emojiCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 2 },
  itemEmoji: { fontSize: 45 },
  itemName: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  condicaoBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  condicaoText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  feedbackOverlay: { padding: 20, borderRadius: 20, marginTop: 20, borderWidth: 1, borderColor: '#EEE' },
  feedbackTitle: { fontWeight: '900', fontSize: 12, marginBottom: 5 },
  feedbackMsg: { fontSize: 14, color: '#444', lineHeight: 20 },

  controles: { gap: 12 },
  controlesLabel: { fontSize: 11, fontWeight: '900', color: '#AAA', textAlign: 'center', marginBottom: 5 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnDecisao: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  btnIndicator: { width: 30, height: 4, borderRadius: 2, marginBottom: 8 },
  btnLabel: { fontSize: 14, fontWeight: '900' },
  btnSub: { fontSize: 10, color: '#888', marginTop: 2, textAlign: 'center' },

  // End Screen
  endScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  endEmoji: { fontSize: 80, marginBottom: 20 },
  endTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  endText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  finalScoreCard: { backgroundColor: '#F8F9FA', padding: 30, borderRadius: 30, alignItems: 'center', marginVertical: 30, width: '100%' },
  finalScoreVal: { fontSize: 60, fontWeight: '900', color: '#2A9D8F' },
  finalScoreLab: { fontSize: 14, fontWeight: '700', color: '#AAA' },
  btnPrimary: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  btnSecondary: { padding: 15 },
  btnSecondaryText: { color: '#888', fontWeight: '700' },
});