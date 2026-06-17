// ============================================================
// ecopontosService.ts
//
// Responsável por buscar ecopontos reais utilizando
// a Overpass API (OpenStreetMap)
//
// Fluxo:
// Usuário
//    ↓
// Localização
//    ↓
// Overpass API
//    ↓
// Lista de ecopontos
// ============================================================

// ------------------------------------------------------------
// Biblioteca responsável por realizar requisições HTTP
// ------------------------------------------------------------
import axios from 'axios';

// ------------------------------------------------------------
// Interface que define o formato de um ecoponto
// Isso ajuda o TypeScript a validar os dados
// ------------------------------------------------------------
export interface Ecoponto {

  // Nome do local
  nome: string;

  // Latitude
  latitude: number;

  // Longitude
  longitude: number;

  // Endereço (quando existir)
  endereco?: string;
}

// ------------------------------------------------------------
// Função responsável por buscar ecopontos próximos
//
// latitude -> localização do usuário
// longitude -> localização do usuário
// raio -> distância em metros
// ------------------------------------------------------------
export const buscarEcopontos = async (
  latitude: number,
  longitude: number,
  raio: number = 5000,
): Promise<Ecoponto[]> => {

  try {

    // --------------------------------------------------------
    // Consulta Overpass
    //
    // Busca locais marcados como recycling
    // próximos da localização do usuário
    // --------------------------------------------------------
    const query = `
      [out:json];

      (
        node["amenity"="recycling"]
        (around:${raio},${latitude},${longitude});

        way["amenity"="recycling"]
        (around:${raio},${latitude},${longitude});

        relation["amenity"="recycling"]
        (around:${raio},${latitude},${longitude});
      );

      out center;
    `;

    // --------------------------------------------------------
    // Faz a requisição para a API
    // --------------------------------------------------------
    const response = await axios.get(
  'https://overpass-api.de/api/interpreter',
  {
    params: {
      data: query,
    },
  },
);

    // --------------------------------------------------------
    // Obtém os elementos retornados
    // --------------------------------------------------------
    const elementos = response.data.elements || [];

    // --------------------------------------------------------
    // Converte para o formato utilizado no app
    // --------------------------------------------------------
    const ecopontos: Ecoponto[] = elementos.map(
      (item: any) => {

        return {

          // Nome do local
          nome:
            item.tags?.name ||
            'Ecoponto sem nome',

          // Latitude
          latitude:
            item.lat ||
            item.center?.lat,

          // Longitude
          longitude:
            item.lon ||
            item.center?.lon,

          // Endereço
          endereco:
            item.tags?.['addr:street'] ||
            'Endereço não informado',
        };
      },
    );

    // --------------------------------------------------------
    // Retorna a lista pronta
    // --------------------------------------------------------
    return ecopontos;

  } catch (error) {

    console.error(
      'Erro ao buscar ecopontos:',
      error,
    );

    return [];
  }
};