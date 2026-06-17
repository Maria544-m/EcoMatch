import React, { useState, useEffect, useRef } from 'react';
import { 
  View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, 
  Modal, ScrollView, Linking, Dimensions 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';
import { WasteTypeFilter } from './WasteTypeFilter';

const MapScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  
  const mapRef = useRef<MapView>(null);

  // Função para calcular distância simples entre dois pontos
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Precisamos da sua localização!');
        setLoading(false);
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setLocation(region);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const delayDebounceFn = setTimeout(() => {
        loadPoints();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [location, selectedWasteTypes]);

  const loadPoints = async () => {
    const data = await fetchRecyclingPoints(location.latitude, location.longitude, selectedWasteTypes);
    setPoints(data);

    // --- LÓGICA INTELIGENTE: IR PARA O MAIS PRÓXIMO ---
    if (data.length > 0 && selectedWasteTypes.length > 0) {
      // 1. Encontra o ponto com a menor distância
      let nearest = data[0];
      let minDistance = getDistance(location.latitude, location.longitude, data[0].lat, data[0].lon);

      data.forEach((p: any) => {
        const d = getDistance(location.latitude, location.longitude, p.lat, p.lon);
        if (d < minDistance) {
          minDistance = d;
          nearest = p;
        }
      });

      // 2. Move o mapa suavemente para o ponto mais próximo
      mapRef.current?.animateToRegion({
        latitude: nearest.lat,
        longitude: nearest.lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);

      // 3. Abre automaticamente as informações desse ponto
      setSelectedPoint(nearest);
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedWasteTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const openGps = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    Linking.openURL(url );
  };

  if (loading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Localizando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WasteTypeFilter 
        options={Object.keys(WASTE_TAGS)} 
        selectedTypes={selectedWasteTypes} 
        onSelect={handleSelectType} 
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation={true}
      >
        {points.map(point => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.lat, longitude: point.lon }}
            onPress={() => setSelectedPoint(point)}
            pinColor={selectedPoint?.id === point.id ? '#2E7D32' : '#F44336'}
          />
        ))}
      </MapView>

      {/* MODAL DE INFORMAÇÕES (Aparece automático no mais próximo) */}
      <Modal visible={!!selectedPoint} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selectedPoint?.name}</Text>
              <Text style={styles.infoText}>📍 {selectedPoint?.address}</Text>
              {selectedPoint?.opening_hours && <Text style={styles.infoText}>⏰ {selectedPoint.opening_hours}</Text>}
              {selectedPoint?.phone && <Text style={styles.infoText}>📞 {selectedPoint.phone}</Text>}
              
              <Text style={styles.typesLabel}>Aceita:</Text>
              <Text style={styles.typesList}>{selectedPoint?.types?.join(', ') || 'Recicláveis'}</Text>
              
              <TouchableOpacity style={styles.gpsButton} onPress={() => openGps(selectedPoint.lat, selectedPoint.lon)}>
                <Text style={styles.gpsButtonText}>TRAÇAR ROTA NO GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPoint(null)}>
                <Text style={styles.closeButtonText}>FECHAR</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, minHeight: 350 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 15 },
  infoText: { fontSize: 16, color: '#444', marginBottom: 10 },
  typesLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 15 },
  typesList: { fontSize: 15, color: '#4CAF50', fontWeight: '600', marginTop: 5 },
  gpsButton: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  closeButton: { marginTop: 15, padding: 10, alignItems: 'center' },
  closeButtonText: { color: '#999', fontWeight: 'bold' }
});

export default MapScreen;
