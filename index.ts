// IMPORTA uma função do Expo
// Essa função registra o aplicativo principal

import { registerRootComponent } from 'expo';


// IMPORTA o App.tsx
// Esse é o componente principal do aplicativo

import App from './App';


// registerRootComponent(App)
// faz o Expo iniciar o aplicativo corretamente
// tanto no celular quanto na web

registerRootComponent(App);