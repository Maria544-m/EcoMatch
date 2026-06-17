import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from '../../services/firebaseConfig';

export default function AdminMissions() {
  const [mission, setMission] = useState('');
  const [missions, setMissions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadMissions() {
    const querySnapshot = await getDocs(collection(db, 'missions'));

    const data: any[] = [];

    querySnapshot.forEach((document) => {
      data.push({
        id: document.id,
        ...document.data(),
      });
    });

    setMissions(data);
  }

  useEffect(() => {
    loadMissions();
  }, []);

  async function saveMission() {
    if (!mission.trim()) {
      Alert.alert('Atenção', 'Digite uma missão.');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'missions', editingId), {
          title: mission,
        });

        Alert.alert('Sucesso', 'Missão atualizada!');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'missions'), {
          title: mission,
          createdAt: new Date(),
        });

        Alert.alert('Sucesso', 'Missão criada!');
      }

      setMission('');
      loadMissions();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro ao salvar.');
    }
  }

  async function deleteMission(id: string) {
    Alert.alert(
      'Excluir',
      'Deseja realmente excluir esta missão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'missions', id));

            Alert.alert('Sucesso', 'Missão excluída!');
            loadMissions();
          },
        },
      ]
    );
  }

  function editMission(item: any) {
    setMission(item.title);
    setEditingId(item.id);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Gerenciar Missões</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite a missão"
        value={mission}
        onChangeText={setMission}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveMission}
      >
        <Text style={styles.buttonText}>
          {editingId ? 'Atualizar' : 'Salvar'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {item.title}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editMission(item)}
              >
                <Text style={styles.actionText}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteMission(item.id)}
              >
                <Text style={styles.actionText}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FFF6',
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  cardText: {
    fontSize: 16,
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  editButton: {
    backgroundColor: '#1976D2',
    padding: 10,
    borderRadius: 8,
  },

  deleteButton: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
  },

  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});