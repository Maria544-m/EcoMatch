// ============================================================
// GameScreen.tsx
// Tela do mini-jogo "Eco Caminho"
// O jogador deve classificar resíduos na lixeira correta.
// Acerta 10 vezes para vencer | Erra 5 vezes para perder
// Vitória concede +500 EcoScore e +200 XP no Firestore
// ============================================================

import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

// Importa autenticação e banco de dados configurados no projeto
import { auth, db } from '../services/firebaseConfig';

import {
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

// -------------------------------------------------------
// Tipagem de cada item do jogo
// -------------------------------------------------------
interface GameItem {
  item: string;    // Descrição do resíduo com emoji
  correct: string; // Cor da lixeira correta para esse resíduo
}

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface GameScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Componente principal do mini-jogo Eco Caminho
// -------------------------------------------------------
export default function GameScreen({ navigation }: GameScreenProps) {

  // Lista de itens do jogo com o resíduo e sua lixeira correta
  // Baseada na separação seletiva padrão brasileira de cores
  const items: GameItem[] = [
    { item: '🧴 Garrafa PET',          correct: 'Vermelha' },
    { item: '📄 Jornal',               correct: 'Azul'     },
    { item: '🥫 Lata de Alumínio',     correct: 'Amarela'  },
    { item: '🍾 Garrafa de Vidro',     correct: 'Verde'    },
    { item: '🧴 Embalagem Plástica',   correct: 'Vermelha' },
    { item: '📦 Caixa de Papelão',     correct: 'Azul'     },
    { item: '🥫 Lata de Refrigerante', correct: 'Amarela'  },
    { item: '🍷 Pote de Vidro',        correct: 'Verde'    },
  ];

  // Função auxiliar que retorna um item aleatório da lista
  function getRandomItem(): GameItem {
    return items[Math.floor(Math.random() * items.length)];
  }

  // Estado que armazena o item sendo exibido ao jogador no momento
  const [currentItem, setCurrentItem] = useState<GameItem>(getRandomItem);

  // Estado com a pontuação atual — meta: atingir 10 pontos para vencer
  const [score, setScore] = useState(0);

  // Estado com o número de erros — limite: 5 erros encerram o jogo
  const [errors, setErrors] = useState(0);

  // Flags de controle do estado de fim de jogo
  const [gameOverLose, setGameOverLose] = useState(false);
  const [gameOverWin, setGameOverWin] = useState(false);

  // Corações restantes calculados a partir dos erros acumulados
  const hearts = 5 - errors;

  // -------------------------------------------------------
  // Reinicia todos os estados para uma nova partida
  // -------------------------------------------------------
  function resetGame() {
    setScore(0);
    setErrors(0);
    setGameOverLose(false);
    setGameOverWin(false);
    setCurrentItem(getRandomItem());
  }

  // -------------------------------------------------------
  // Sorteia um novo item aleatório para a próxima rodada
  // -------------------------------------------------------
  function nextItem() {
    setCurrentItem(getRandomItem());
  }

  // -------------------------------------------------------
  // Chamada quando o jogador vence (10 acertos)
  // Concede recompensas no Firestore e exibe alerta de vitória
  // -------------------------------------------------------
  async function finishGameWin() {
    try {

      const uid = auth.currentUser?.uid;

      if (uid) {
        // increment() do Firestore soma o valor ao campo existente
        // sem precisar buscar o valor atual antes de atualizar
        await updateDoc(doc(db, 'users', uid), {
          ecoScore: increment(500),
          xp: increment(200),
        });
      }

      setGameOverWin(true);

      // Alerta de vitória com as recompensas recebidas
      Alert.alert(
        '🎆 PARABÉNS 🎆',
        'Você venceu o Eco Caminho!\n\n+500 EcoScore\n+200 XP\n\n🏆 ECO GUARDIÃO',
        [
          {
            text: 'Jogar Novamente',
            onPress: resetGame,
          },
        ]
      );

    } catch (error) {
      console.log('Erro ao salvar vitória:', error);
    }
  }

  // -------------------------------------------------------
  // Chamada quando o jogador perde (5 erros)
  // -------------------------------------------------------
  function finishGameLose() {
    setGameOverLose(true);
  }

  // -------------------------------------------------------
  // Processa a escolha do jogador ao tocar em uma lixeira
  // Verifica acerto ou erro e decide o próximo estado do jogo
  // -------------------------------------------------------
  function choose(color: string) {

    // Ignora toques se o jogo já terminou
    if (gameOverLose || gameOverWin) return;

    if (color === currentItem.correct) {

      // Acerto: incrementa pontuação
      const newScore = score + 1;
      console.log('Pontuação:', newScore);
      setScore(newScore);

      // Verifica se atingiu a meta de vitória
      if (newScore >= 10) {
        finishGameWin();
        return;
      }

    } else {

      // Erro: incrementa contador de erros
      const newErrors = errors + 1;
      setErrors(newErrors);

      // Verifica se atingiu o limite de erros
      if (newErrors >= 5) {
        finishGameLose();
        return;
      }
    }

    // Avança para o próximo item independente de acerto ou erro
    nextItem();
  }

  // -------------------------------------------------------
  // Tela de derrota — exibida quando o jogador erra 5 vezes
  // -------------------------------------------------------
  if (gameOverLose) {
    return (

      <View style={styles.endContainer}>

        <Text style={styles.endTitle}>
          💀 Você perdeu!
        </Text>

        <Text style={styles.endSubtitle}>
          Você errou muitas vezes, mas pode tentar novamente!
        </Text>

        {/* Botão para reiniciar o jogo sem sair da tela */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={resetGame}
        >
          <Text style={styles.retryText}>
            🔁 Tentar novamente
          </Text>
        </TouchableOpacity>

        {/* Botão para retornar à tela anterior */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

      </View>

    );
  }

  // -------------------------------------------------------
  // Tela principal do jogo — exibida enquanto a partida ocorre
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >

      {/* Botão de voltar para a tela anterior */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🚶 Eco Caminho</Text>

      <Text style={styles.subtitle}>
        Leve cada resíduo para a lixeira correta.
      </Text>

      {/* Card de progresso: placar visual + pontuação + corações */}
      <View style={styles.progressCard}>

        <Text style={styles.progressText}>
          🏠 -------- 🚶 -------- ♻️
        </Text>

        <Text style={styles.score}>
          Pontos: {score}/10
        </Text>

        {/*
          Exibe corações cheios (❤️) para vidas restantes
          e corações vazios (🤍) para erros cometidos
        */}
        <Text style={styles.lives}>
          {'❤️'.repeat(hearts)}
          {'🤍'.repeat(errors)}
        </Text>

      </View>

      {/* Card com o resíduo que o jogador deve classificar */}
      <View style={styles.card}>

        <Text style={styles.question}>
          Qual a lixeira correta para:
        </Text>

        <Text style={styles.item}>
          {currentItem.item}
        </Text>

      </View>

      {/*
        Botões de resposta — cada um representa uma cor de lixeira
        A cor de fundo é aplicada inline para correspondência visual
      */}
      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#1976D2' }]}
        onPress={() => choose('Azul')}
      >
        <Text style={styles.optionText}>🟦 Azul (Papel)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#D32F2F' }]}
        onPress={() => choose('Vermelha')}
      >
        <Text style={styles.optionText}>🟥 Vermelha (Plástico)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#FBC02D' }]}
        onPress={() => choose('Amarela')}
      >
        <Text style={styles.optionText}>🟨 Amarela (Metal)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: '#2E7D32' }]}
        onPress={() => choose('Verde')}
      >
        <Text style={styles.optionText}>🟩 Verde (Vidro)</Text>
      </TouchableOpacity>

    </ScrollView>

  );
}

