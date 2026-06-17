// Importa o React
import React from 'react';

// Importa componentes do React Native
import {
  ScrollView,       // Permite rolagem horizontal ou vertical
  TouchableOpacity, // Botão clicável
  Text,             // Exibe textos
  StyleSheet,       // Cria estilos
  View              // Container para agrupar componentes
} from 'react-native';

// Define as propriedades que o componente receberá
interface Props {

  // Lista dos tipos atualmente selecionados
  selectedTypes: string[];

  // Função chamada quando o usuário seleciona um tipo
  onSelect: (type: string) => void;

  // Lista de opções disponíveis
  options: string[];
}

// Componente responsável pelos filtros de resíduos
export const WasteTypeFilter: React.FC<Props> = ({

  // Tipos selecionados
  selectedTypes,

  // Função de seleção
  onSelect,

  // Lista de opções
  options

}) => {

  return (

    // Container principal dos filtros
    <View style={styles.wrapper}>

      {/* Scroll horizontal para os filtros */}
      <ScrollView

        // Permite rolagem horizontal
        horizontal

        // Oculta a barra de rolagem
        showsHorizontalScrollIndicator={false}

        // Estilo interno do conteúdo
        contentContainerStyle={styles.container}
      >

        {/* Percorre todas as opções de resíduos */}
        {options.map(type => {

          // Verifica se o item está selecionado
          const isSelected = selectedTypes.includes(type);

          return (

            // Botão do filtro
            <TouchableOpacity

              // Chave única para o React
              key={type}

              // Quando clicar, chama a função de seleção
              onPress={() => onSelect(type)}

              // Efeito de transparência ao clicar
              activeOpacity={0.7}

              // Aplica estilos normais e selecionados
              style={[
                styles.chip,
                isSelected && styles.selectedChip
              ]}
            >

              {/* Texto do botão */}
              <Text
                style={[
                  styles.text,
                  isSelected && styles.selectedText
                ]}
              >

                {/* 
                  Deixa a primeira letra maiúscula
                  Exemplo:
                  plastico -> Plastico
                  vidro -> Vidro
                */}
                {type.charAt(0).toUpperCase() + type.slice(1)}

              </Text>

            </TouchableOpacity>
          );
        })}

      </ScrollView>

    </View>
  );
};

// Estilos do componente
const styles = StyleSheet.create({

  // Container externo dos filtros
  wrapper: {

    // Fica sobre o mapa
    position: 'absolute',

    // Distância do topo da tela
    top: 50,

    // Garante que fique acima de outros componentes
    zIndex: 10,

    // Ocupa toda a largura da tela
    width: '100%',
  },

  // Área interna do ScrollView
  container: {

    // Espaçamento horizontal
    paddingHorizontal: 15,

    // Espaçamento vertical
    paddingVertical: 10,
  },

  // Estilo padrão dos botões de filtro
  chip: {

    // Fundo branco
    backgroundColor: 'white',

    // Espaçamento interno horizontal
    paddingHorizontal: 18,

    // Espaçamento interno vertical
    paddingVertical: 10,

    // Bordas arredondadas
    borderRadius: 25,

    // Espaçamento entre os botões
    marginRight: 10,

    // Sombra Android
    elevation: 5,

    // Configuração da sombra iOS
    shadowColor: '#000',

    // Posição da sombra
    shadowOffset: {
      width: 0,
      height: 2
    },

    // Transparência da sombra
    shadowOpacity: 0.2,

    // Suavização da sombra
    shadowRadius: 4,
  },

  // Estilo aplicado quando o filtro está selecionado
  selectedChip: {

    // Verde padrão do EcoMatch
    backgroundColor: '#4CAF50',
  },

  // Texto padrão do botão
  text: {

    // Cor escura
    color: '#333',

    // Tamanho da fonte
    fontSize: 14,

    // Peso da fonte
    fontWeight: '600',
  },

  // Texto quando selecionado
  selectedText: {

    // Cor branca
    color: 'white',
  }
});