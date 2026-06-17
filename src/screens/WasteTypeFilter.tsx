import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  selectedTypes: string[];
  onSelect: (type: string) => void;
  options: string[];
}

const WASTE_ICONS: { [key: string]: any } = {
  plastico: 'water',
  papel: 'document-text',
  vidro: 'wine',
  metal: 'construct',
  eletronicos: 'desktop',
  pilhas: 'battery-dead',
};

export const WasteTypeFilter: React.FC<Props> = ({
  selectedTypes,
  onSelect,
  options
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        // Importante para garantir que o scroll funcione no Android/iOS
        nestedScrollEnabled={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {options.map(type => {
          const isSelected = selectedTypes.includes(type);
          const iconName = WASTE_ICONS[type] || 'leaf';

          return (
            <TouchableOpacity
              key={type}
              onPress={() => onSelect(type)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                isSelected && styles.selectedChip
              ]}
            >
              <Ionicons 
                name={iconName} 
                size={16} 
                color={isSelected ? 'white' : '#4CAF50'} 
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.text,
                  isSelected && styles.selectedText
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Ajuste de posicionamento para não bloquear o mapa e permitir o toque
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    // Garante que os itens tenham espaço para respirar
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  text: {
    color: '#555',
    fontSize: 13,
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
  }
});