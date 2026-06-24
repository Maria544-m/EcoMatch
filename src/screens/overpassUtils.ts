// Importa a biblioteca Axios para realizar requisições HTTP
import axios from 'axios';

// Objeto que relaciona os tipos de resíduos com as tags do OpenStreetMap
export const WASTE_TAGS: { [key: string]: string } = {
  plastico: 'recycling:plastic',
  papel: 'recycling:paper',
  vidro: 'recycling:glass',
  metal: 'recycling:metal',
  eletronicos: 'recycling:electronics',
  pilhas: 'recycling:batteries',
};

// Função para realizar geocodificação reversa usando Nominatim
const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await axios.get(nominatimUrl, {
      headers: {
        'User-Agent': 'EcoMatch_Final_Check' // User-Agent é importante para Nominatim
      },
      timeout: 5000 // Curto timeout para geocodificação reversa
    });

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    } else {
      return "Endereço não encontrado via geocodificação";
    }
  } catch (error) {
    console.error("Erro na geocodificação reversa:", error);
    return "Endereço não disponível";
  }
};

// Função responsável por buscar pontos de reciclagem próximos
export const fetchRecyclingPoints = async (
  lat: number,
  lon: number,
  wasteTypes: string[] = []
) => {
  try {
    const radius = 20000; // Raio de busca em metros (20 km)
    let filters = '';

    if (wasteTypes.length > 0) {
      // Se filtros específicos forem selecionados, busca por eles E por pontos genéricos de reciclagem
      const specificTagQueries = wasteTypes.map(type => {
        const tag = WASTE_TAGS[type];
        return `
          node["${tag}"="yes"](around:${radius},${lat},${lon});
          way["${tag}"="yes"](around:${radius},${lat},${lon});
        `;
      }).join('');

      // Adiciona também a busca por pontos genéricos de reciclagem para complementar
      filters = `
        ${specificTagQueries}
        node["amenity"="recycling"](around:${radius},${lat},${lon});
        way["amenity"="recycling"](around:${radius},${lat},${lon});
        node["vending"="recycling"](around:${radius},${lat},${lon});
      `;
    } else {
      // Caso nenhum filtro seja selecionado, busca todos os pontos de reciclagem disponíveis
      filters = `
        node["amenity"="recycling"](around:${radius},${lat},${lon});
        way["amenity"="recycling"](around:${radius},${lat},${lon});
        node["vending"="recycling"](around:${radius},${lat},${lon});
      `;
    }

    const query = `
      [out:json][timeout:30];
      (
        ${filters}
      );
      out center;
    `;

    const url =
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    console.log("Buscando pontos...");
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'EcoMatch_Final_Check'
      },
      timeout: 20000
    });

    if (
      !response.data ||
      !response.data.elements ||
      response.data.elements.length === 0
    ) {
      console.log("Nenhum ponto encontrado nesta região.");
      return [];
    }

    console.log(
      `Sucesso! Encontrados ${response.data.elements.length} pontos.`
    );

    // Processa os elementos, removendo duplicatas e priorizando informações
    const uniquePointsMap = new Map();

    for (const el of response.data.elements) {
      // Garante que o elemento tem coordenadas válidas
      const pointLat = el.lat || el.center?.lat;
      const pointLon = el.lon || el.center?.lon;
      if (!pointLat || !pointLon) continue;

      const id = el.id.toString();

      let address = "Endereço não disponível";
      if (el.tags["addr:full"]) {
        address = el.tags["addr:full"];
      } else if (el.tags["addr:street"]) {
        address = `${el.tags["addr:street"]}${el.tags["addr:housenumber"] ? `, ${el.tags["addr:housenumber"]}` : ''}`;
        if (el.tags["addr:city"]) address += `, ${el.tags["addr:city"]}`;
        if (el.tags["addr:postcode"]) address += ` - ${el.tags["addr:postcode"]}`;
      } else if (el.tags.address) { 
        address = el.tags.address;
      } else if (el.tags.description) { 
        address = el.tags.description;
      }

      // Se o endereço ainda estiver indisponível, tenta geocodificação reversa
      if (address === "Endereço não disponível" || address === "Endereço próximo") {
        address = await reverseGeocode(pointLat, pointLon);
      }

      // Lógica para extrair os tipos de resíduos aceitos
      const acceptedTypes = Object.keys(el.tags)
        .filter(t => t.startsWith('recycling:') && el.tags[t] === 'yes') 
        .map(t => t.split(':')[1]);

      const point = {
        id: id,
        lat: pointLat,
        lon: pointLon,
        name:
          el.tags.name ||
          el.tags.operator ||
          "Ponto de Descarte",
        address: address,
        opening_hours: el.tags.opening_hours,
        phone:
          el.tags.phone ||
          el.tags['contact:phone'],
        types: acceptedTypes.length > 0 ? acceptedTypes : ['Recicláveis (informação detalhada não disponível)'],
      };

      // Adiciona ou atualiza o ponto no mapa, priorizando informações mais completas
      if (!uniquePointsMap.has(id) || (uniquePointsMap.get(id).address === "Endereço não disponível" && point.address !== "Endereço não disponível")) {
        uniquePointsMap.set(id, point);
      }
    }

    return Array.from(uniquePointsMap.values());

  } catch (error) {
    console.error("Erro na conexão com o mapa:", error);
    throw new Error("Não foi possível carregar os pontos de reciclagem. Tente novamente mais tarde.");
  }
};