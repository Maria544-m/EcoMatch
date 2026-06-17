// ======================================================
// IMPORTAÇÕES
// ======================================================

// Hooks do React
import React, { useState, useEffect, useRef } from 'react';

// Componentes do React Native
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Dimensions
} from 'react-native';

// Componente de mapa
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Biblioteca para acessar localização do usuário
import * as Location from 'expo-location';

// Funções personalizadas do projeto
import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';
import { WasteTypeFilter } from './WasteTypeFilter';

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

const MapScreen = () => {

  // Armazena a localização atual do usuário
  const [location, setLocation] = useState<any>(null);

  // Armazena os ecopontos encontrados
  const [points, setPoints] = useState<any[]>([]);

  // Controla o loading da tela
  const [loading, setLoading] = useState(true);

  // Guarda o ponto selecionado para mostrar no modal
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Guarda os tipos de resíduos selecionados pelo usuário
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

  // Referência do mapa para movimentá-lo programaticamente
  const mapRef = useRef<MapView>(null);

  // ======================================================
  // FUNÇÃO PARA CALCULAR DISTÂNCIA ENTRE DOIS PONTOS
  // ======================================================
  // Utiliza uma fórmula simples para descobrir
  // qual ponto está mais próximo do usuário.
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    return Math.sqrt(
      Math.pow(lat2 - lat1, 2) +
      Math.pow(lon2 - lon1, 2)
    );
  };

  // ======================================================
  // OBTÉM A LOCALIZAÇÃO DO USUÁRIO
  // ======================================================
  useEffect(() => {
    (async () => {

      // Solicita permissão para acessar localização
      let { status } =
        await Location.requestForegroundPermissionsAsync();

      // Se o usuário negar permissão
      if (status !== 'granted') {
        alert('Precisamos da sua localização!');
        setLoading(false);
        return;
      }

      // Obtém localização atual
      let userLocation =
        await Location.getCurrentPositionAsync({});

      // Define região inicial do mapa
      const region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };

      // Salva localização
      setLocation(region);

      // Finaliza loading
      setLoading(false);

    })();
  }, []);

  // ======================================================
  // SEMPRE QUE A LOCALIZAÇÃO OU FILTRO MUDAR
  // BUSCA NOVAMENTE OS ECOPONTOS
  // ======================================================
  useEffect(() => {

    if (location) {

      // Pequeno delay para evitar muitas chamadas seguidas
      const delayDebounceFn = setTimeout(() => {
        loadPoints();
      }, 500);

      // Limpa o timeout ao atualizar
      return () => clearTimeout(delayDebounceFn);
    }

  }, [location, selectedWasteTypes]);

  // ======================================================
  // CARREGA ECOPONTOS DA API
  // ======================================================
  const loadPoints = async () => {

    // Busca os pontos de reciclagem
    const data = await fetchRecyclingPoints(
      location.latitude,
      location.longitude,
      selectedWasteTypes
    );

    // Atualiza estado
    setPoints(data);

    // ==================================================
    // ENCONTRA O ECOPONTO MAIS PRÓXIMO
    // ==================================================
    if (data.length > 0 && selectedWasteTypes.length > 0) {

      // Assume inicialmente que o primeiro é o mais próximo
      let nearest = data[0];

      let minDistance = getDistance(
        location.latitude,
        location.longitude,
        data[0].lat,
        data[0].lon
      );

      // Percorre todos os pontos
      data.forEach((p: any) => {

        const d = getDistance(
          location.latitude,
          location.longitude,
          p.lat,
          p.lon
        );

        // Se encontrar um mais próximo
        if (d < minDistance) {
          minDistance = d;
          nearest = p;
        }
      });

      // ==================================================
      // MOVE O MAPA PARA O PONTO MAIS PRÓXIMO
      // ==================================================
      mapRef.current?.animateToRegion(
        {
          latitude: nearest.lat,
          longitude: nearest.lon,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000 // duração da animação
      );

      // Abre automaticamente o modal
      setSelectedPoint(nearest);
    }
  };

  // ======================================================
  // SELECIONA OU REMOVE UM TIPO DE RESÍDUO
  // ======================================================
  const handleSelectType = (type: string) => {

    setSelectedWasteTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );

  };

  // ======================================================
  // ABRE O GOOGLE MAPS COM A ROTA
  // ======================================================
  const openGps = (
    lat: number,
    lon: number
  ) => {

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    Linking.openURL(url);

  };

  // ======================================================
  // TELA DE CARREGAMENTO
  // ======================================================
  if (loading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#4CAF50"
        />

        <Text style={{ marginTop: 10 }}>
          Localizando...
        </Text>
      </View>
    );
  }

  // ======================================================
  // INTERFACE PRINCIPAL
  // ======================================================
  return (
    <View style={styles.container}>

      {/* Filtro de tipos de resíduos */}
      <WasteTypeFilter
        options={Object.keys(WASTE_TAGS)}
        selectedTypes={selectedWasteTypes}
        onSelect={handleSelectType}
      />

      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation={true}
      >

        {/* MARCADORES DOS ECOPONTOS */}
        {points.map(point => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.lat,
              longitude: point.lon
            }}

            onPress={() =>
              setSelectedPoint(point)
            }

            pinColor={
              selectedPoint?.id === point.id
                ? '#2E7D32'
                : '#F44336'
            }
          />
        ))}

      </MapView>

      {/* ==================================================
          MODAL COM INFORMAÇÕES DO ECOPONTO
      ================================================== */}
      <Modal
        visible={!!selectedPoint}
        animationType="slide"
        transparent={true}
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {/* Nome */}
              <Text style={styles.modalTitle}>
                {selectedPoint?.name}
              </Text>

              {/* Endereço */}
              <Text style={styles.infoText}>
                📍 {selectedPoint?.address}
              </Text>

              {/* Horário */}
              {selectedPoint?.opening_hours && (
                <Text style={styles.infoText}>
                  ⏰ {selectedPoint.opening_hours}
                </Text>
              )}

              {/* Telefone */}
              {selectedPoint?.phone && (
                <Text style={styles.infoText}>
                  📞 {selectedPoint.phone}
                </Text>
              )}

              {/* Tipos aceitos */}
              <Text style={styles.typesLabel}>
                Aceita:
              </Text>

              <Text style={styles.typesList}>
                {selectedPoint?.types?.join(', ') ||
                  'Recicláveis'}
              </Text>

              {/* Botão GPS */}
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={() =>
                  openGps(
                    selectedPoint.lat,
                    selectedPoint.lon
                  )
                }
              >
                <Text style={styles.gpsButtonText}>
                  TRAÇAR ROTA NO GPS
                </Text>
              </TouchableOpacity>

              {/* Botão fechar */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setSelectedPoint(null)
                }
              >
                <Text style={styles.closeButtonText}>
                  FECHAR
                </Text>
              </TouchableOpacity>

            </ScrollView>

          </View>

        </View>

      </Modal>

    </View>
  );
};

// ======================================================
// ESTILOS
// ======================================================
const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },

  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    minHeight: 350
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15
  },

  infoText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10
  },

  typesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15
  },

  typesList: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 5
  },

  gpsButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center'
  },

  gpsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },

  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center'
  },

  closeButtonText: {
    color: '#999',
    fontWeight: 'bold'
  }
});

// Exporta a tela para uso no app
export default MapScreen;