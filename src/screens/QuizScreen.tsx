import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importações do Firebase
import { auth, db } from '../services/firebaseConfig';
import {
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// ============================================================================
// Tipagem das Props e Dados
// ============================================================================
interface QuizScreenProps {
  navigation: any;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// ============================================================================
// Componente Principal: QuizScreen
// ============================================================================
export default function QuizScreen({ navigation }: QuizScreenProps) {
  // ============================================================================
  // Dados do Quiz: Perguntas e Respostas com Explicações
  // ============================================================================
  const questions: Question[] = [
    {
      question: 'Qual cor representa a reciclagem de papel?',
      options: ['Verde', 'Azul', 'Amarelo', 'Vermelho'],
      correct: 1,
      explanation:
        'A cor azul é universalmente associada à reciclagem de papel e papelão. O verde é para vidro, o amarelo para metal e o vermelho para plástico.',
    },
    {
      question: 'Qual material demora mais para se decompor?',
      options: ['Papel', 'Casca de banana', 'Plástico', 'Folha'],
      correct: 2,
      explanation:
        'O plástico pode levar centenas de anos para se decompor, enquanto papel, casca de banana e folhas se decompõem em meses ou poucos anos.',
    },
    {
      question: 'O óleo de cozinha deve ser descartado:',
      options: ['Na pia', 'No vaso', 'Em pontos de coleta', 'Na rua'],
      correct: 2,
      explanation:
        'O descarte correto do óleo de cozinha é em pontos de coleta específicos. Descartá-lo na pia ou no vaso sanitário pode entupir encanamentos e poluir a água. Na rua, contamina o solo e a água.',
    },
    {
      question: 'Qual desses pode ser reciclado?',
      options: ['Garrafa PET', 'Resto de comida', 'Guardanapo usado', 'Fralda'],
      correct: 0,
      explanation:
        'Garrafas PET são recicláveis e podem ser transformadas em novos produtos. Restos de comida e guardanapos usados são resíduos orgânicos ou contaminados, e fraldas são resíduos sanitários, não recicláveis.',
    },
    {
      question: 'Reciclar ajuda a:',
      options: ['Aumentar lixo', 'Poluir rios', 'Preservar recursos', 'Desmatar'],
      correct: 2,
      explanation:
        'A reciclagem ajuda a preservar recursos naturais, pois diminui a necessidade de extrair novas matérias-primas. Também reduz a quantidade de lixo em aterros e a poluição.',
    },
  ];

  // ============================================================================
  // Estados do Componente
  // ============================================================================
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);

  // Animações
  const progressAnim = useRef(new Animated.Value(0)).current;
  const explanationModalAnim = useRef(new Animated.Value(height)).current;

  // ============================================================================
  // Efeitos Colaterais (Hooks useEffect)
  // ============================================================================

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIdx + 1) / questions.length,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [currentIdx, questions.length, progressAnim]);

  useEffect(() => {
    if (showExplanation) {
      Animated.spring(explanationModalAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(explanationModalAnim, {
        toValue: height,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [showExplanation, explanationModalAnim]);

  // ============================================================================
  // Funções de Lógica do Quiz
  // ============================================================================

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
    setIsCorrectAnswer(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setShowExplanation(true);
    }, 800);
  }

  function handleContinue() {
    setShowExplanation(false);
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setIsAnswered(false);
        setSelectedOption(null);
        setIsCorrectAnswer(null);
      } else {
        // Usa o callback do setState para garantir o valor mais atualizado do score
        setScore(prev => {
          handleFinish(prev);
          return prev;
        });
      }
    }, 300);
  }

  function restart() {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setShowExplanation(false);
    setIsCorrectAnswer(null);
    progressAnim.setValue(0);
  }

  // ============================================================================
  // Renderização da Tela de Resultados
  // ============================================================================
  if (isFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.resultContainer}>
          <Icon name="trophy-award" size={80} color="#FFD700" style={styles.resultIcon} />
          <Text style={styles.resultTitle}>{'Quiz Concluído!'}</Text>
          <Text style={styles.resultSubtitle}>
            {'Você completou o Quiz Eco com sucesso!'}
          </Text>

          <View style={styles.scoreCard}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{`${score}/${questions.length}`}</Text>
              <Text style={styles.scoreLabel}>{'Acertos'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{`+${score * 100}`}</Text>
              <Text style={styles.scoreLabel}>{'EcoScore'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{`+${score * 50}`}</Text>
              <Text style={styles.scoreLabel}>{'XP'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={restart}>
            <Text style={styles.primaryButtonText}>{'Jogar Novamente'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>{'Voltar ao Início'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // Renderização da Tela do Quiz (Perguntas)
  // ============================================================================
  const currentQuestion = questions[currentIdx];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {`Questão ${currentIdx + 1} de ${questions.length}`}
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

            // ✅ Estilo calculado como objeto único — sem push em arrays de estilos
            const optionButtonStyle: ViewStyle = {
              ...styles.optionButton,
              ...(isAnswered && isCorrect
                ? styles.correctOption
                : isAnswered && isSelected
                ? styles.wrongOption
                : isAnswered
                ? { opacity: 0.6 }
                : !isAnswered && isSelected
                ? styles.selectedOption
                : {}),
            };

            const optionTextStyle: TextStyle = {
              ...styles.optionText,
              ...(isAnswered && isCorrect
                ? styles.correctText
                : isAnswered && isSelected
                ? styles.wrongText
                : {}),
            };

            // ✅ Ícone calculado com tipagem segura — nunca vira texto solto
            const showIcon = isAnswered && (isCorrect || isSelected);
            const iconName: string = isCorrect
              ? 'check-circle-outline'
              : 'close-circle-outline';
            const iconColor = '#FFF';

            const optionIndexStyle = {
              ...styles.optionIndex,
              ...(isAnswered && isCorrect ? { backgroundColor: '#FFF' } : {}),
            };

            const optionIndexTextStyle = {
              ...styles.optionIndexText,
              ...(isAnswered && isCorrect ? { color: '#27AE60' } : {}),
            };

            return (
              <TouchableOpacity
                key={index}
                style={optionButtonStyle}
                onPress={() => handleAnswer(index)}
                activeOpacity={0.7}
                disabled={isAnswered}
              >
                <View style={styles.optionRow}>
                  <View style={optionIndexStyle}>
                    <Text style={optionIndexTextStyle}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={optionTextStyle}>{option}</Text>
                  {/* ✅ Usa boolean explícito para evitar renderizar string/número como texto */}
                  {showIcon === true ? (
                    <Icon
                      name={iconName}
                      size={20}
                      color={iconColor}
                      style={styles.optionFeedbackIcon}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modal de Explicação */}
      <Modal
        transparent={true}
        visible={showExplanation}
        onRequestClose={() => {}}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.explanationModalContainer,
              { transform: [{ translateY: explanationModalAnim }] },
            ]}
          >
            <View style={styles.explanationHeader}>
              <Icon
                name={isCorrectAnswer === true ? 'check-circle' : 'close-circle'}
                size={30}
                color={isCorrectAnswer === true ? '#27AE60' : '#EB5757'}
              />
              <Text
                style={[
                  styles.explanationTitle,
                  { color: isCorrectAnswer === true ? '#27AE60' : '#EB5757' },
                ]}
              >
                {isCorrectAnswer === true ? 'Resposta Correta!' : 'Resposta Incorreta!'}
              </Text>
            </View>
            <ScrollView style={styles.explanationContent}>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>{'Continuar'}</Text>
              <Icon name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// Estilos do Componente
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  progressWrapper: {
    flex: 1,
    marginLeft: 15,
    marginRight: 5,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  questionContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 36,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionIndexText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  } as TextStyle,
  optionFeedbackIcon: {
    marginLeft: 10,
  },
  selectedOption: {
    borderColor: '#27AE60',
    backgroundColor: '#F1F9F4',
  },
  correctOption: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  correctText: {
    color: '#FFF',
  } as TextStyle,
  wrongOption: {
    backgroundColor: '#EB5757',
    borderColor: '#EB5757',
  },
  wrongText: {
    color: '#FFF',
  } as TextStyle,
  // Estilos para a tela de resultados
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F8F9FA',
  },
  resultIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#27AE60',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 15,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  // Estilos para o modal de explicação
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  explanationModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: height * 0.7,
    width: '100%',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  explanationTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 10,
  },
  explanationContent: {
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
