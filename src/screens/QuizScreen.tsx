// ============================================================================
// QuizScreen.tsx
// Tela do mini-jogo Quiz Eco - Versão Premium & Interativa.
// CORREÇÃO: Tipagem de estilos para evitar erros no VSCode/TypeScript.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  // Adicionadas tipagens explícitas do React Native
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Importações do Firebase
import { auth, db } from '../services/firebaseConfig';
import {
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------------
// Tipagem das Props e Dados
// ----------------------------------------------------------------------------
interface QuizScreenProps {
  navigation: any;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

// ----------------------------------------------------------------------------
// Componente Principal
// ----------------------------------------------------------------------------
export default function QuizScreen({ navigation }: QuizScreenProps) {
  
  const questions: Question[] = [
    {
      question: 'Qual cor representa a reciclagem de papel?',
      options: ['Verde', 'Azul', 'Amarelo', 'Vermelho'],
      correct: 1,
    },
    {
      question: 'Qual material demora mais para se decompor?',
      options: ['Papel', 'Casca de banana', 'Plástico', 'Folha'],
      correct: 2,
    },
    {
      question: 'O óleo de cozinha deve ser descartado:',
      options: ['Na pia', 'No vaso', 'Em pontos de coleta', 'Na rua'],
      correct: 2,
    },
    {
      question: 'Qual desses pode ser reciclado?',
      options: ['Garrafa PET', 'Resto de comida', 'Guardanapo usado', 'Fralda'],
      correct: 0,
    },
    {
      question: 'Reciclar ajuda a:',
      options: ['Aumentar lixo', 'Poluir rios', 'Preservar recursos', 'Desmatar'],
      correct: 2,
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIdx + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentIdx]);

  async function handleFinish(finalScore: number) {
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        await updateDoc(doc(db, 'users', uid), {
          ecoScore: increment(finalScore * 100),
          xp: increment(finalScore * 50),
        });
      }
      setIsFinished(true);
    } catch (error) {
      console.error('Erro ao salvar no Firestore:', error);
      setIsFinished(true);
    }
  }

  function handleAnswer(index: number) {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    const correct = index === questions[currentIdx].correct;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        handleFinish(newScore);
      }
    }, 1200);
  }

  function restart() {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
  }

  if (isFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>🏆</Text>
          <Text style={styles.resultTitle}>Incrível!</Text>
          <Text style={styles.resultSubtitle}>Você completou o Quiz Eco</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{score}/{questions.length}</Text>
              <Text style={styles.scoreLabel}>Acertos</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>+{score * 100}</Text>
              <Text style={styles.scoreLabel}>EcoScore</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={restart}>
            <Text style={styles.primaryButtonText}>Jogar Novamente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })}
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Questão {currentIdx + 1} de {questions.length}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correct;
            const isSelected = selectedOption === index;
            
            // ----------------------------------------------------------------
            // CORREÇÃO DE TIPAGEM: Definindo tipos explicitamente para o TS
            // ----------------------------------------------------------------
            let optionStyle: StyleProp<ViewStyle> = styles.optionButton;
            let textStyle: StyleProp<TextStyle> = styles.optionText;

            if (isAnswered) {
              if (isCorrect) {
                optionStyle = [styles.optionButton, styles.correctOption];
                textStyle = [styles.optionText, styles.correctText];
              } else if (isSelected) {
                optionStyle = [styles.optionButton, styles.wrongOption];
                textStyle = [styles.optionText, styles.wrongText];
              } else {
                optionStyle = [styles.optionButton, { opacity: 0.5 }];
              }
            } else if (isSelected) {
              optionStyle = [styles.optionButton, styles.selectedOption];
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswer(index)}
                activeOpacity={0.7}
                disabled={isAnswered}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.optionIndex, isAnswered && isCorrect && { backgroundColor: '#FFF' }]}>
                    <Text style={[styles.optionIndexText, isAnswered && isCorrect && { color: '#27AE60' }]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={textStyle}>{option}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: { width: 40, 
    height: 40, 
    justifyContent: 'center' 
  },
  backIcon: { 
    fontSize: 20, 
    color: '#333', 
    fontWeight: '300'
  },
  progressWrapper: {
    flex: 1, 
    marginLeft: 10 
  },
  progressBarBg: { 
    height: 8, 
    backgroundColor: '#F0F0F0', 
    borderRadius: 4,
    overflow: 'hidden' 
  },
  progressBarFill: { 
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 4 
  },
  progressText: { 
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    fontWeight: '600'
  },
  content: { 
    flex: 1,
    paddingHorizontal: 24, 
    justifyContent: 'center' 
  },
  questionContainer: { 
    marginBottom: 40 
  },
  questionText: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1A1A1A', 
    lineHeight: 36 
  },
  optionsContainer: { 
    gap: 12 
  },
  optionButton: { 
    backgroundColor: '#F8F9FA', 
    padding: 18, borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  optionRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  optionIndex: { 
    width: 30, 
    height: 30, 
    borderRadius: 10, 
    backgroundColor: '#E9ECEF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  optionIndexText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#495057' 
  },
  optionText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    flex: 1 
  },
  selectedOption: { 
    borderColor: '#27AE60', 
    backgroundColor: '#F1F9F4'
  },
  correctOption: { 
    backgroundColor: '#27AE60', 
    borderColor: '#27AE60' 
  },
  correctText: { 
    color: '#FFF'
  },
  wrongOption: { 
    backgroundColor: '#EB5757', 
    borderColor: '#EB5757' 
  },
  wrongText: { 
    color: '#FFF' 
  },
  resultContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 30 
  },
  resultEmoji: { 
    fontSize: 80,
    marginBottom: 20 
  },
  resultTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1A1A1A' 
  },
  resultSubtitle: {
    fontSize: 16, 
    color: '#666', 
    marginBottom: 40 
  },
  scoreCard: { 
    flexDirection: 'row', 
    backgroundColor: '#F8F9FA', 
    borderRadius: 24, 
    padding: 24, 
    width: '100%', 
    marginBottom: 40, 
    borderWidth: 1, 
    borderColor: '#EEE'
  },
  scoreItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  scoreValue: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#27AE60' 
  },
  scoreLabel: { 
    fontSize: 12, 
    color: '#888', 
    fontWeight: '600', 
    marginTop: 4 
  },
  verticalDivider: { 
    width: 1, 
    backgroundColor: '#DDD', 
    marginHorizontal: 10 
  },
  primaryButton: { 
    backgroundColor: '#27AE60', 
    paddingVertical: 18, 
    paddingHorizontal: 40,
     borderRadius: 20, 
     width: '100%', 
     alignItems: 'center', 
     marginBottom: 15
  },
  primaryButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  secondaryButton: { 
    paddingVertical: 15,
     width: '100%', 
     alignItems: 'center' 
  },
  secondaryButtonText: { 
    color: '#888', 
    fontSize: 15, 
    fontWeight: '600'
  },
});