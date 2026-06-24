// firebaseConfig.ts
// Configuração principal do Firebase no projeto EcoMatch
//
// Responsável por:
// - Inicializar a conexão com o Firebase
// - Disponibilizar a autenticação de usuários
// - Disponibilizar o banco de dados Firestore

// Importa a função responsável por inicializar
// a aplicação Firebase

import { initializeApp } from 'firebase/app';

// Importa o módulo de autenticação
// utilizado para login e cadastro de usuários

import { getAuth } from 'firebase/auth';


// Importa o módulo do Firestore,
// banco de dados NoSQL do Firebase

import { getFirestore } from 'firebase/firestore';

// Configurações do projeto Firebase
//
// Essas informações identificam e conectam
// o aplicativo EcoMatch ao projeto criado
// no console do Firebase.
const firebaseConfig = {
  apiKey: 'AIzaSyCvZT4QRJMPkXFiI7Npq-YpWiPj_0amJD4',
  authDomain: 'ecomatch-3345f.firebaseapp.com',
  projectId: 'ecomatch-3345f',
  storageBucket: 'ecomatch-3345f.firebasestorage.app',
  messagingSenderId: '982137813713',
  appId: '1:982137813713:web:e1f3255adaea12fd7463f0',
};

// Inicializa a aplicação Firebase utilizando
// as configurações definidas acima
const app = initializeApp(firebaseConfig);

// Serviço de autenticação
// Utilizado para:
// - Cadastro de usuários
// - Login
// - Logout
// - Recuperação de sessão
export const auth = getAuth(app);

// Serviço do banco de dados Firestore
// Utilizado para:
// - Salvar dados dos usuários
// - Consultar informações
// - Atualizar registros
// - Excluir documentos
export const db = getFirestore(app);