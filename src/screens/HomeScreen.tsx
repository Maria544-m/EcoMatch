// ============================================================
// HomeScreen.tsx
// Tela principal do aplicativo exibida após o login
// Mostra EcoScore, XP, nível, missões do dia, impacto
// ambiental do usuário e acesso aos mini-jogos
// ============================================================

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// Importa autenticação e banco de dados configurados no projeto
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// -------------------------------------------------------
// Tipagem das props de navegação recebidas pelo componente
// -------------------------------------------------------
interface HomeScreenProps {
  navigation: any;
}

// -------------------------------------------------------
// Componente principal da tela Home
// -------------------------------------------------------
export default function HomeScreen({ navigation }: HomeScreenProps) {

  // Estados com os dados do perfil do usuário carregados do Firestore
  const [ecoScore, setEcoScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [missionsDone, setMissionsDone] = useState(0);

  // Extrai o primeiro nome do displayName para saudação personalizada
  const fullName = auth.currentUser?.displayName || 'Usuário';
  const firstName = fullName.split(' ')[0];

  // -------------------------------------------------------
  // Busca os dados do usuário no Firestore ao montar a tela
  // -------------------------------------------------------
  useEffect(() => {

    async function loadUserData() {

      const uid = auth.currentUser?.uid;

      // Interrompe se o usuário não estiver autenticado
      if (!uid) return;

      try {

        // Referência ao documento do usuário na coleção 'users'
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {

          const data = snapshot.data();

          // Atualiza os estados com os dados do Firestore
          // Usa ?? para garantir 0 como fallback seguro para números
          setEcoScore(data.ecoScore ?? 0);
          setXp(data.xp ?? 0);
          setMissionsDone(data.missionsDone ?? 0);
        }

      } catch (error) {
        console.log('Erro ao buscar dados:', error);
      }
    }

    loadUserData();

  }, []); // Array vazio = executa apenas uma vez, na montagem

  // Nível calculado com base no XP: a cada 300 XP o usuário sobe um nível
  const level = Math.floor(xp / 300);

  // Percentual de progresso para a barra de XP (meta: 3000 XP)
  const xpProgress = Math.min((xp / 3000) * 100, 100);

  // -------------------------------------------------------
  // Renderização principal da tela
  // -------------------------------------------------------
  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 180 }}
    >

      {/* ── HEADER: saudação personalizada com primeiro nome ── */}
      <View style={styles.header}>

        <View>
          <Text style={styles.greeting}>Olá 👋</Text>
          <Text style={styles.username}>{firstName}</Text>
          <Text style={styles.motivation}>
            Cada atitude conta. Continue fazendo a diferença.
          </Text>
        </View>

        {/* Logo decorativo em emoji */}
        <Text style={styles.logo}>🌱</Text>

      </View>

      {/* ── CARD DE ECOSCORE: pontuação, XP, nível e barra de progresso ── */}
      <View style={styles.scoreCard}>

        <Text style={styles.scoreTitle}>EcoScore</Text>

        {/* Pontuação principal do usuário em destaque */}
        <Text style={styles.score}>{ecoScore}</Text>

        <Text style={styles.todayPoints}>+120 hoje</Text>

        {/* Mensagem motivacional condicional baseada nas missões concluídas */}
        <Text style={styles.scoreText}>
          {missionsDone === 0
            ? 'Vamos cuidar do planeta juntos! Faça suas missões!'
            : 'Você está no caminho certo! 🌱'}
        </Text>

        <Text style={styles.xpText}>
          {xp} XP • Nível {level}
        </Text>

        <Text style={styles.levelTitle}>Eco Guardião</Text>

        {/* Barra de progresso de XP — largura calculada dinamicamente */}
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${xpProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>{xp} / 3000 XP</Text>

      </View>

      {/* ── MISSÕES DO DIA ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Missões do dia</Text>
      </View>

      {/* Cada card representa uma missão disponível para o usuário */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>♻️ Reciclagem</Text>
        <Text style={styles.cardText}>Separe 1 item reciclável</Text>
        <Text style={styles.missionPoints}>+100 pontos • 0/1</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💧 Água</Text>
        <Text style={styles.cardText}>Reduza o tempo no banho</Text>
        <Text style={styles.missionPoints}>+100 pontos • 0/1</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌳 Verde</Text>
        <Text style={styles.cardText}>Compartilhe uma ação sustentável</Text>
        <Text style={styles.missionPoints}>+100 pontos • 0/1</Text>
      </View>

      {/* ── IMPACTO AMBIENTAL: estimativas baseadas nas missões concluídas ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Seu impacto</Text>
      </View>

      <View style={styles.impactCard}>

        {/* Cada linha estima um impacto ambiental positivo do usuário */}
        <Text style={styles.impactText}>
          ♻️ Itens reciclados: {missionsDone}
        </Text>

        <Text style={styles.impactText}>
          🌳 Árvores ajudadas: {Math.floor(missionsDone / 3)}
        </Text>

        <Text style={styles.impactText}>
          💧 Água economizada: {missionsDone * 50} L
        </Text>

        <Text style={styles.impactText}>
          🌍 CO₂ evitado: {missionsDone * 2} kg
        </Text>

      </View>

      {/* ── MINI-JOGOS: acesso rápido aos jogos educativos ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Jogue e Aprenda</Text>
      </View>

      {/* Card do jogo Eco Caminho — o card inteiro é clicável */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.cardTitle}>🎮 Separação Correta</Text>
        <Text style={styles.cardText}>
          Leve o lixo até a lixeira correta e ganhe pontos!
        </Text>
        <Text style={styles.playButton}>Jogar Agora ▶</Text>
      </TouchableOpacity>

      {/* Card do Quiz Eco — botão interno para navegação */}
      <View style={styles.card}>

        <Text style={styles.cardTitle}>🧠 Quiz Eco</Text>

        <Text style={styles.cardText}>
          Teste seus conhecimentos sobre reciclagem!
        </Text>

        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate('Quiz')}
        >
          <Text style={styles.quizButtonText}>Jogar Agora</Text>
        </TouchableOpacity>

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

  // Header com saudação e logo, dispostos em linha
  header: {
    marginTop: 50,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Texto "Olá 👋" em cinza suave
  greeting: {
    fontSize: 18,
    color: '#757575',
  },

  // Primeiro nome do usuário em verde e negrito
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },

  // Frase motivacional abaixo do nome
  motivation: {
    marginTop: 5,
    color: '#757575',
    fontSize: 14,
    width: 220,
  },

  // Emoji decorativo de folha no canto direito do header
  logo: {
    fontSize: 50,
  },

  // Card verde escuro que destaca o EcoScore do usuário
  scoreCard: {
    backgroundColor: '#2E7D32',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
  },

  scoreTitle: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  // Número do EcoScore em grande destaque
  score: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  // Pontos ganhos no dia em amarelo
  todayPoints: {
    color: '#FBC02D',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Mensagem motivacional condicional
  scoreText: {
    color: '#E8F5E9',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },

  // Linha com XP e nível do usuário
  xpText: {
    marginTop: 10,
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '600',
  },

  // Título do nível (ex: "Eco Guardião")
  levelTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Fundo cinza claro da barra de progresso de XP
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginTop: 12,
  },

  // Preenchimento amarelo da barra — largura aplicada dinamicamente
  progressFill: {
    height: 10,
    backgroundColor: '#FBC02D',
    borderRadius: 10,
  },

  // Texto com o valor de XP atual vs meta
  progressText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 13,
  },

  // Cabeçalho de cada seção da tela
  sectionHeader: {
    marginTop: 10,
  },

  // Título das seções (Missões, Impacto, Jogos)
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 15,
  },

  // Card branco genérico reutilizado em missões e jogos
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  // Título do card em verde
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },

  // Texto descritivo do card em cinza
  cardText: {
    color: '#616161',
    fontSize: 15,
  },

  // Pontuação e progresso da missão em verde claro
  missionPoints: {
    marginTop: 10,
    color: '#43A047',
    fontWeight: 'bold',
  },

  // Card verde claro para exibir o impacto ambiental
  impactCard: {
    backgroundColor: '#E8F5E9',
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
  },

  // Cada linha de impacto ambiental
  impactText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 10,
    fontWeight: '600',
  },

  // Link/botão de texto para iniciar o jogo Eco Caminho
  playButton: {
    marginTop: 12,
    color: '#1b79cc',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Botão verde para iniciar o Quiz
  quizButton: {
    backgroundColor: '#2E7D32',
    marginTop: 15,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  // Texto do botão do Quiz
  quizButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

});