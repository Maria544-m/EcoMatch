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

export default function AdminEcoPoints() {
  const [ecoPoint, setEcoPoint] = useState('');
  const [ecoPoints, setEcoPoints] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadEcoPoints() {
    const querySnapshot = await getDocs(
      collection(db, 'ecoPoints')
    );

    const data: any[] = [];

    querySnapshot.forEach((document) => {
      data.push({
        id: document.id,
        ...document.data(),
      });
    });

    setEcoPoints(data);
  }

  useEffect(() => {
    loadEcoPoints();
  }, []);

  async function saveEcoPoint() {
    if (!ecoPoint.trim()) {
      Alert.alert('Atenção', 'Digite um EcoPonto.');
      return;
    }

    try {
      if (editingId) {
        await updateDoc(
          doc(db, 'ecoPoints', editingId),
          {
            name: ecoPoint,
          }
        );

        Alert.alert(
          'Sucesso',
          'EcoPonto atualizado!'
        );

        setEditingId(null);
      } else {
        await addDoc(
          collection(db, 'ecoPoints'),
          {
            name: ecoPoint,
            createdAt: new Date(),
          }
        );

        Alert.alert(
          'Sucesso',
          'EcoPonto criado!'
        );
      }

      setEcoPoint('');
      loadEcoPoints();
    } catch (error) {
      console.log(error);
      Alert.alert('Erro ao salvar.');
    }
  }

  async function deleteEcoPoint(id: string) {
    Alert.alert(
      'Excluir',
      'Deseja excluir este EcoPonto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteDoc(
              doc(db, 'ecoPoints', id)
            );

            Alert.alert(
              'Sucesso',
              'EcoPonto excluído!'
            );

            loadEcoPoints();
          },
        },
      ]
    );
  }

  function editEcoPoint(item: any) {
    setEcoPoint(item.name);
    setEditingId(item.id);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        📍 Gerenciar EcoPontos
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do EcoPonto"
        value={ecoPoint}
        onChangeText={setEcoPoint}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveEcoPoint}
      >
        <Text style={styles.buttonText}>
          {editingId ? 'Atualizar' : 'Salvar'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={ecoPoints}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {item.name}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editEcoPoint(item)}
              >
                <Text style={styles.actionText}>
                  Editar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  deleteEcoPoint(item.id)
                }
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
    textAlign: 'center',
    marginBottom: 20,
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