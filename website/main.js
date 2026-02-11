require("dotenv").config()

const mapApiKey = process.env.MAPSKEY;
const centerCoordinates = { lat: 37.7749, lng: -122.4194 };

const map = L.map('map').setView([centerCoordinates.lat, centerCoordinates.lng]);
L.tileLayer(`https://maps.googleapis.com/maps/api/staticmap?center=${centerCoordinates.lat},
    ${centerCoordinates.lng}&zoom=15&size=600x300&maptype=satellite&key=${mapApiKey}`, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
}).addTo(map);

async function fetchStreetData() {
    const params = `
        [out:json];
        (
            way["highway"](around:1000, ${centerCoordinates.lat}, ${centerCoordinates.lng});
            relation["highway"](around:1000, ${centerCoordinates.lat}, ${centerCoordinates.lng});
        );
        out body;
    `;

    const response = await fetch(`http://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
}

function buildGraph(data){
    const graph = {};
    data.elements.forEach(element => {
        if (element.type == 'way'){
            const nodes = element.nodes;
            for (let i = 0; i < nodes.length - 1; i++){
                const from = nodes[i];
                const to = nodes[i + 1];
                if(!graph[from]) graph[from] = {};
                if(!graph[to]) graph[to] = {};
                graph[from][to] = 1;
                graph[to][from] = 1;
            }
        }
    });
    return graph;
}

function dijkstra(){
    const distances = {};
    const previous = {};
    const queue = new Set();

    for(const vertex in graph){
        distances[vertex] = Infinity;
        previous[vertex] = null;
        queue.add(vertex);

        distances[start] = 0;
    }
    distances[start] = 0;

    while(queue.size) {
        const currentVertex = [...queue].reduce((minVertex, vertex) => 
            distances[vertex] < distances[minVertex] ? vertex : minVertex
        );

        if (distances[currentVertex] == Infinity) break;
        queue.delete(currentVertex);
        for (const neighbor in graph[currentVertex]){
            const alt = distances[currentVertex] + graph[currentVertex][neighbor];
            if (alt < distances[neighbor]){
                distances[neighbor] = alt;
                previous[neighbor] = currentVertex;
            }
        }
    }
    const path = [];
    for (let at = end; at !== null; at = previous[at]){
        path.push(at);
    }
    path.reverse();
    return path.length ? path : null;

}