<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

const MAP_DIV_ID = 'mapdiv';
var onemap;
const searchQuery = ref('');
let allMarkers = []; // NOTE: Used to clear past results.

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
        onemap.setView([lat, lng], 17); // Recenter map

        // TODO: Grab from firebase.
        const SIMULATED_NEARBY = [
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
        updateMapDiv(SIMULATED_NEARBY);
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
                      <img src="${data.img}" class="img-fluid rounded-start me-1" alt="${data.name}">
                    </div>
                    <div class="col-8">
                      <div class="card-body p-0">
                        <h6 class="card-title mb-1">${data.name}</h6>
                        <p class="card-text small text-muted m-0">
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

    async function initMap() {
        if (!window.L) {
            console.error('Leaflet not loaded');
            return;
        }

        const sw = L.latLng(1.144, 103.535);
        const ne = L.latLng(1.494, 104.502);
        const bounds = L.latLngBounds(sw, ne);

        onemap = L.map(MAP_DIV_ID, {
            center: L.latLng(1.2868108, 103.8545349), // fallback
            zoom: 16,
        });
        onemap.setMaxBounds(bounds);

        const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            minZoom: 11,
        });
        basemap.addTo(onemap);

        // If we can get the user's device location.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    console.log('User location:', latitude, longitude);

                    onemap.setView([latitude, longitude], 17);

                    // Add user location marker.
                    const userMarker = L.circleMarker([latitude, longitude], {
                        radius: 8,
                        fillColor: '#007bff',
                        color: '#ffffff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    }).addTo(onemap);

                    // TODO: Need to grab from firebase.
                    const SIMULATED_NEARBY = [
                        {
                            name: 'Nearby Café',
                            coords: [latitude + 0.001, longitude + 0.001],
                            img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Latte_and_dark_coffee.jpg/320px-Latte_and_dark_coffee.jpg',
                            desc: 'A cozy café just a few minutes away.'
                        },
                        {
                            name: 'Community Park',
                            coords: [latitude - 0.001, longitude + 0.0015],
                            img: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Community_park.jpg',
                            desc: 'A green spot nearby for walks and relaxation.'
                        },
                        {
                            name: 'Local Food Centre',
                            coords: [latitude - 0.0015, longitude - 0.001],
                            img: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Hawker_centre_food.jpg',
                            desc: 'A nearby hawker centre with authentic local dishes.'
                        }
                    ];
                    updateMapDiv(SIMULATED_NEARBY);
                },
                err => {
                    console.warn('Geolocation failed or denied:', err.message);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
            );
        } else {
            console.warn("Geolocation not supported by this browser.");
        }
    }
});


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
