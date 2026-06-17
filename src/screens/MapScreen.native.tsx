import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';

const { width, height } = Dimensions.get('window');

const WASTE_ICONS: { [key: string]: any } = {
  plastico: 'water',
  papel: 'document-text',
  vidro: 'wine',
  metal: 'construct',
  eletronicos: 'desktop',
  pilhas: 'battery-dead',
};

const MapScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;

  // Animação do menu lateral
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -width * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão negada.');
          setLoading(false);
          return;
        }
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    })();
  }, []);

  const loadPoints = useCallback(async () => {
    if (!location) return;
    try {
      const data = await fetchRecyclingPoints(
        location.latitude,
        location.longitude,
        selectedWasteTypes
      );
      setPoints(data);
      if (data.length > 0 && selectedWasteTypes.length > 0) {
        const nearest = data[0];
        mapRef.current?.animateToRegion({
          latitude: nearest.lat,
          longitude: nearest.lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } catch (err) {
      setError('Erro na conexão.');
    }
  }, [location, selectedWasteTypes]);

  useEffect(() => {
    if (location) {
      const timer = setTimeout(loadPoints, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, selectedWasteTypes, loadPoints]);

  const handleSelectType = (type: string) => {
    setSelectedWasteTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (loading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando EcoMatch...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão para abrir o menu */}
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={() => setIsMenuOpen(true)}
      >
        <Ionicons name="filter" size={24} color="white" />
      </TouchableOpacity>

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
          >
            <View style={[styles.customMarker, selectedPoint?.id === point.id && styles.selectedMarker]}>
              <Ionicons name="leaf" size={20} color="white" />
            </View>
            <Callout tooltip onPress={() => setSelectedPoint(point)}>
               <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{point.name}</Text>
                  <Text style={styles.calloutSubtitle}>Toque para detalhes</Text>
               </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Overlay escuro quando o menu está aberto */}
      {isMenuOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuOpen(false)} 
        />
      )}

      {/* Menu Lateral Animado (Igual à Web) */}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Filtros</Text>
          <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.menuSubtitle}>O que deseja descartar?</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {Object.keys(WASTE_TAGS).map(type => {
            const isSelected = selectedWasteTypes.includes(type);
            const iconName = WASTE_ICONS[type] || 'leaf';
            return (
              <TouchableOpacity
                key={type}
                onPress={() => handleSelectType(type)}
                style={[styles.chip, isSelected && styles.selectedChip]}
              >
                <Ionicons name={iconName} size={20} color={isSelected ? 'white' : '#4CAF50'} style={{ marginRight: 12 }} />
                <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.menuFooter}>
          <Text style={styles.footerText}>{points.length} locais encontrados</Text>
        </View>
      </Animated.View>

      {/* Modal de Detalhes (Bottom Sheet) */}
      <Modal
        visible={!!selectedPoint}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPoint(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setSelectedPoint(null)} />
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedPoint?.name}</Text>
                <TouchableOpacity onPress={() => setSelectedPoint(null)}>
                  <Ionicons name="close-circle" size={28} color="#ccc" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}><Ionicons name="location" size={20} color="#4CAF50" /><Text style={styles.infoText}>{selectedPoint?.address}</Text></View>
              {selectedPoint?.opening_hours && (<View style={styles.infoRow}><Ionicons name="time" size={20} color="#4CAF50" /><Text style={styles.infoText}>{selectedPoint.opening_hours}</Text></View>)}
              <Text style={styles.sectionTitle}>Materiais Aceitos</Text>
              <View style={styles.tagContainer}>
                {(selectedPoint?.types?.length > 0 ? selectedPoint.types : ['Recicláveis']).map((type: string, index: number) => (
                  <View key={index} style={styles.tag}><Text style={styles.tagText}>{type.toUpperCase()}</Text></View>
                ))}
              </View>
              <TouchableOpacity style={styles.gpsButton} onPress={() => Linking.openURL(`geo:0,0?q=${selectedPoint.lat},${selectedPoint.lon}`)}>
                <Ionicons name="navigate" size={20} color="white" style={{marginRight: 8}} />
                <Text style={styles.gpsButtonText}>COMO CHEGAR</Text>
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
  loadingText: { marginTop: 10, color: '#666' },
  map: { width, height },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.45,
    backgroundColor: 'white',
    zIndex: 30,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    elevation: 10,
  },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  menuTitle: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  menuSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  chipText: { fontSize: 15, color: '#555', fontWeight: '500' },
  selectedChipText: { color: '#2E7D32', fontWeight: 'bold' },
  menuFooter: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  footerText: { color: '#999', fontSize: 12, textAlign: 'center' },
  customMarker: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  selectedMarker: { backgroundColor: '#2E7D32', transform: [{ scale: 1.2 }] },
  calloutContainer: { backgroundColor: 'white', padding: 10, borderRadius: 10, width: 140, alignItems: 'center' },
  calloutTitle: { fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  calloutSubtitle: { fontSize: 10, color: '#4CAF50' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalCloseArea: { flex: 1 },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: height * 0.6 },
  modalIndicator: { width: 40, height: 5, backgroundColor: '#eee', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 15, color: '#444', marginLeft: 10, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  tag: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold' },
  gpsButton: { backgroundColor: '#4CAF50', flexDirection: 'row', padding: 16, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  gpsButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default MapScreen;