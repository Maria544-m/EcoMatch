// ============================================================================
// RewardsScreen.tsx - EcoMatch V4
// PARTE 1/2
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {
  MaterialCommunityIcons,
  Ionicons,
} from '@expo/vector-icons';

import { auth, db } from '../services/firebaseConfig';

import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

// ============================================================================
// TIPOS
// ============================================================================

interface UserData {
  id: string;
  name: string;
  xp: number;
  ecoScore: number;
  role?: string;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function RewardsScreen({
  navigation,
}: any) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUid =
    auth.currentUser?.uid;

  // ==========================================================================
  // CARREGAR RANKING
  // ==========================================================================

  useEffect(() => {
    async function loadUsers() {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('xp', 'desc')
        );

        const snap = await getDocs(q);

        const ranking: UserData[] = [];

        snap.forEach(doc => {
          const d = doc.data();

          const role = String(
            d.role || ''
          ).toLowerCase();

          const email = String(
            d.email || ''
          ).toLowerCase();

          const isAdmin =
            role.includes('admin') ||
            role === 'administrator' ||
            role === 'moderator' ||
            d.isAdmin === true ||
            email === 'admin@admin.com';

          if (isAdmin) return;

          ranking.push({
            id: doc.id,
            name: d.name || 'Usuário',
            xp: d.xp || 0,
            ecoScore: d.ecoScore || 0,
          });
        });

        setUsers(ranking);
      } catch (error) {
        console.log(
          'Erro ao carregar ranking:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#2E7D32"
        />

        <Text style={styles.loadingText}>
          Carregando ranking...
        </Text>
      </View>
    );
  }

  // ==========================================================================
  // DADOS
  // ==========================================================================

  const me = users.find(
    user => user.id === currentUid
  );

  const top3 = users.slice(0, 3);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.headerContainer}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#2D6A4F"
          />
        </TouchableOpacity>

        <View style={{ width: 40 }} />

      </View>

      {/* ================================================= */}
      {/* TOP RECICLADORES */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Top Recicladores
      </Text>

      {/* ================================================= */}
      {/* PÓDIO */}
      {/* ================================================= */}

      <View style={styles.podiumContainer}>

        {/* SEGUNDO */}

        <View
          style={[
            styles.podiumCard,
            styles.silverCard,
          ]}
        >
          <MaterialCommunityIcons
            name="medal"
            size={34}
            color="#9E9E9E"
          />

          <Text
            style={styles.podiumName}
            numberOfLines={1}
          >
            {top3[1]?.name || '-'}
          </Text>

          <Text style={styles.podiumXp}>
            {top3[1]?.xp || 0} XP
          </Text>

          <Text style={styles.positionBadge}>
            #2
          </Text>
        </View>

        {/* PRIMEIRO */}

        <View
          style={[
            styles.podiumCard,
            styles.goldCard,
          ]}
        >
          <MaterialCommunityIcons
            name="crown"
            size={42}
            color="#F9A825"
          />

          <Text
            style={styles.firstPlaceName}
            numberOfLines={1}
          >
            {top3[0]?.name || '-'}
          </Text>

          <Text style={styles.firstPlaceXp}>
            {top3[0]?.xp || 0} XP
          </Text>

          <Text style={styles.firstBadge}>
            #1
          </Text>
        </View>

        {/* TERCEIRO */}

        <View
          style={[
            styles.podiumCard,
            styles.bronzeCard,
          ]}
        >
          <MaterialCommunityIcons
            name="medal"
            size={34}
            color="#8D6E63"
          />

          <Text
            style={styles.podiumName}
            numberOfLines={1}
          >
            {top3[2]?.name || '-'}
          </Text>

          <Text style={styles.podiumXp}>
            {top3[2]?.xp || 0} XP
          </Text>

          <Text style={styles.positionBadge}>
            #3
          </Text>
        </View>

      </View>

      {/* ================================================= */}
      {/* RANKING */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Ranking Completo
      </Text>

      {users.slice(0, 10).map(
        (user, index) => (
          <View
            key={user.id}
            style={[
              styles.rankCard,
              user.id === currentUid &&
                styles.currentUserCard,
            ]}
          >
            <View style={styles.rankLeft}>

              <Text style={styles.rankNumber}>
                #{index + 1}
              </Text>

              <Text
                style={styles.rankUser}
                numberOfLines={1}
              >
                {user.name}
              </Text>

            </View>

            <View style={styles.rankRight}>

              <MaterialCommunityIcons
                name="leaf"
                size={18}
                color="#2E7D32"
              />

              <Text style={styles.rankScore}>
                {user.xp}
              </Text>

            </View>
          </View>
        )
      )}

      {/* ================================================= */}
      {/* CONQUISTAS */}
      {/* ================================================= */}

      <Text style={styles.sectionTitle}>
        Conquistas
      </Text>

      <View style={styles.badgesContainer}>

        <View style={styles.badgeCard}>
          <MaterialCommunityIcons
            name="recycle"
            size={34}
            color="#2E7D32"
          />

          <Text style={styles.badgeText}>
            Primeiro Descarte
          </Text>
        </View>

        <View style={styles.badgeCard}>
          <MaterialCommunityIcons
            name="leaf"
            size={34}
            color="#2E7D32"
          />

          <Text style={styles.badgeText}>
            EcoScore {me?.ecoScore || 0}
          </Text>
        </View>

        <View style={styles.badgeCard}>
          <MaterialCommunityIcons
            name="star-circle"
            size={34}
            color="#2E7D32"
          />

          <Text style={styles.badgeText}>
            Membro Eco
          </Text>
        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  // =================================================
  // CONTAINER
  // =================================================

  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },

  // =================================================
  // LOADING
  // =================================================

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8F7',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#bccdbd',
  },

  // =================================================
  // HEADER
  // =================================================

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  // =================================================
  // TITULOS
  // =================================================

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
    marginTop: 8,
  },

  // =================================================
  // PODIO
  // =================================================

  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 35,
  },

  podiumCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 22,
    padding: 14,
    marginHorizontal: 4,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  goldCard: {
    backgroundColor: '#FFF8E1',
    minHeight: 185,
  },

  silverCard: {
    backgroundColor: '#ECEFF1',
    minHeight: 150,
  },

  bronzeCard: {
    backgroundColor: '#EFEBE9',
    minHeight: 135,
  },

  firstPlaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },

  firstPlaceXp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 6,
  },

  firstBadge: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#F9A825',
    fontSize: 15,
  },

  podiumName: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },

  podiumXp: {
    marginTop: 6,
    color: '#2E7D32',
    fontWeight: '600',
  },

  positionBadge: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#666',
  },

  // =================================================
  // RANKING
  // =================================================

  rankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: 18,
    padding: 16,

    marginBottom: 10,

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  currentUserCard: {
    borderWidth: 2,
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },

  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rankNumber: {
    width: 45,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2E7D32',
  },

  rankUser: {
    flex: 1,
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },

  rankRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rankScore: {
    marginLeft: 6,
    fontWeight: 'bold',
    color: '#2E7D32',
    fontSize: 15,
  },

  // =================================================
  // CONQUISTAS
  // =================================================

  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 40,
  },

  badgeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  badgeText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },

});