// ============================================================
// Estilos do componente utilizando StyleSheet do React Native
// ============================================================
const styles = StyleSheet.create({

  // Container principal com scroll (evita overflow em telas pequenas)
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    padding: 20,
  },

  // Botão de voltar posicionado no topo da tela
  backButton: {
    marginTop: 50,
    marginBottom: 20,
  },

  // Texto do botão de voltar (reutilizado na tela de derrota)
  backText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Título do jogo centralizado
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },

  // Subtítulo com instrução do jogo
  subtitle: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 10,
    marginBottom: 25,
  },

  // Card de progresso com placar e corações
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },

  // Representação visual do caminho percorrido
  progressText: {
    fontSize: 24,
    marginBottom: 10,
  },

  // Pontuação atual do jogador
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Linha de corações (vidas restantes e erros)
  lives: {
    marginTop: 10,
    fontSize: 24,
  },

  // Card que exibe o resíduo a ser classificado
  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },

  // Texto da pergunta
  question: {
    fontSize: 18,
    color: '#616161',
  },

  // Resíduo em destaque para o jogador classificar
  item: {
    marginTop: 15,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },

  // Botão de opção de lixeira (cor aplicada dinamicamente)
  option: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
  },

  // Texto dentro dos botões de opção
  optionText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Container centralizado da tela de derrota
  endContainer: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Título da tela de derrota em vermelho
  endTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
  },

  // Mensagem motivacional da tela de derrota
  endSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#616161',
  },

  // Botão de tentar novamente
  retryButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  // Texto do botão de tentar novamente
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

});