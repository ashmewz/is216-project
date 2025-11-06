<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const MAP_DIV_ID = 'mapdiv';
let onemap;
const searchQuery = ref('');
let allMarkers = []; // NOTE: Used to clear past results.
let moveThrottleTimeout = null; // throttle timer
const THROTTLE_INTERVAL = 1000;
const POLL_TOLERANCE = 0.01;
let lastCenter = { lat: 0, lng: 0 };

const MAX_ZOOM = 19;
const DEFAULT_ZOOM = 17;
const MIN_ZOOM = 15;

var curCatPopup = null;

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
        const zoom = DEFAULT_ZOOM;
        onemap.setView([lat, lng], zoom);

        updateMapDiv(await getCatData(lat, lng, zoom));
    } catch (e) {
        console.error("Search error:", e);
        alert("Failed to fetch location.");
    }
};

async function getCatData(lat, lng, zoom) {
    const catsRef = collection(db, "cats");
    const snapshot = await getDocs(catsRef);
    const center = { lat, lng };

    // Adjust threshold dynamically by zoom level
    const baseThreshold = 0.02; // ~2km radius rough
    const threshold = baseThreshold / Math.pow(2, (zoom - 15));

    const cats = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.last_location) return;

        const { _lat: catLat, _long: catLng } = data.last_location;
        if (
            Math.abs(catLat - center.lat) <= threshold &&
            Math.abs(catLng - center.lng) <= threshold
        ) {
            cats.push({
                id: doc.id,
                name: data.name || "Unnamed Cat",
                coords: [catLat, catLng],
                img: data.photos?.[0] || "https://cataas.com/cat",
                color: data.color || "Unknown",
                gender: data.gender || "Unknown",
                neutered: data.neutered || "Unknown",
                species: data.species || "Unknown",
                age: data.age || "Unknown",
                status: data.status || "Unknown",
                last_seen: data.last_seen
                    ? new Date(data.last_seen.seconds * 1000).toLocaleString()
                    : "Unknown",
                desc: data.description || "No additional info",
            });
        }
    });

    console.log(`Loaded ${cats.length} cats from Firestore within threshold ${threshold.toFixed(4)}`);
    return cats;
}

function updateMapDiv(catMapData) {
    if (!window.L) {
        console.error('Leaflet not loaded')
        return
    }
    if (!catMapData) return;
    console.log(catMapData);

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

    catMapData.forEach((data) => {
        const popupContent = `
  <div class="popup-card shadow-sm rounded overflow-hidden" style="font-family: system-ui, sans-serif;">
    <div class="popup-inner d-flex align-items-start">
      <div class="popup-img-container me-2">
        <img src="${data.img}" alt="${data.name}" class="popup-img" />
      </div>
      <div class="popup-info flex-grow-1">
        <h6 class="popup-title fw-bold mb-1">${data.name}</h6>
        <div class="popup-meta small">
          <span><strong>Species:</strong> ${data.species}</span><br>
          <span><strong>Gender:</strong> ${data.gender}</span><br>
          <span><strong>Status:</strong> ${data.status}</span><br>
        </div>
        <a href="/cat/${data.id}" 
           onclick="window.open(this.href, '_blank'); return false;" 
           class="popup-link d-inline-block mt-1">View full profile →</a>
      </div>
    </div>
  </div>
`;



        const marker = L.marker(data.coords, { icon: markerIcon })
            .addTo(onemap)
            .bindPopup(popupContent, {
                maxWidth: 300,
                closeButton: true,
                autoClose: false,
            });

        marker.on("mouseover", function () {
            if (curCatPopup != null) {
                curCatPopup.closePopup();
            }
            curCatPopup = this;
            curCatPopup.openPopup();
        });
        // marker.on("mouseout", function () {
        //     this.closePopup();
        // });
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

        lastCenter.lat = 1.2868108;
        lastCenter.lng = 103.8545349;
        onemap = L.map(MAP_DIV_ID, {
            center: L.latLng(lastCenter.lat, lastCenter.lng),
            zoom: DEFAULT_ZOOM,
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
            moveThrottleTimeout = setTimeout(async () => {
                const center = onemap.getCenter();
                const zoom = onemap.getZoom();
                if (Math.abs(lastCenter.lat - center.lat) <= POLL_TOLERANCE &&
                    Math.abs(lastCenter.lng - center.lng) <= POLL_TOLERANCE) return;

                console.log('Updating Map: Map moved prev:', lastCenter, ' → new center:', center, 'zoom:', zoom);
                lastCenter.lat = center.lat;
                lastCenter.lng = center.lng;
                updateMapDiv(await getCatData(center.lat, center.lng, zoom));
            }, THROTTLE_INTERVAL);
        });

        // If we can get the user's device location.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async pos => {
                    const { latitude, longitude } = pos.coords;
                    lastCenter.lat = latitude;
                    lastCenter.lng = longitude;
                    console.log('User location:', latitude, longitude);
                    const zoom = DEFAULT_ZOOM;
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

                    updateMapDiv(await getCatData(latitude, longitude, zoom));
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

        <div class="content pawsitive-background">
            <div class="map-page-container">
                <div class="search-overlay input-group">
                    <input type="text" v-model="searchQuery" class="pawsitive-input" placeholder="Search for a place..."
                        @keyup.enter="performSearch" />
                    <button class="btn btn-primary pawsitive-color" @click="performSearch">Search</button>
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
    /* Full viewport height */
    height: 100vh;
    /* Prevent vertical scrolling */
    overflow: hidden;
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
    position: relative;
}

.map-container {
    flex: 1;
    /* stretch fully within given container */
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
}

.search-overlay {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translate(-50%);
    width: 80%;
    z-index: 10000;
    background: #f8e1e1;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
    padding: 0.75rem;
    margin: 0rem 1.6rem;
}

.search-overlay .pawsitive-input {
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    height: auto;
    flex: 1 1 auto;
    width: 1%;
    min-width: 0;
    border-radius: 50rem !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

:deep(.leaflet-control-attribution) {
    display: inline-flex !important;
    align-items: center !important;
}

:deep(.leaflet-popup-content-wrapper) {
    padding: 0 !important;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
    margin: 0 !important;
    padding: 0 !important;
    width: 280px !important;
}

:deep(.popup-card) {
    background-color: #f8e1e1;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid #eee;
    padding: 0.5rem;
}

:deep(.popup-inner) {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
}

:deep(.popup-img-container) {
    flex-shrink: 0;
    width: 85px;
    height: 85px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
}

:deep(.popup-img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

:deep(.popup-info) {
    flex: 1;
    min-width: 0;
}

:deep(.popup-title) {
    font-size: 0.95rem;
    color: #806e83;
}

:deep(.popup-desc) {
    font-size: 0.8rem;
    color: #806e83 !important;
}

:deep(.popup-meta) {
    line-height: 1.1;
    font-size: 0.75rem;
    color: #806e83;
}

:deep(.popup-link) {
    font-size: 0.75rem;
    text-decoration: none;

    color: white !important;

    border: 2px solid #806e83;
    border-radius: 25px;
    background: #806e83 !important;
    margin: 0px;
    padding: 0px 8px;
}

:deep(.popup-link:hover) {
    text-decoration: none;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
}
</style>
