import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  selectedTypes: string[];
  onSelect: (type: string) => void;
  options: string[];
}

export const WasteTypeFilter: React.FC<Props> = ({ selectedTypes, onSelect, options }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.container}
      >
        {options.map(type => {
          const isSelected = selectedTypes.includes(type);
          return (
            <TouchableOpacity 
              key={type} 
              onPress={() => onSelect(type)}
              activeOpacity={0.7}
              style={[
                styles.chip, 
                isSelected && styles.selectedChip
              ]}
            >
              <Text style={[
                styles.text, 
                isSelected && styles.selectedText
              ]}>
                {/* Capitaliza a primeira letra para ficar mais bonito */}
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
    position: 'absolute',
    top: 50, // Ajuste este valor se ficar em cima de algum ícone do seu app
    zIndex: 10,
    width: '100%',
  },
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  chip: {
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    // Sombra para Android
    elevation: 5,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedChip: {
    backgroundColor: '#4CAF50', // Verde do EcoMatch
  },
  text: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedText: {
    color: 'white',
  }
});
