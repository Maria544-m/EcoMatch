import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from '@teovilla/react-native-web-maps';
import * as Location from 'expo-location';
import { fetchRecyclingPoints, WASTE_TAGS } from './overpassUtils';
import { WasteTypeFilter } from './WasteTypeFilter';

const MapScreen = () => {
  const [location, setLocation] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Por favor, permita a localização no seu navegador.');
          return;
        }

        let userLocation = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setLocation(region);
        
        const data = await fetchRecyclingPoints(region.latitude, region.longitude, selectedWasteTypes);
        setPoints(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedWasteTypes]);

  const handleSelectType = (type: string) => {
    setSelectedWasteTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (loading && !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Obtendo sua localização real...</Text>
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

      {location && (
        <MapView 
          style={styles.map} 
          initialRegion={location}
          // IMPORTANTE: COLOQUE SUA CHAVE AQUI
          googleMapsApiKey="AIzaSyAYCgXk1Zv6WT6I3oEa6R3aQcjWMmSoPxA"
        >
          {points.map(p => (
            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} title={p.name} />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default MapScreen;
