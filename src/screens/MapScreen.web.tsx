import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L, { Map as LeafletMap } from 'leaflet'; // Importa Map como LeafletMap para evitar conflito e tipagem
// @ts-ignore
import 'leaflet/dist/leaflet.css';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';

// Configuração de ícones do Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const recyclingIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const WASTE_ICONS: { [key: string]: any } = {
  plastico: 'water',
  papel: 'document-text',
  vidro: 'wine',
  metal: 'construct',
  eletronicos: 'desktop',
  pilhas: 'battery-dead',
};

// Componente para controlar a visão do mapa e forçar re-render de pontos
const MapController = ({ center, points }: { center: [number, number], points: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50] }); // Ajusta a visão para englobar todos os marcadores
    } else if (center) {
      map.setView(center, 14);
    }
  }, [center, points, map]);
  return null;
};

// Novo componente para lidar com eventos do mapa, como cliques
const MapEventHandler = ({ setSelectedPoint }: { setSelectedPoint: (point: any) => void }) => {
  useMapEvents({
    click: () => {
      setSelectedPoint(null); // Fecha o sideCard ao clicar no mapa
    },
  });
  return null;
};

const MapScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização negada. Por favor, habilite nas configurações do seu navegador.');
          setLoading(false);
          return;
        }
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
        setLoading(false);
      } catch (e: any) {
        console.error(e);
        setError('Não foi possível obter sua localização. Verifique suas configurações de GPS.');
        setLoading(false);
      }
    })();
  }, []);

  const loadPoints = useCallback(async () => {
    if (!location) return;
    setError(null); // Limpa erros anteriores
    try {
      const data = await fetchRecyclingPoints(
        location.latitude,
        location.longitude,
        selectedWasteTypes
      );
      setPoints(data);
      if (data.length === 0 && selectedWasteTypes.length > 0) {
        Alert.alert("Nenhum ponto encontrado", "Não encontramos pontos de reciclagem para os tipos selecionados nesta área.");
      } else if (data.length === 0 && selectedWasteTypes.length === 0) {
        Alert.alert("Nenhum ponto encontrado", "Não encontramos pontos de reciclagem nesta área. Tente ajustar sua localização ou filtros.");
      }
    } catch (err: any) {
      console.error("Erro ao carregar pontos:", err);
      setError(err.message || 'Erro ao carregar pontos de reciclagem. Tente novamente.');
    }
  }, [location, selectedWasteTypes]);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(loadPoints, 300);
      return () => clearTimeout(timer);
    }
  }, [location, selectedWasteTypes, loadPoints]);

  const handleSelectType = (type: string) => {
    setSelectedWasteTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const openGps = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
  };

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Carregando EcoMatch...</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão flutuante para abrir menu quando estiver fechado */}
      {!isMenuOpen && (
        <TouchableOpacity
          style={styles.menuToggleButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Menu Lateral Retrátil */}
      {isMenuOpen && (
        <View style={styles.webFilterContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.filterTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterSubtitle}>O que você quer descartar?</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.chipGrid}>
              {Object.keys(WASTE_TAGS).map(type => {
                const isSelected = selectedWasteTypes.includes(type);
                const iconName = WASTE_ICONS[type] || 'leaf';
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleSelectType(type)}
                    style={[styles.chip, isSelected && styles.selectedChip]}
                  >
                    <Ionicons name={iconName} size={18} color={isSelected ? 'white' : '#4CAF50'} style={{ marginRight: 10 }} />
                    <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.menuFooter}>
            <Text style={styles.footerText}>{points.length} locais encontrados</Text>
          </View>
        </View>
      )}

      <View style={styles.mapWrapper}>
        {location && (
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <MapEventHandler setSelectedPoint={setSelectedPoint} /> {/* Adiciona o novo componente para lidar com cliques no mapa */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              center={selectedPoint ? [selectedPoint.lat, selectedPoint.lon] : [location.latitude, location.longitude]}
              points={points}
            />

            <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
              <Popup>Você está aqui</Popup>
            </Marker>

            {points.map(point => (
              <Marker
                key={point.id}
                position={[point.lat, point.lon]}
                icon={recyclingIcon}
                eventHandlers={{
                  click: () => setSelectedPoint(point),
                }}
              >
                <Popup>
                  <View style={styles.popupContent}>
                    <Text style={styles.popupTitle}>{point.name}</Text>
                    <Text style={styles.popupText}>{point.address}</Text>
                    <TouchableOpacity style={styles.popupButton} onPress={() => openGps(point.lat, point.lon)}>
                      <Text style={styles.popupButtonText}>TRAÇAR ROTA</Text>
                    </TouchableOpacity>
                  </View>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </View>

      {/* Card de Detalhes Lateral */}
      {selectedPoint && (
        <View style={styles.sideCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{selectedPoint.name}</Text>
              <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                <Ionicons name="close-circle" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}><Ionicons name="location" size={18} color="#4CAF50" /><Text style={styles.cardText}>{selectedPoint.address}</Text></View>
            {selectedPoint.opening_hours && (<View style={styles.infoRow}><Ionicons name="time" size={18} color="#4CAF50" /><Text style={styles.cardText}>{selectedPoint.opening_hours}</Text></View>)}
            <Text style={styles.sectionTitle}>Materiais Aceitos</Text>
            <View style={styles.tagContainer}>
              {(selectedPoint.types?.length > 0 ? selectedPoint.types : ['Recicláveis']).map((type: string, index: number) => (
                <View key={index} style={styles.tag}><Text style={styles.tagText}>{type.toUpperCase()}</Text></View>
              ))}
            </View>
            <TouchableOpacity style={styles.gpsButton} onPress={() => openGps(selectedPoint.lat, selectedPoint.lon)}>
              <Ionicons name="navigate" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.gpsButtonText}>VER NO GOOGLE MAPS</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => {
            setError(null);
            if (!location) {
              // Tenta obter a localização novamente se o erro for de permissão/localização
              (async () => {
                try {
                  let { status } = await Location.requestForegroundPermissionsAsync();
                  if (status === 'granted') {
                    let userLocation = await Location.getCurrentPositionAsync({});
                    setLocation({
                      latitude: userLocation.coords.latitude,
                      longitude: userLocation.coords.longitude,
                    });
                  } else {
                    setError('Permissão de localização negada. Por favor, habilite nas configurações do seu navegador.');
                  }
                } catch (err: any) {
                  setError('Não foi possível obter sua localização. Verifique suas configurações de GPS.');
                }
              })();
            } else {
              // Tenta recarregar os pontos se o erro for de carregamento
              loadPoints();
            }
          }} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#fff',
},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  menuToggleButton: {
  position: 'absolute',
  top: 20,
  right: 20,

  width: 52,
  height: 52,
  borderRadius: 16,

  backgroundColor: '#4CAF50',

  justifyContent: 'center',
  alignItems: 'center',

  zIndex: 2000,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.18,
  shadowRadius: 8,

  elevation: 8,
},
  webFilterContainer: {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 320,
  height: '100%',
  backgroundColor: '#fff',
  paddingTop: 30,
  paddingHorizontal: 20,
  borderLeftWidth: 1,
  borderLeftColor: '#E5E5E5',
  zIndex: 999,
  shadowColor: '#000',
  shadowOffset: {
    width: -2,
    height: 0,
  },
  shadowOpacity: 0.12,
  shadowRadius: 12,

  elevation: 10,
},
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  filterSubtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  chipGrid: { flexDirection: 'column' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  chipText: { fontSize: 14, color: '#555', fontWeight: '500' },
  selectedChipText: { color: '#2E7D32', fontWeight: 'bold' },
  menuFooter: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  footerText: { color: '#999', fontSize: 12, textAlign: 'center' },
  mapWrapper: { flex: 1, zIndex: 1 },
  popupContent: { padding: 5, minWidth: 150 },
  popupTitle: { fontWeight: 'bold', fontSize: 14, color: '#2E7D32', marginBottom: 5 },
  popupText: { fontSize: 12, color: '#666', marginBottom: 10 },
  popupButton: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5, alignItems: 'center' },
  popupButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  sideCard: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 320,
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', flex: 1, marginRight: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardText: { fontSize: 14, color: '#444', marginLeft: 8, flex: 1 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 8 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  tag: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#C8E6C9' },
  tagText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  gpsButton: { backgroundColor: '#4CAF50', flexDirection: 'row', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'red',
    fontWeight: 'bold',
  }
});

export default MapScreen;