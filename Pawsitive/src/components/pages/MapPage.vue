<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

const MAP_DIV_ID = 'mapdiv';
var onemap;
const searchQuery = ref('');
let allMarkers = []; // to clear old ones

const performSearch = async () => {
    const query = searchQuery.value.trim();
    if (!query) return alert("Please enter a location!");

    try {
        const resp = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
        const data = await resp.json();
        if (data.found === 0 || !data.results?.length) {
            alert("No results found!");
            return;
        }

        const result = data.results[0];
        const lat = parseFloat(result.LATITUDE);
        const lng = parseFloat(result.LONGITUDE);

        // Recenter map
        onemap.setView([lat, lng], 17);

        // Simulate loading nearby places (for demo)
        const simulatedNearby = [
            {
                name: `${result.SEARCHVAL} Place A`,
                coords: [lat + 0.002, lng + 0.002],
                img: 'https://upload.wikimedia.org/wikipedia/commons/2/20/View_of_MBS_from_the_gardens_%288026531707%29.jpg',
                desc: 'Nearby point of interest.'
            },
            {
                name: `${result.SEARCHVAL} Place B`,
                coords: [lat - 0.002, lng - 0.001],
                img: 'https://imgcdn.flamingotravels.co.in/Images/PlacesOfInterest/Gardens-By-The-Bay-3.jpg',
                desc: 'Another nearby location.'
            }
        ];
        updateMapDiv(simulatedNearby);
    } catch (e) {
        console.error("Search error:", e);
        alert("Failed to fetch location.");
    }
};

function updateMapDiv(catMapData) {
    if (!window.L) {
        console.error('Leaflet not loaded')
        return
    }

    // Clear previous markers
    allMarkers.forEach(m => onemap.removeLayer(m));
    allMarkers = [];

    const markerIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    catMapData.forEach(data => {
        const popupContent = `
                <div class="card" style="width: 18rem; border: none;">
                  <div class="row g-0 align-items-center">
                    <div class="col-4">
                      <img src="${data.img}"
                           class="img-fluid rounded-start" alt="${data.name}">
                    </div>
                    <div class="col-8">
                      <div class="card-body py-2 px-3">
                        <h6 class="card-title mb-1">${data.name}</h6>
                        <p class="card-text small text-muted mb-0">
                            ${data.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>`;

        const marker = L.marker(data.coords, { icon: markerIcon })
            .addTo(onemap)
            .bindPopup(popupContent, { maxWidth: 300, closeButton: true, autoClose: false });

        marker.on('mouseover', function () { this.openPopup(); })
        marker.on('mouseout', function () { this.closePopup(); })
        allMarkers.push(marker);
    });
}


onMounted(async () => {
    const leafletCSS = document.createElement('link')
    leafletCSS.rel = 'stylesheet'
    leafletCSS.href = 'https://www.onemap.gov.sg/web-assets/libs/leaflet/leaflet.css'
    document.head.appendChild(leafletCSS)

    const leafletScript = document.createElement('script')
    leafletScript.src = 'https://www.onemap.gov.sg/web-assets/libs/leaflet/onemap-leaflet.js'
    leafletScript.onload = initMap
    document.body.appendChild(leafletScript)

    function initMap() {
        if (!window.L) {
            console.error('Leaflet not loaded');
            return;
        }

        const sw = L.latLng(1.144, 103.535);
        const ne = L.latLng(1.494, 104.502);
        const bounds = L.latLngBounds(sw, ne);

        onemap = L.map(MAP_DIV_ID, {
            center: L.latLng(1.2868108, 103.8545349),
            zoom: 16,
        })
        onemap.setMaxBounds(bounds);

        const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            minZoom: 11,
        });
        basemap.addTo(onemap);

        const TEST_PLACES = [
            {
                name: 'Marina Bay Sands',
                coords: [1.2868108, 103.8545349],
                img: 'https://upload.wikimedia.org/wikipedia/commons/2/20/View_of_MBS_from_the_gardens_%288026531707%29.jpg',
                desc: 'Iconic integrated resort fronting Marina Bay with hotel, casino, and skypark.'
            },
            {
                name: 'Gardens by the Bay',
                coords: [1.2816, 103.8636],
                img: 'https://imgcdn.flamingotravels.co.in/Images/PlacesOfInterest/Gardens-By-The-Bay-3.jpg',
                desc: 'Futuristic park featuring Supertree structures and climate-controlled domes.'
            }
        ];
        updateMapDiv(TEST_PLACES);
    }

})
</script>

<template>
    <Navbar>
        <template #navbar-title>Map</template>
    </Navbar>

    <div class="container">
        <!-- 🔍 Search Bar -->
        <div class="input-group my-3">
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Search for a place..." />
            <button class="btn btn-primary" @click="performSearch()">Search</button>
        </div>

        <div id="mapdiv" class="map-container"></div>
    </div>

    <BottomFooter />
</template>

<style scoped>
a {
    display: inline-flex;
}

:deep(.leaflet-control-attribution) {
    display: inline-flex !important;
    align-items: center !important;
}

.map-container {
    width: 100%;
    height: 600px;
    margin: 1rem 0;
    border: 1px solid #ccc;
    border-radius: 8px;
}
</style>
