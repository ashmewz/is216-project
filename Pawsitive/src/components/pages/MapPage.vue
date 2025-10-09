<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

const MAP_DIV_ID = 'mapdiv';
let onemap;
const searchQuery = ref('');
let allMarkers = []; // NOTE: Used to clear past results.
let moveThrottleTimeout = null; // throttle timer
const THROTTLE_INTERVAL = 1000;

const MAX_ZOOM = 19;
const MIN_ZOOM = 15;

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
        const zoom = 17;
        onemap.setView([lat, lng], zoom);

        updateMapDiv(getCatData(lat, lng, zoom));
    } catch (e) {
        console.error("Search error:", e);
        alert("Failed to fetch location.");
    }
};

function getCatData(lat, lng, zoom) {
    return generateSimulatedData(lat, lng, zoom);
}

// TODO: Replace this later with firebase
function generateSimulatedData(lat, lng, zoomLevel) {
    const MAX_POINTS = 20;
    const MIN_POINTS = 2;
    const numPoints = Math.min(
        MAX_POINTS,
        Math.max(
            MIN_POINTS,
            Math.floor((MAX_ZOOM - zoomLevel) * (MAX_POINTS / (MAX_ZOOM - MIN_ZOOM)))
        )
    ) // More zoom results in more data given
    console.log("numPoints generated for fake data: " + numPoints);

    const markers = []
    for (let i = 0; i < numPoints; i++) {
        const offsetLat = (Math.random() - 0.5) * (0.25 / zoomLevel)
        const offsetLng = (Math.random() - 0.5) * (0.25 / zoomLevel)
        markers.push({
            name: `Simulated Cat ${i + 1}`,
            coords: [lat + offsetLat, lng + offsetLng],
            image: 'https://picsum.photos/80?random=' + i,
            img: [
                'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg',
                'https://cataas.com/cat',
                'https://cataas.com/cat/gif',
                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Six_weeks_old_cat_%28aka%29.jpg/1200px-Six_weeks_old_cat_%28aka%29.jpg',
                'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/250px-Cat_November_2010-1a.jpg',
            ][i % 5],
            desc: `Zoom Level: ${zoomLevel}. Randomly generated nearby cat profile.`,
        })
    }
    return markers
}

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
                    <p class="card-text small text-muted m-0">${data.desc}</p>
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
            center: L.latLng(1.2868108, 103.8545349),
            zoom: 16,
        });
        onemap.setMaxBounds(bounds);

        const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: MAX_ZOOM,
            minZoom: MIN_ZOOM,
        });
        basemap.addTo(onemap);

        // NOTE: To not spam our firebase, we need to throttle cap the updates.
        onemap.on('moveend', () => {
            if (moveThrottleTimeout) clearTimeout(moveThrottleTimeout);
            moveThrottleTimeout = setTimeout(() => {
                const center = onemap.getCenter();
                const zoom = onemap.getZoom();
                console.log('Map moved → center:', center, 'zoom:', zoom);

                updateMapDiv(getCatData(center.lat, center.lng, zoom));
            }, THROTTLE_INTERVAL);
        });

        // If we can get the user's device location.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    console.log('User location:', latitude, longitude);
                    const zoom = 17;
                    onemap.setView([latitude, longitude], zoom);

                    // Add user location marker.
                    const userMarker = L.circleMarker([latitude, longitude], {
                        radius: 8,
                        fillColor: '#007bff',
                        color: '#ffffff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.9
                    }).addTo(onemap);

                    updateMapDiv(getCatData(latitude, longitude, zoom));
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
    <div class="page-wrapper">
        <Navbar>
            <template #navbar-title>Map</template>
        </Navbar>

        <div class="content">
            <div class="map-page-container">
                <div class="input-group p-3">
                    <input type="text" v-model="searchQuery" class="form-control" placeholder="Search for a place..." />
                    <button class="btn btn-primary" @click="performSearch">Search</button>
                </div>

                <div id="mapdiv" class="map-container"></div>
            </div>
        </div>

        <BottomFooter />
    </div>
</template>

<style scoped>
.page-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    /* Full viewport height */
    overflow: hidden;
    /* Prevent vertical scrolling */
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.map-page-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.map-container {
    flex: 1;
    /* stretch fully within given container */
    width: 100%;
    border: 1px solid #ccc;
}

:deep(.leaflet-control-attribution) {
    display: inline-flex !important;
    align-items: center !important;
}
</style>
