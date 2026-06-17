// ============================================================
// CustomButton.tsx
// Componente reutilizável de botão personalizado
//
// Responsável por:
// - Exibir um botão padronizado no aplicativo
// - Receber um texto como título
// - Executar uma ação quando pressionado
// ============================================================

import React from 'react';

import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

// -------------------------------------------------------
// Tipagem das propriedades recebidas pelo componente
//
// title:
// Texto exibido dentro do botão
//
// onPress:
// Função executada ao clicar no botão
// -------------------------------------------------------
type Props = {
  title: string;
  onPress: () => void;
};

// -------------------------------------------------------
// Componente CustomButton
//
// Pode ser reutilizado em diversas telas do sistema,
// mantendo a identidade visual da aplicação.
// -------------------------------------------------------
export default function CustomButton({
  title,
  onPress,
}: Props) {

  // -----------------------------------------------------
  // Renderiza o botão personalizado
  // -----------------------------------------------------
  return (

    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >

      {/* Texto exibido dentro do botão */}
      <Text style={styles.text}>
        {title}
      </Text>

    </TouchableOpacity>

  );
}

// ============================================================
// Estilos do componente
// ============================================================
const styles = StyleSheet.create({

  // -------------------------------------------------------
  // Estilo principal do botão
  //
  // Define:
  // - Cor de fundo
  // - Espaçamento interno
  // - Bordas arredondadas
  // - Espaçamento superior
  // -------------------------------------------------------
  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  // -------------------------------------------------------
  // Texto exibido dentro do botão
  //
  // Define:
  // - Cor da fonte
  // - Alinhamento centralizado
  // - Peso da fonte
  // - Tamanho da fonte
  // -------------------------------------------------------
  text: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

});