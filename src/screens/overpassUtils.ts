import axios from 'axios';

export const WASTE_TAGS: { [key: string]: string } = {
  plastico: 'recycling:plastic',
  papel: 'recycling:paper',
  vidro: 'recycling:glass',
  metal: 'recycling:metal',
  eletronicos: 'recycling:electronics',
  pilhas: 'recycling:batteries',
};

export const fetchRecyclingPoints = async (lat: number, lon: number, wasteTypes: string[] = []) => {
  try {
    const radius = 20000; // Aumentamos para 20km para garantir que ache algo
    let filters = '';

    if (wasteTypes.length > 0) {
      // Busca locais que tenham QUALQUER uma das tags selecionadas
      const tagQueries = wasteTypes.map(type => {
        const tag = WASTE_TAGS[type];
        return `node["${tag}"="yes"](around:${radius},${lat},${lon});way["${tag}"="yes"](around:${radius},${lat},${lon});`;
      }).join('');
      filters = tagQueries;
    } else {
      // Busca geral por qualquer tipo de reciclagem ou lixeira de recicláveis
      filters = `
        node["amenity"="recycling"](around:${radius},${lat},${lon});
        way["amenity"="recycling"](around:${radius},${lat},${lon});
        node["vending"="recycling"](around:${radius},${lat},${lon});
      `;
    }

    const query = `[out:json][timeout:30];(${filters});out center;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query )}`;
    
    console.log("Buscando pontos..."); // Log para você ver no terminal que a busca começou
    
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'EcoMatch_Final_Check' },
      timeout: 20000 
    });
    
    if (!response.data || !response.data.elements || response.data.elements.length === 0) {
      console.log("Nenhum ponto encontrado nesta região.");
      return [];
    }

    console.log(`Sucesso! Encontrados ${response.data.elements.length} pontos.`);

    return response.data.elements.map((el: any) => ({
      id: el.id.toString(),
      lat: el.lat || el.center?.lat,
      lon: el.lon || el.center?.lon,
      name: el.tags.name || el.tags.operator || "Ponto de Descarte",
      address: el.tags["addr:street"] ? `${el.tags["addr:street"]}, ${el.tags["addr:housenumber"] || ""}` : "Endereço próximo",
      opening_hours: el.tags.opening_hours,
      phone: el.tags.phone || el.tags['contact:phone'],
      types: Object.keys(el.tags).filter(t => t.startsWith('recycling:')).map(t => t.split(':')[1])
    }));
  } catch (error) {
    console.error("Erro na conexão com o mapa:", error);
    return [];
  }
};
