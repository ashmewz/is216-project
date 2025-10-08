<script setup>
import { onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

const MAP_DIV_ID = 'mapdiv';
var onemap;

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

        // Map bounds
        const sw = L.latLng(1.144, 103.535);
        const ne = L.latLng(1.494, 104.502);
        const bounds = L.latLngBounds(sw, ne);

        onemap = L.map(MAP_DIV_ID, {
            center: L.latLng(1.2868108, 103.8545349),
            zoom: 16,
        })
        onemap.setMaxBounds(bounds);

        // Base layer
        const basemap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
            detectRetina: true,
            maxZoom: 19,
            minZoom: 11,
            // NOTE: Seems like the API already gives you an attribution.
            //   attribution:
            //     '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;"/>&nbsp;' +
            //     '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;' +
            //     '<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>',
        });

        basemap.addTo(onemap);


        // TODO: Call from firebase and grab data instead.
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
                img: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Marina_Bay_Sands_in_the_evening_-_20101120.jpg',
                desc: 'Futuristic park featuring Supertree structures and climate-controlled domes.'
            }
        ];
        updateMapDiv(TEST_PLACES);
    }

    function updateMapDiv(catMapData) {
        if (!window.L) {
            console.error('Leaflet not loaded')
            return
        }

        const mapDiv = document.getElementById(MAP_DIV_ID);
        if (!mapDiv) {
            console.error("Map Div not found");
            return;
        }

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
            L.marker(data.coords)
                .addTo(onemap)
                .bindPopup(popupContent, {
                    maxWidth: 250,
                    closeButton: true,
                    autoClose: false,
                });
        });
    }
})
</script>

<template>
    <Navbar>
        <template #navbar-title>Map</template>
    </Navbar>

    <div class="container">
        <h2>TODO: Search Bar here</h2>
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
