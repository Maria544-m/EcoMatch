// Importa a biblioteca Axios para realizar requisições HTTP
import axios from 'axios';

// Objeto que relaciona os tipos de resíduos com as tags do OpenStreetMap
export const WASTE_TAGS: { [key: string]: string } = {

  // Plástico
  plastico: 'recycling:plastic',

  // Papel
  papel: 'recycling:paper',

  // Vidro
  vidro: 'recycling:glass',

  // Metal
  metal: 'recycling:metal',

  // Eletrônicos
  eletronicos: 'recycling:electronics',

  // Pilhas e baterias
  pilhas: 'recycling:batteries',
};

// Função responsável por buscar pontos de reciclagem próximos
export const fetchRecyclingPoints = async (

  // Latitude da localização do usuário
  lat: number,

  // Longitude da localização do usuário
  lon: number,

  // Lista de tipos de resíduos selecionados
  wasteTypes: string[] = []

) => {

  try {

    // Raio de busca em metros (20 km)
    const radius = 20000;

    // Variável que armazenará os filtros da consulta
    let filters = '';

    // Verifica se o usuário selecionou algum filtro
    if (wasteTypes.length > 0) {

      // Cria consultas para cada tipo de resíduo selecionado
      const tagQueries = wasteTypes.map(type => {

        // Obtém a tag correspondente ao tipo selecionado
        const tag = WASTE_TAGS[type];

        // Retorna a consulta Overpass para nós e vias
        return `
          node["${tag}"="yes"](around:${radius},${lat},${lon});
          way["${tag}"="yes"](around:${radius},${lat},${lon});
        `;

      }).join('');

      // Salva todas as consultas em uma única string
      filters = tagQueries;

    } else {

      // Caso nenhum filtro seja selecionado,
      // busca todos os pontos de reciclagem disponíveis
      filters = `

        // Pontos de reciclagem
        node["amenity"="recycling"](around:${radius},${lat},${lon});
        way["amenity"="recycling"](around:${radius},${lat},${lon});

        // Máquinas de coleta/reciclagem
        node["vending"="recycling"](around:${radius},${lat},${lon});

      `;
    }

    // Monta a consulta completa para a Overpass API
    const query = `
      [out:json][timeout:30];
      (
        ${filters}
      );
      out center;
    `;

    // Cria a URL codificando a consulta
    const url =
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    // Exibe mensagem no terminal indicando início da busca
    console.log("Buscando pontos...");

    // Faz a requisição para a API
    const response = await axios.get(url, {

      // Identificação da aplicação
      headers: {
        'User-Agent': 'EcoMatch_Final_Check'
      },

      // Tempo máximo de espera da requisição (20 segundos)
      timeout: 20000
    });

    // Verifica se não retornou resultados
    if (
      !response.data ||
      !response.data.elements ||
      response.data.elements.length === 0
    ) {

      // Exibe mensagem no terminal
      console.log("Nenhum ponto encontrado nesta região.");

      // Retorna lista vazia
      return [];
    }

    // Exibe quantidade de pontos encontrados
    console.log(
      `Sucesso! Encontrados ${response.data.elements.length} pontos.`
    );

    // Converte os dados da API para um formato mais fácil de usar
    return response.data.elements.map((el: any) => ({

      // ID único do ponto
      id: el.id.toString(),

      // Latitude do ponto
      lat: el.lat || el.center?.lat,

      // Longitude do ponto
      lon: el.lon || el.center?.lon,

      // Nome do local
      name:
        el.tags.name ||
        el.tags.operator ||
        "Ponto de Descarte",

      // Endereço do local
      address: el.tags["addr:street"]
        ? `${el.tags["addr:street"]}, ${el.tags["addr:housenumber"] || ""}`
        : "Endereço próximo",

      // Horário de funcionamento
      opening_hours: el.tags.opening_hours,

      // Telefone de contato
      phone:
        el.tags.phone ||
        el.tags['contact:phone'],

      // Lista dos materiais aceitos pelo ponto
      types: Object.keys(el.tags)

        // Filtra apenas tags de reciclagem
        .filter(t => t.startsWith('recycling:'))

        // Remove o prefixo "recycling:"
        .map(t => t.split(':')[1])

    }));

  } catch (error) {

    // Exibe erro caso a requisição falhe
    console.error(
      "Erro na conexão com o mapa:",
      error
    );

    // Retorna lista vazia para evitar travamentos
    return [];
  }
};