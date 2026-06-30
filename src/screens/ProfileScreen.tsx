// ============================================================
// ProfileScreen.tsx
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal, // Usado para criar a caixa de confirmação personalizada
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Importações do Firebase
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

// Biblioteca de Ícones (Padrão no Expo)
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// -------------------------------------------------------
// Tipagem dos dados que vêm do Firestore
// -------------------------------------------------------
interface UserData {
  ecoScore: number;
  xp: number;
  missionsDone: number;
}

export default function ProfileScreen() {
  // Hook de navegação para mudar de tela
  const navigation = useNavigation<any>();

  // Estados para armazenar os dados do usuário e controlar o carregamento
  const [userData, setUserData] = useState<UserData>({ ecoScore: 0, xp: 0, missionsDone: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado que controla se o Modal de Sair está visível ou não
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Obtém o usuário atualmente logado no Firebase Auth
  const user = auth.currentUser;

  // -------------------------------------------------------
  // Efeito para buscar dados do Firestore em Tempo Real
  // -------------------------------------------------------
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    
    if (!uid) {
      setIsLoading(false);
      return;
    }

    // Cria uma referência ao documento do usuário
    const userRef = doc(db, 'users', uid);

    // Ouve mudanças no banco de dados. Se o XP mudar em outra tela, aqui atualiza sozinho!
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.data() as UserData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao carregar perfil:", error);
      setIsLoading(false);
    });

    // Limpa o "ouvinte" quando o usuário sai da tela
    return () => unsubscribe();
  }, []);

  const LEVELS = [
  0,
  500,
  1000,
  2000,
  3500,
  5000,
  7000,
  10000,
];

const level =
  LEVELS.filter(levelXp => userData.xp >= levelXp).length;
  // -------------------------------------------------------
  // Função para realizar o Logout definitivo
  // -------------------------------------------------------
  const confirmLogout = async () => {
    setIsLogoutModalVisible(false); // Fecha o modal
    try {
      await signOut(auth); // Desloga do Firebase
      
      // Reseta a navegação para que o usuário não consiga "voltar" para a Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Erro ao fazer logout:', error);
    }
  };

  // Enquanto os dados não chegam, mostra uma rodinha de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* ── MODAL DE CONFIRMAÇÃO ── */}
      <Modal
        animationType="fade" // Aparece suavemente
        transparent={true}    // Fundo semitransparente
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Ícone de Saída no Modal */}
            <View style={styles.modalIconBg}>
              <Ionicons name="log-out" size={40} color="#D32F2F" />
            </View>
            
            <Text style={styles.modalTitle}>Sair da Conta</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja encerrar sua sessão?
            </Text>
            
            {/* Botões do Modal */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmBtnText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Conteúdo da Tela com Scroll (para telas pequenas não cortarem nada) */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Botão de Voltar para a Home */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D6A4F" />
        </TouchableOpacity>

        {/* ── SEÇÃO DO CABEÇALHO (Avatar e Nome) ── */}
        <View style={styles.headerSection}>
          {/* Círculo com a Inicial do Nome */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          <Text style={styles.userName}>{user?.displayName || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Badge de Nível */}
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="trophy" size={16} color="#FFD600" />
            <Text style={styles.levelBadgeText}>Eco Guardião • Nível {level}</Text>
          </View>
        </View>

        {/* ── GRID DE ESTATÍSTICAS (EcoScore e XP) ── */}
        <View style={styles.statsGrid}>
          {/* Card EcoScore */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="leaf" size={24} color="#2D6A4F" />
            </View>
            <Text style={styles.statValue}>{userData.ecoScore}</Text>
            <Text style={styles.statLabel}>EcoScore</Text>
          </View>

          {/* Card XP Total */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFF8E1' }]}>
              <MaterialCommunityIcons name="star" size={24} color="#FFA000" />
            </View>
            <Text style={styles.statValue}>{userData.xp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
        </View>

        {/* ── SEÇÃO DE IMPACTO ACUMULADO ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Seu Impacto no Planeta</Text>
          
          <View style={styles.impactRow}>
            {/* Itens Reciclados */}
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="recycle" size={32} color="#2D6A4F" />
              <Text style={styles.impactValue}>{userData.missionsDone}</Text>
              <Text style={styles.impactLabel}>Itens</Text>
            </View>
            
            {/* Água Economizada */}
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="water" size={32} color="#1976D2" />
              <Text style={styles.impactValue}>{userData.missionsDone * 50}L</Text>
              <Text style={styles.impactLabel}>Água</Text>
            </View>
            
            {/* CO2 Evitado */}
            <View style={styles.impactItem}>
              <MaterialCommunityIcons name="molecule-co2" size={32} color="#455A64" />
              <Text style={styles.impactValue}>{userData.missionsDone * 2}kg</Text>
              <Text style={styles.impactLabel}>CO₂</Text>
            </View>
          </View>
        </View>

        {/* ── BOTÃO DE LOGOUT (Encerrar Sessão) ── */}
        <TouchableOpacity 
          style={styles.logoutFullButton} 
          onPress={() => setIsLogoutModalVisible(true)}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFF" style={{marginRight: 10}} />
          <Text style={styles.logoutFullButtonText}>Encerrar Sessão</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------
// ESTILIZAÇÃO (CSS-in-JS)
// -------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Cor de fundo cinza bem clarinho
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2E7D32', // Verde escuro
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#2D6A4F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 15,
    marginTop: 0,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  userEmail: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
    gap: 8,
  },
  levelBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statIconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    marginBottom: 30,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 25,
    textAlign: 'center',
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 10,
  },
  impactLabel: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  logoutFullButton: {
    backgroundColor: '#D32F2F', // Vermelho para logout
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#D32F2F',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoutFullButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* ESTILOS DO MODAL PERSONALIZADO */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Escurece o fundo
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
  },
  modalIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#495057',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
});