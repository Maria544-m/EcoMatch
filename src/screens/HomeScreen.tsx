import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';


// Importação de Ícones do Expo (já inclusos em projetos Expo)
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

// Importa autenticação e banco de dados configurados no projeto
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// -------------------------------------------------------
// Tipagens
// -------------------------------------------------------
interface UserData {
  ecoScore: number;
  xp: number;
  missionsDone: number;
}

type RootStackParamList = {
  Início: undefined;
  Game: undefined;
  Quiz: undefined;
  Perfil: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Início'>;

// -------------------------------------------------------
// Componente Principal
// -------------------------------------------------------
export default function HomeScreen({ navigation }: any) {
  const [userData, setUserData] = useState<UserData>({ ecoScore: 0, xp: 0, missionsDone: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fullName = auth.currentUser?.displayName || 'Eco Amigo';
  const firstName = fullName.split(' ')[0];

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setIsLoading(false);
      return;
    }

    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data() as UserData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro Firebase:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const level = Math.floor(userData.xp / 300);
  const xpNextLevel = 3000;
  const xpProgress = Math.min((userData.xp / xpNextLevel) * 100, 100);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text style={styles.loadingText}>Sincronizando seu progresso...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER FIXO OU SCROLLÁVEL */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* ── SEÇÃO DE BOAS-VINDAS ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Bem-vindo de volta,</Text>
            <Text style={styles.userNameText}>{firstName} ♻️</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Perfil')}
          >
            <Ionicons name="person-circle" size={45} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* ── CARD DE ECOSCORE (DESIGN MODERNO) ── */}
        <View style={styles.mainScoreCard}>
          <View style={styles.scoreHeader}>
            <View>
              <Text style={styles.scoreLabel}>Meu EcoScore</Text>
              <Text style={styles.scoreValue}>{userData.ecoScore}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <MaterialCommunityIcons name="leaf" size={24} color="#FFF" />
              <Text style={styles.badgeText}>Nível {level}</Text>
            </View>
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpInfoRow}>
              <Text style={styles.xpCurrentText}>{userData.xp} XP</Text>
              <Text style={styles.xpTargetText}>{xpNextLevel} XP</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.rankTitle}>Eco Guardião Iniciante</Text>
          </View>
        </View>

        {/* ── GRID DE ATALHOS RÁPIDOS ── */}
        <View style={styles.statsGrid}>
          <View style={styles.miniStatCard}>
            <MaterialCommunityIcons name="recycle" size={24} color="#2D6A4F" />
            <Text style={styles.miniStatValue}>{userData.missionsDone}</Text>
            <Text style={styles.miniStatLabel}>Reciclados</Text>
          </View>
          <View style={styles.miniStatCard}>
            <MaterialCommunityIcons name="water" size={24} color="#2D6A4F" />
            <Text style={styles.miniStatValue}>{userData.missionsDone * 50}L</Text>
            <Text style={styles.miniStatLabel}>Poupados</Text>
          </View>
        </View>

        {/* ── MISSÕES DIÁRIAS ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Missões de Hoje</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>Ver todas</Text></TouchableOpacity>
        </View>

        <View style={styles.missionItem}>
          <View style={[styles.missionIconBox, { backgroundColor: '#E8F5E9' }]}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#2D6A4F" />
          </View>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>Descarte Seletivo</Text>
            <Text style={styles.missionSubtitle}>Separe o plástico do papel</Text>
          </View>
          <View style={styles.missionPointsTag}>
            <Text style={styles.missionPointsText}>+100</Text>
          </View>
        </View>

        <View style={styles.missionItem}>
          <View style={[styles.missionIconBox, { backgroundColor: '#E3F2FD' }]}>
            <MaterialCommunityIcons name="faucet" size={24} color="#1976D2" />
          </View>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>Economia Hídrica</Text>
            <Text style={styles.missionSubtitle}>Banho de no máximo 5 min</Text>
          </View>
          <View style={styles.missionPointsTag}>
            <Text style={styles.missionPointsText}>+150</Text>
          </View>
        </View>

        {/* ── SEÇÃO DE JOGOS (ESTILO BANNER) ── */}
        <Text style={styles.sectionTitleMargin}>Jogue e Ganhe</Text>
        
        <TouchableOpacity 
          style={styles.gameBanner}
          onPress={() => navigation.navigate('Game')}
          activeOpacity={0.9}
        >
          <View style={styles.gameBannerContent}>
            <Text style={styles.gameBannerTitle}>Separação Correta</Text>
            <Text style={styles.gameBannerDesc}>Aprenda a separar o lixo jogando!</Text>
            <View style={styles.playNowBadge}>
              <Text style={styles.playNowText}>JOGAR AGORA</Text>
              <Ionicons name="play-circle" size={18} color="#FFF" />
            </View>
          </View>
          <FontAwesome5 name="gamepad" size={60} color="rgba(255,255,255,0.3)" style={styles.gameIconFloat} />
        </TouchableOpacity>

        <View style={styles.quizCard}>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>Quiz Eco</Text>
            <Text style={styles.quizDesc}>Teste seus conhecimentos sobre reciclagem!</Text>
            <TouchableOpacity 
              style={styles.quizBtn}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Text style={styles.quizBtnText}>Começar Quiz</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="head-lightbulb" size={70} color="#f3f04e" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 16,
    color: '#6C757D',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  profileButton: {
    padding: 5,
  },
  mainScoreCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: 'bold',
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  xpSection: {
    marginTop: 20,
  },
  xpInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpCurrentText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  xpTargetText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#95D5B2',
  },
  rankTitle: {
    color: '#D8F3DC',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 5,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#6C757D',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  sectionTitleMargin: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 25,
    marginBottom: 15,
  },
  seeAllText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  missionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  missionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  missionSubtitle: {
    fontSize: 13,
    color: '#6C757D',
  },
  missionPointsTag: {
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  missionPointsText: {
    color: '#2D6A4F',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameBanner: {
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  gameBannerContent: {
    flex: 1,
    zIndex: 2,
  },
  gameBannerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  gameBannerDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
    width: '70%',
  },
  playNowBadge: {
    backgroundColor: '#2D6A4F',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playNowText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  gameIconFloat: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  quizCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 15,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  quizDesc: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
    marginBottom: 12,
  },
  quizBtn: {
    backgroundColor: '#f3f04e',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  quizBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
});