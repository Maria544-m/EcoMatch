import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // O AppNavigator agora cuida de tudo: 
  // Ele mostra a Splash e, quando ela termina, mostra o resto do App.
  return <AppNavigator />;
}