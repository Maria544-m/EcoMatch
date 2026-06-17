// Importa o React e os Hooks necessários
import React, { useState, useEffect } from 'react';

// Importa componentes visuais do React Native
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

// Importa o mapa e os marcadores
import MapView, { Marker } from '@teovilla/react-native-web-maps';

// Importa a biblioteca de localização do Expo
import * as Location from 'expo-location';

// Importa a função que busca os ecopontos e as categorias de resíduos
import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';

// Importa o componente de filtro por tipo de resíduo
import { WasteTypeFilter } from './WasteTypeFilter';

// Componente principal da tela do mapa
const MapScreen = () => {

  // Armazena a localização atual do usuário
  const [location, setLocation] = useState<any>(null);

  // Armazena a lista de ecopontos encontrados
  const [points, setPoints] = useState<any[]>([]);

  // Controla se os dados ainda estão carregando
  const [loading, setLoading] = useState(true);

  // Armazena os tipos de resíduos selecionados pelo usuário
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

  // Executa sempre que a tela abre ou quando o filtro muda
  useEffect(() => {

    // Função assíncrona para obter localização e ecopontos
    (async () => {
      try {

        // Solicita permissão para acessar a localização
        let { status } = await Location.requestForegroundPermissionsAsync();

        // Verifica se a permissão foi concedida
        if (status !== 'granted') {

          // Exibe mensagem caso o usuário negue a permissão
          alert('Por favor, permita a localização no seu navegador.');

          return;
        }

        // Obtém a posição atual do usuário
        let userLocation = await Location.getCurrentPositionAsync({});

        // Cria a região inicial do mapa
        const region = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        // Salva a localização no estado
        setLocation(region);

        // Busca os ecopontos próximos da localização atual
        const data = await fetchRecyclingPoints(
          region.latitude,
          region.longitude,
          selectedWasteTypes
        );

        // Salva os ecopontos encontrados
        setPoints(data);

      } catch (e) {

        // Mostra erros no console
        console.error(e);

      } finally {

        // Finaliza o carregamento mesmo que ocorra erro
        setLoading(false);
      }
    })();

  }, [selectedWasteTypes]); // Executa novamente quando o filtro mudar

  // Função chamada ao selecionar um tipo de resíduo
  const handleSelectType = (type: string) => {

    setSelectedWasteTypes(prev =>

      // Se já estiver selecionado, remove
      prev.includes(type)

        ? prev.filter(t => t !== type)

        // Caso contrário, adiciona
        : [...prev, type]
    );
  };

  // Enquanto a localização está sendo obtida
  if (loading && !location) {
    return (
      <View style={styles.center}>

        {/* Indicador de carregamento */}
        <ActivityIndicator size="large" color="#4CAF50" />

        {/* Texto informativo */}
        <Text>Obtendo sua localização real...</Text>

      </View>
    );
  }

  // Interface principal da tela
  return (
    <View style={styles.container}>

      {/* Filtro para selecionar os tipos de resíduos */}
      <WasteTypeFilter
        options={Object.keys(WASTE_TAGS)}
        selectedTypes={selectedWasteTypes}
        onSelect={handleSelectType}
      />

      {/* Só renderiza o mapa quando a localização existir */}
      {location && (

        <MapView

          // Estilo do mapa
          style={styles.map}

          // Região inicial do mapa
          initialRegion={location}

          // Chave da API do Google Maps
          googleMapsApiKey="SUA_CHAVE_AQUI"
        >

          {/* Cria um marcador para cada ecoponto encontrado */}
          {points.map(p => (

            <Marker

              // Identificador único
              key={p.id}

              // Coordenadas do marcador
              coordinate={{
                latitude: p.lat,
                longitude: p.lon
              }}

              // Nome exibido ao clicar no marcador
              title={p.name}
            />
          ))}

        </MapView>
      )}

    </View>
  );
};

// Estilos da tela
const styles = StyleSheet.create({

  // Container principal ocupa toda a tela
  container: {
    flex: 1,
  },

  // Mapa ocupa toda a largura e altura disponíveis
  map: {
    width: '100%',
    height: '100%',
  },

  // Centraliza os elementos de carregamento
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Exporta o componente para uso em outras telas
export default MapScreen;