// ============================================================================
// GameScreen.tsx
// ============================================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

import { auth, db } from '../services/firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------------
// Tipos e Dados
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
  { id: 1,  emoji: '🍕', nome: 'Caixa de Pizza',    condicao: 'Com gordura',       destinoCorreto: 'REJEITO',    explicacao: 'Papel engordurado não pode ser reciclado.' },
  { id: 2,  emoji: '📦', nome: 'Caixa de Papelão',  condicao: 'Limpa e dobrada',   destinoCorreto: 'RECICLÁVEL', explicacao: 'Papel limpo é excelente para reciclagem.' },
  { id: 3,  emoji: '🔋', nome: 'Pilha Usada',       condicao: 'Descarregada',      destinoCorreto: 'ECOPONTO',   explicacao: 'Contém metais pesados. Exige descarte especial.' },
  { id: 4,  emoji: '🧴', nome: 'Frasco de Shampoo', condicao: 'Enxaguado',         destinoCorreto: 'RECICLÁVEL', explicacao: 'Plásticos limpos são recicláveis.' },
  { id: 5,  emoji: '🧻', nome: 'Papel Higiênico',   condicao: 'Usado',             destinoCorreto: 'REJEITO',    explicacao: 'Papéis sanitários vão para o lixo comum.' },
  { id: 6,  emoji: '💻', nome: 'Mouse Quebrado',    condicao: 'Eletrônico',        destinoCorreto: 'ECOPONTO',   explicacao: 'Lixo eletrônico deve ir para pontos específicos.' },
  { id: 7,  emoji: '🍷', nome: 'Taça Quebrada',     condicao: 'Cacos de vidro',    destinoCorreto: 'RECICLÁVEL', explicacao: 'Vidro quebrado é reciclável, mas deve ser embalado.' },
  { id: 8,  emoji: '☕', nome: 'Copo Descartável',  condicao: 'Com resto de café', destinoCorreto: 'REJEITO',    explicacao: 'Sujeira orgânica inviabiliza a reciclagem.' },
  { id: 9,  emoji: '🩹', nome: 'Curativo',          condicao: 'Usado',             destinoCorreto: 'REJEITO',    explicacao: 'Materiais contaminados são rejeitos.' },
  { id: 10, emoji: '🛢️', nome: 'Óleo de Cozinha',  condicao: 'Na garrafa PET',    destinoCorreto: 'ECOPONTO',   explicacao: 'Óleo nunca vai no ralo ou lixo comum.' },
];

const META = 10; 

const LIXEIRAS: { destino: Destino; label: string; icon: string; cor: string }[] = [
  { destino: 'RECICLÁVEL', label: 'Reciclar',  icon: '♻️',  cor: '#16A34A' },
  { destino: 'REJEITO',    label: 'Rejeito',   icon: '🗑️',  cor: '#DC2626' },
  { destino: 'ECOPONTO',   label: 'Ecoponto',  icon: '⚡',  cor: '#D97706' },
];

