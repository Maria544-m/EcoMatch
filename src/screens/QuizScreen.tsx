// ============================================================
// QuizScreen.tsx
// Tela do mini-jogo Quiz Eco
// Apresenta 5 perguntas sobre reciclagem e meio ambiente.
// Ao finalizar, salva EcoScore e XP no Firestore e exibe
// a tela de resultado com a pontuação obtida.
// ============================================================

import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

// Instâncias de autenticação e banco de dados configuradas no projeto
import { auth, db } from '../services/firebaseConfig';

// Funções do Firestore para atualizar o documento do usuário
import {
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface QuizScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Tipagem de cada questão do quiz
// -------------------------------------------------------
interface Question {
  question: string;   // Enunciado da pergunta
  options: string[];  // Lista de alternativas
  correct: number;    // Índice da alternativa correta no array options
}

// -------------------------------------------------------
// Componente principal da tela de Quiz
// -------------------------------------------------------
export default function QuizScreen({ navigation }: QuizScreenProps) {

  // Lista estática de perguntas sobre meio ambiente e reciclagem
  const questions: Question[] = [
    {
      question: 'Qual cor representa a reciclagem de papel?',
      options: ['Verde', 'Azul', 'Amarelo', 'Vermelho'],
      correct: 1, // 'Azul'
    },
    {
      question: 'Qual material demora mais para se decompor?',
      options: ['Papel', 'Casca de banana', 'Plástico', 'Folha'],
      correct: 2, // 'Plástico'
    },
    {
      question: 'O óleo de cozinha deve ser descartado:',
      options: ['Na pia', 'No vaso', 'Em pontos de coleta', 'Na rua'],
      correct: 2, // 'Em pontos de coleta'
    },
    {
      question: 'Qual desses pode ser reciclado?',
      options: ['Garrafa PET', 'Resto de comida', 'Guardanapo usado', 'Fralda'],
      correct: 0, // 'Garrafa PET'
    },
    {
      question: 'Reciclar ajuda a:',
      options: [
        'Aumentar lixo',
        'Poluir rios',
        'Preservar recursos naturais',
        'Desmatar',
      ],
      correct: 2, // 'Preservar recursos naturais'
    },
  ];

  // Índice da pergunta sendo exibida no momento
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Contador de acertos acumulados durante o quiz
  const [hits, setHits] = useState(0);

  // Flag que bloqueia novas respostas após o usuário já ter escolhido
  const [answered, setAnswered] = useState(false);

  // Flag que controla a exibição da tela de resultado final
  const [finished, setFinished] = useState(false);

  // -------------------------------------------------------
  // Salva a pontuação no Firestore e exibe a tela de resultado
  // Chamada quando o usuário responde a última pergunta
  // -------------------------------------------------------
  async function finishQuiz(totalHits: number) {

    try {

      const uid = auth.currentUser?.uid;

      if (uid) {
        // increment() soma o valor ao campo existente no Firestore
        // sem precisar buscar o valor atual antes de atualizar
        await updateDoc(doc(db, 'users', uid), {
          ecoScore: increment(totalHits * 100), // 100 EcoScore por acerto
          xp:       increment(totalHits * 50),  // 50 XP por acerto
        });
      }

      // Ativa a tela de resultado
      setFinished(true);

    } catch (error) {

      console.log('Erro ao salvar pontuação do quiz:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar sua pontuação.'
      );
    }
  }

  // -------------------------------------------------------
  // Processa a resposta do usuário ao tocar em uma alternativa
  // Aplica feedback visual e avança para a próxima pergunta
  // -------------------------------------------------------
  function answer(index: number) {

    // Ignora toques se o usuário já respondeu esta pergunta
    if (answered) return;

    const isCorrect = index === questions[currentQuestion].correct;

    // Bloqueia novas respostas e aciona o feedback de cores
    setAnswered(true);

    // Variável local para acumular acertos sem depender do estado assíncrono
    let newHits = hits;

    if (isCorrect) {
      newHits = hits + 1;
      setHits(newHits);
    }

    /*
      setTimeout aguarda 800ms antes de avançar,
      permitindo que o usuário veja o feedback de cor
      (verde = certo, vermelho = errado) antes de mudar a pergunta
    */
    setTimeout(() => {

      const isLast = currentQuestion === questions.length - 1;

      if (isLast) {
        // Última pergunta: finaliza o quiz e salva no Firestore
        finishQuiz(newHits);
      } else {
        // Avança para a próxima pergunta e libera novas respostas
        setCurrentQuestion(currentQuestion + 1);
        setAnswered(false);
      }

    }, 800);
  }

  // -------------------------------------------------------
  // Reinicia todos os estados para uma nova partida
  // -------------------------------------------------------
  function restartQuiz() {
    setCurrentQuestion(0);
    setHits(0);
    setAnswered(false);
    setFinished(false);
  }

  // -------------------------------------------------------
  // Tela de resultado — exibida após responder todas as perguntas
  // -------------------------------------------------------
  if (finished) {

    return (

      <View style={styles.resultContainer}>

        <Text style={styles.resultTitle}>
          🎉 Quiz Finalizado!
        </Text>

        {/* Resumo de acertos sobre o total de perguntas */}
        <Text style={styles.resultText}>
          Você acertou {hits} de {questions.length} perguntas
        </Text>

        {/* Recompensas recebidas — calculadas com base nos acertos */}
        <Text style={styles.resultPoints}>
          +{hits * 100} EcoScore
        </Text>

        <Text style={styles.resultPoints}>
          +{hits * 50} XP
        </Text>

        {/* Botão para jogar novamente sem sair da tela */}
        <TouchableOpacity
          style={styles.button}
          onPress={restartQuiz}
        >
          <Text style={styles.buttonText}>
            🔁 Tentar novamente
          </Text>
        </TouchableOpacity>

        {/* Link para voltar ao menu anterior */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            ← Voltar ao menu
          </Text>
        </TouchableOpacity>

      </View>

    );
  }

  // -------------------------------------------------------
  // Tela principal do quiz — pergunta atual + alternativas
  // -------------------------------------------------------
  return (

    <ScrollView style={styles.container}>

      {/* Botão de voltar para a tela anterior */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🧠 Quiz Eco</Text>

      {/* Indicador de progresso: pergunta atual / total */}
      <Text style={styles.progress}>
        Pergunta {currentQuestion + 1} / {questions.length}
      </Text>

      <View style={styles.card}>

        {/* Enunciado da pergunta atual */}
        <Text style={styles.question}>
          {questions[currentQuestion].question}
        </Text>

        {/*
          Renderiza uma alternativa para cada opção da pergunta.
          A cor de fundo muda após a resposta:
          - Verde (#A5D6A7) para a alternativa correta
          - Vermelho (#FFCDD2) para as incorretas
          - Verde claro (#E8F5E9) enquanto não respondida
        */}
        {questions[currentQuestion].options.map((option, index) => {

          const isCorrect = index === questions[currentQuestion].correct;

          // Define a cor de fundo com base no estado de resposta
          const backgroundColor = answered
            ? isCorrect
              ? '#A5D6A7' // Verde: alternativa correta
              : '#FFCDD2' // Vermelho: alternativa incorreta
            : '#E8F5E9';  // Verde claro: ainda não respondida

          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, { backgroundColor }]}
              onPress={() => answer(index)}
              disabled={answered} // Desabilita após responder
            >
              <Text style={styles.optionText}>
                {option}
              </Text>
            </TouchableOpacity>
          );

        })}

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

  // Texto de voltar (reutilizado na tela de resultado)
  backText: {
    marginTop: 60,
    marginBottom: 10,
    color: '#1b79cc',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Título do quiz centralizado
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },

  // Indicador de progresso abaixo do título
  progress: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    color: '#757575',
    fontSize: 16,
  },

  // Card branco que contém a pergunta e as alternativas
  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
  },

  // Enunciado da pergunta em verde e negrito
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 25,
  },

  // Botão de cada alternativa — cor aplicada dinamicamente
  option: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  // Texto da alternativa em verde escuro
  optionText: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },

  // Container centralizado da tela de resultado final
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FFF6',
    padding: 20,
  },

  // Título da tela de resultado
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
  },

  // Texto com total de acertos
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },

  // Recompensas de EcoScore e XP em verde escuro
  resultPoints: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1B5E20',
  },

  // Botão de tentar novamente
  button: {
    marginTop: 25,
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 12,
  },

  // Texto do botão de tentar novamente
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

});