// Embaralha a lista e retorna uma fila sem repetição
function gerarFila(): Residuo[] {
  const copia = [...LISTA_RESIDUOS];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ----------------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------------
export default function GameScreen({ navigation }: { navigation: any }) {
  // Fila sem repetição: embaralhamos os 10 itens no início
  const [fila, setFila] = useState<Residuo[]>(() => gerarFila());
  const [filaIndex, setFilaIndex] = useState(0);

  const itemAtual = fila[filaIndex] ?? fila[0];

  const [score, setScore]           = useState(0);
  const [vidas, setVidas]           = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [lixeiraAtiva, setLixeiraAtiva] = useState<Destino | null>(null);
  const [feedback, setFeedback]     = useState<{
    visivel: boolean;
    tipo: 'certo' | 'errado';
    msg: string;
  } | null>(null);

  // Refs para manter valores atuais dentro do PanResponder (evita closure stale)
  const itemRef       = useRef(itemAtual);
  const filaIndexRef  = useRef(filaIndex);
  const scoreRef      = useRef(score);
  const vidasRef      = useRef(vidas);
  const gameActiveRef = useRef(gameActive);
  const processingRef = useRef(false);

  itemRef.current       = itemAtual;
  filaIndexRef.current  = filaIndex;
  scoreRef.current      = score;
  vidasRef.current      = vidas;
  gameActiveRef.current = gameActive;

  // Animações
  const pan       = useRef(new Animated.ValueXY()).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Refs das lixeiras para measure() absoluto
  const lixeiraViewRefs = useRef<{ [key in Destino]?: View | null }>({});
  const lixeiraLayouts  = useRef<{ [key in Destino]?: { x: number; y: number; w: number; h: number } }>({});

  const medirLixeira = (destino: Destino) => {
    const ref = lixeiraViewRefs.current[destino];
    if (!ref) return;
    (ref as any).measure(
      (_fx: number, _fy: number, w: number, h: number, px: number, py: number) => {
        lixeiraLayouts.current[destino] = { x: px, y: py, w, h };
      }
    );
  };

  const verificarColisao = (cardCenterX: number, cardCenterY: number): Destino | null => {
    for (const lx of LIXEIRAS) {
      const zona = lixeiraLayouts.current[lx.destino];
      if (!zona) continue;
      if (
        cardCenterX >= zona.x &&
        cardCenterX <= zona.x + zona.w &&
        cardCenterY >= zona.y &&
        cardCenterY <= zona.y + zona.h
      ) {
        return lx.destino;
      }
    }
    return null;
  };

  const cardRef    = useRef<View | null>(null);
  const cardOrigin = useRef({ x: 0, y: 0 });

  const mostrarFeedback = (tipo: 'certo' | 'errado', msg: string) => {
    setFeedback({ visivel: true, tipo, msg });
    feedbackOpacity.setValue(0);
    Animated.timing(feedbackOpacity, {
      toValue: 1, duration: 200, useNativeDriver: true,
    }).start();
  };

  const processarDecisao = useCallback(async (destino: Destino) => {
    if (processingRef.current || !gameActiveRef.current) return;
    processingRef.current = true;

    const item    = itemRef.current;
    const correto = destino === item.destinoCorreto;
    const novoScore  = scoreRef.current + (correto ? 1 : 0);
    const novasVidas = vidasRef.current - (correto ? 0 : 1);

    if (correto) {
      setScore(novoScore);
      mostrarFeedback('certo', item.explicacao);
    } else {
      setVidas(novasVidas);
      mostrarFeedback('errado', item.explicacao);
    }

    // Verificar fim de jogo
    const ganhou = correto && novoScore >= META;
    const perdeu = !correto && novasVidas <= 0;

    if (ganhou || perdeu) {
      // Recompensa proporcional aos acertos: 80 ecoScore e 30 XP por item certo
      const acertos = ganhou ? novoScore : novoScore; // novoScore já tem o último acerto incluído
      const ecoScoreGanho = acertos * 80;
      const xpGanho       = acertos * 30;
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), {
            ecoScore: increment(ecoScoreGanho),
            xp: increment(xpGanho),
          });
        }
      } catch (e) { console.error(e); }
    }

    setTimeout(() => {
      setFeedback(null);
      feedbackOpacity.setValue(0);
      if (ganhou || perdeu) {
        setGameActive(false);
      } else {
        // Avança para o próximo item da fila (sem repetição)
        const proximoIndex = filaIndexRef.current + 1;
        setFilaIndex(proximoIndex);
        pan.setValue({ x: 0, y: 0 });
        cardScale.setValue(1);
        setTimeout(() => LIXEIRAS.forEach(lx => medirLixeira(lx.destino)), 100);
      }
      processingRef.current = false;
    }, 2000);
  }, []);

  // PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        if (cardRef.current) {
          (cardRef.current as any).measure(
            (_fx: number, _fy: number, _w: number, _h: number, px: number, py: number) => {
              cardOrigin.current = { x: px, y: py };
            }
          );
        }
        LIXEIRAS.forEach(lx => medirLixeira(lx.destino));
        return true;
      },
      onPanResponderGrant: () => {
        Animated.spring(cardScale, { toValue: 1.06, useNativeDriver: true }).start();
      },
      onPanResponderMove: (_, gs) => {
        pan.setValue({ x: gs.dx, y: gs.dy });
        const cx = cardOrigin.current.x + gs.dx + 100;
        const cy = cardOrigin.current.y + gs.dy + 80;
        const hover = verificarColisao(cx, cy);
        setLixeiraAtiva(hover);
      },
      onPanResponderRelease: (_, gs) => {
        const cx = cardOrigin.current.x + gs.dx + 100;
        const cy = cardOrigin.current.y + gs.dy + 80;
        const destino = verificarColisao(cx, cy);

        Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }).start();
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
        setLixeiraAtiva(null);

        if (destino) {
          processarDecisao(destino);
        }
      },
    })
  ).current;

  const reiniciar = () => {
    processingRef.current = false;
    setScore(0);
    setVidas(3);
    setFeedback(null);
    feedbackOpacity.setValue(0);
    setGameActive(true);
    setLixeiraAtiva(null);
    pan.setValue({ x: 0, y: 0 });
    cardScale.setValue(1);
    // Nova fila embaralhada ao reiniciar
    setFila(gerarFila());
    setFilaIndex(0);
    setTimeout(() => LIXEIRAS.forEach(lx => medirLixeira(lx.destino)), 200);
  };

  // --------------------------------------------------------------------------
  // Tela de Fim de Jogo
  // --------------------------------------------------------------------------
  if (!gameActive) {
    const venceu = score >= META;
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.endScreen}>
          <Text style={styles.endEmoji}>{venceu ? '🏆' : '♻️'}</Text>
          <Text style={styles.endTitle}>
            {venceu ? 'Parabéns!' : 'Fim de jogo'}
          </Text>
          <Text style={styles.endSubtitle}>
            {venceu
              ? `Você classificou ${META} resíduos corretamente.`
              : `Você classificou ${score} resíduo${score !== 1 ? 's' : ''} corretamente.`}
          </Text>

          <View style={styles.finalScoreCard}>
            <Text style={styles.finalScoreTag}>Pontuação</Text>
            <Text style={styles.finalScoreVal}>{score}</Text>
            {score > 0 && (
              <Text style={styles.finalBonus}>
                +{score * 80} EcoScore · +{score * 30} XP
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={reiniciar}>
            <Text style={styles.btnPrimaryText}>Jogar novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()}>
            <Text style={styles.btnSecondaryText}>← Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------------------
  // Tela Principal do Jogo
  // --------------------------------------------------------------------------
  const draggable = gameActive && !feedback;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(score / META) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{score}/{META}</Text>
        </View>
        <View style={styles.vidasRow}>
          {[...Array(3)].map((_, i) => (
            <Text key={i} style={{ fontSize: 14, opacity: i < vidas ? 1 : 0.15 }}>❤️</Text>
          ))}
        </View>
      </View>

      {/* Instrução */}
      <Text style={styles.instrucao}>Arraste para a lixeira correta</Text>

      {/* Card Arrastável */}
      <View style={styles.cardArea}>
        <Animated.View
          ref={cardRef as any}
          style={[
            styles.itemCard,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: cardScale },
              ],
            },
          ]}
          {...(draggable ? panResponder.panHandlers : {})}
        >
          <Text style={styles.itemEmoji}>{itemAtual.emoji}</Text>
          <Text style={styles.itemName}>{itemAtual.nome}</Text>
          <View style={styles.condicaoBadge}>
            <Text style={styles.condicaoText}>{itemAtual.condicao}</Text>
          </View>
          <Text style={styles.dragHint}>arraste ↕</Text>
        </Animated.View>
      </View>

      {/* Feedback */}
      {feedback && (
        <Animated.View
          style={[
            styles.feedbackBanner,
            {
              borderLeftColor: feedback.tipo === 'certo' ? '#16A34A' : '#DC2626',
              opacity: feedbackOpacity,
            },
          ]}
        >
          <Text style={[
            styles.feedbackTitle,
            { color: feedback.tipo === 'certo' ? '#16A34A' : '#DC2626' },
          ]}>
            {feedback.tipo === 'certo' ? '✓ Correto!' : '✕ Incorreto'}
          </Text>
          <Text style={styles.feedbackMsg}>{feedback.msg}</Text>
        </Animated.View>
      )}

      {/* Lixeiras */}
      <View style={styles.lixeirasRow}>
        {LIXEIRAS.map((lx) => {
          const ativa = lixeiraAtiva === lx.destino;
          return (
            <View
              key={lx.destino}
              ref={ref => { lixeiraViewRefs.current[lx.destino] = ref; }}
              onLayout={() => medirLixeira(lx.destino)}
              style={[
                styles.lixeira,
                {
                  borderColor: ativa ? lx.cor : '#E5E7EB',
                  backgroundColor: ativa ? lx.cor + '12' : '#FAFAFA',
                },
              ]}
            >
              <Text style={styles.lixeiraIcon}>{lx.icon}</Text>
              <Text style={[
                styles.lixeiraLabel,
                { color: ativa ? lx.cor : '#6B7280' },
              ]}>
                {lx.label}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------------
// Estilos — Minimalista / Fundo Branco
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  backBtnText: {
    fontSize: 22,
    color: '#111827',
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  vidasRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // Instrução
  instrucao: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 4,
    marginBottom: 8,
  },

  // Card
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  itemEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  condicaoBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
  },
  condicaoText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  dragHint: {
    fontSize: 11,
    color: '#D1D5DB',
    fontWeight: '500',
  },

  // Feedback
  feedbackBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 3,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  feedbackMsg: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Lixeiras
  lixeirasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 8,
  },
  lixeira: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    alignItems: 'center',
  },
  lixeiraIcon: {
    fontSize: 26,
    marginBottom: 5,
  },
  lixeiraLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Fim de jogo
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  endEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  endTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  endSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  finalScoreCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
  },
  finalScoreTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  finalScoreVal: {
    fontSize: 72,
    fontWeight: '900',
    color: '#111827',
  },
  finalBonus: {
    fontSize: 13,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 6,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#111827',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    padding: 12,
  },
  btnSecondaryText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
});
