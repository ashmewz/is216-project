<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import CatReportCard from '@/components/resuables/CatReportCard.vue'
import NearbyCatsList from '@/components/resuables/NearbyCatsList.vue'
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy, where, GeoPoint } from 'firebase/firestore'
import { getAuth } from "firebase/auth"
import { validateCatReport } from '@/utils/validators'
import { Client } from "@gradio/client"

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const db = getFirestore()
const auth = getAuth()

// -------------------- Reactive State --------------------
const report = reactive({
  status: '',
  condition: '',
  name: '',
  species: '',
  estimatedAge: '',
  gender: 'Unknown',
  neutered: 'Unknown',
  location: '',
  coords: null,
  description: '',
  imageFile: null,
  imagePreview: null,
  severity: 0
})

const reports = ref([])
const reportsLoading = ref(true)
const fieldErrors = ref({})
const showModal = ref(false)

const sidebarOpen = ref(false)
const fileInput = ref(null)

const searchQuery = ref('SMU');

const isLoading = ref(false)
const breedResult = ref(null)
const firstBreed = ref(null)
const nearbyCats = ref([])

const allPredictedCats = ref([]); // 🆕 store predicted cats globally

const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const justSelectedSuggestion = ref(false);

let map = null;
let userMarker = null;
let userCircle = null;
let catMarkers = [];
let curCatPopup = null;
const showMap = ref(false);

const otherCatsOpen = ref(false);

const RADIUS_METERS = 2000;

// -------------------- Reverse Geocoding (Nominatim) --------------------
async function reverseGeocode(lat, lon) {
  if (lat == null || lon == null) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=16&addressdetails=1`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await resp.json();
    return data?.display_name ?? null;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return null;
  }
}

// -------------------- Utility Functions --------------------
function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function roughlySameArea(a, b, marginMeters, opts = {}) {
  const getCoords = obj =>
    Array.isArray(obj)
      ? obj
      : [obj.lat ?? obj.latitude ?? obj._lat, obj.lon ?? obj.longitude ?? obj._long];

  const [lat1, lon1] = getCoords(a);
  const [lat2, lon2] = getCoords(b);
  if ([lat1, lon1, lat2, lon2].some(v => v == null))
    return { within: false, meters: Infinity, threshold: marginMeters };

  const dist = haversineMeters(lat1, lon1, lat2, lon2);
  const extra = Math.max(0, opts.accuracyA || 0, opts.accuracyB || 0);
  const threshold = marginMeters + extra;
  return { within: dist <= threshold, meters: dist, threshold };
}

function extractFirstBreed(breedResult) {
  if (!breedResult) return null;
  let text = Array.isArray(breedResult) ? breedResult[0] : breedResult;
  const match = text.match(/^\d+\.\s*([^(]+)/m);
  return match ? match[1].trim() : null;
}

async function getCoordinatesFromQuery(query) {
  if (!query) return null;
  try {
    const resp = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(query)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
    const data = await resp.json();
    if (data.found === 0 || !data.results?.length) return null;
    const result = data.results[0];
    return { lat: parseFloat(result.LATITUDE), lng: parseFloat(result.LONGITUDE) };
  } catch (err) {
    console.error("OneMap fetch error:", err)
    return null;
  }
}

async function updateLocation() {
  if (!report.location) return alert("Please enter a location!");
  const coords = await getCoordinatesFromQuery(report.location);
  if (!coords) {
    alert("Failed to resolve location. Check your input.");
    report.coords = null;
    return;
  }
  report.coords = coords;
  console.log("Updated coordinates:", coords);
}

// -------------------- Location Suggestions --------------------
watch(() => report.location, async (newVal) => {
  // Skip fetching suggestions if we just selected one
  if (justSelectedSuggestion.value) {
    justSelectedSuggestion.value = false;
    return;
  }
  
  if (!newVal || newVal.length < 2) {
    locationSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  try {
    const resp = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(newVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
    );
    const data = await resp.json();
    if (data.found > 0) {
      locationSuggestions.value = data.results.slice(0, 5).map(r => ({
        label: r.ADDRESS,
        coords: { lat: parseFloat(r.LATITUDE), lng: parseFloat(r.LONGITUDE) }
      }));
      showSuggestions.value = true;
    } else {
      locationSuggestions.value = [];
      showSuggestions.value = false;
    }
  } catch (err) {
    console.error("Location suggestion error:", err);
    locationSuggestions.value = [];
    showSuggestions.value = false;
  }
});

function selectLocationSuggestion(suggestion) {
  justSelectedSuggestion.value = true;
  report.location = suggestion.label;
  report.coords = suggestion.coords;
  showSuggestions.value = false;
  
  // Trigger map update with new coordinates
  // The watcher will handle the map update automatically
}

// -------------------- Get User Location --------------------
function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, using fallback coordinates");
      resolve([1.36599, 103.9535]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve([pos.coords.latitude, pos.coords.longitude]),
      err => {
        console.error("Geolocation failed:", err);
        resolve([1.36599, 103.9535]);
      }
    );
  });
}

// -------------------- Filter Nearby Cats --------------------

function filterCatsByProximity(cats, myLocation, radiusMeters = RADIUS_METERS) {
  if (!myLocation) return [];

  const myLat = Array.isArray(myLocation) ? myLocation[0] : myLocation.lat;
  const myLng = Array.isArray(myLocation) ? myLocation[1] : myLocation.lng;

  const nearby = cats
    .map(cat => {
      const loc = cat.last_location;
      if (!loc) return null;

      let catLat, catLng;

      if (Array.isArray(loc)) {
        [catLat, catLng] = loc;
      } else if (loc.latitude !== undefined && loc.longitude !== undefined) {
        catLat = loc.latitude;
        catLng = loc.longitude;
      } else if (loc._lat !== undefined && loc._long !== undefined) {
        catLat = loc._lat;
        catLng = loc._long;
      } else {
        return null;
      }

      const dist = haversineMeters(myLat, myLng, catLat, catLng);
      return { ...cat, distanceMeters: dist, withinRadius: dist <= radiusMeters };
    })
    .filter(cat => cat && cat.withinRadius);

  return nearby;
}


// -------------------- Map Functions --------------------
function clearCatMarkers() {
  catMarkers.forEach(marker => map.removeLayer(marker));
  catMarkers = [];
}

async function initMapWithRadius(cats = []) {
  const [lat, lon] = report.coords
    ? [report.coords.lat, report.coords.lng]
    : await getLocation();

  // Persist current coords if not already set
  if (!report.coords) {
    report.coords = { lat, lng: lon };
  }

  if (!map) {
    map = L.map("map").setView([lat, lon], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
  } else {
    // Recenter map on subsequent calls to reflect new coordinates
    const currentZoom = map.getZoom();
    map.setView([lat, lon], currentZoom);
  }

  clearCatMarkers();

  // Create or move the user marker and circle
  if (userMarker) {
    userMarker.setLatLng([lat, lon]);
  } else {
    const youAreHerePopup = `
      <div style="text-align: center; padding: 0.5rem; font-family: system-ui, sans-serif;">
        <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">📍</div>
        <strong style="color: #806e83; font-size: 0.95rem;">You are here</strong>
      </div>
    `;
    
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    userMarker = L.marker([lat, lon], { icon: redIcon })
      .addTo(map)
      .bindPopup(youAreHerePopup, {
        closeButton: false,
        autoClose: false,
        className: 'you-are-here-popup'
      });
  }
  if (userCircle) {
    userCircle.setLatLng([lat, lon]);
    userCircle.setRadius(RADIUS_METERS);
  } else {
    userCircle = L.circle([lat, lon], { radius: RADIUS_METERS, color: "blue", fillColor: "#3b82f6", fillOpacity: 0.2 }).addTo(map);
  }

  // Ensure map recalculates layout in case container size changed
  setTimeout(() => map.invalidateSize(), 0);

  const markerIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Process each cat asynchronously to get geocoded addresses
  for (const cat of cats) {
    const loc = cat.last_location;
    const [catLat, catLon] = Array.isArray(loc) ? loc : [loc.latitude ?? loc._lat, loc.longitude ?? loc._long];
    if (!catLat || !catLon) continue;
    
    // Format the created_at timestamp
    const reportedAt = cat.created_at?.toDate 
      ? cat.created_at.toDate().toLocaleString([], { 
          year: 'numeric', 
          month: 'numeric', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : cat.created_at || 'Unknown';
    
    // Get actual location address using reverse geocoding
    let locationDisplay = `${catLat.toFixed(4)}, ${catLon.toFixed(4)}`; // Fallback to coordinates
    try {
      const address = await reverseGeocode(catLat, catLon);
      if (address) {
        locationDisplay = address;
      }
    } catch (err) {
      console.warn('Failed to geocode cat location:', err);
    }
    
    // Format distance
    const distanceDisplay = cat.distanceMeters 
      ? `${cat.distanceMeters.toFixed(2)} m` 
      : 'Unknown';
    
    // Create styled popup content
    const popupContent = `
      <div class="cat-popup-card">
        <div class="cat-popup-inner">
          <div class="cat-popup-img-container">
            <img src="${cat.photos?.[0] || 'https://cataas.com/cat'}" alt="${cat.name || 'Unnamed Cat'}" class="cat-popup-img" />
          </div>
          <div class="cat-popup-info">
            <h6 class="cat-popup-title">${cat.name || 'Unnamed Cat'}</h6>
            <div class="cat-popup-details">
              <div class="cat-popup-detail-item">
                <strong>Last Location:</strong><br>
                <span class="cat-popup-detail-value">${locationDisplay}</span>
              </div>
              <div class="cat-popup-detail-item">
                <strong>Reported At:</strong><br>
                <span class="cat-popup-detail-value">${reportedAt}</span>
              </div>
              <div class="cat-popup-detail-item">
                <strong>Estimated Distance:</strong><br>
                <span class="cat-popup-detail-value">${distanceDisplay}</span>
              </div>
            </div>
            <a href="/cat/${cat.id}" 
               onclick="window.open(this.href, '_blank'); return false;" 
               class="cat-popup-link">View Full Profile →</a>
          </div>
        </div>
      </div>
    `;
    
    const marker = L.marker([catLat, catLon], { icon: markerIcon })
      .addTo(map)
      .bindPopup(popupContent, {
        maxWidth: 350,
        minWidth: 340,
        closeButton: true,
        autoClose: false,
        className: 'cat-marker-popup'
      });
    
    // Change to click event instead of mouseover
    marker.on("click", function () {
      if (curCatPopup != null && curCatPopup !== this) {
        curCatPopup.closePopup();
      }
      curCatPopup = this;
    });
    
    catMarkers.push(marker);
  }
}

// -------------------- Watchers --------------------
// Update nearby cats and map when user selects a new location
watch(() => report.coords, (newCoords) => {
  if (!newCoords) return;
  console.log("New location selected:", newCoords);
  
  // If we have predicted cats from breed detection, filter them by proximity
  if (firstBreed.value && allPredictedCats.value.length > 0) {
    nearbyCats.value = filterCatsByProximity(allPredictedCats.value, newCoords, RADIUS_METERS);
    showMap.value = nearbyCats.value.length > 0;
    if (showMap.value) initMapWithRadius(nearbyCats.value);
  } else {
    // Hide map if no cats detected yet
    showMap.value = false;
  }
}, { deep: true });

// Watch for manual changes to cat breed input
watch(() => report.species, async (newBreed) => {
  if (!newBreed || !report.coords) {
    showMap.value = false;
    return;
  }
  
  console.log("Breed changed to:", newBreed);
  
  // Fetch cats of the new breed
  const cats = await fetchCatsByBreed(newBreed);
  allPredictedCats.value = cats;
  firstBreed.value = newBreed;
  
  // Filter by proximity to current location
  nearbyCats.value = filterCatsByProximity(cats, report.coords, RADIUS_METERS);
  showMap.value = nearbyCats.value.length > 0;
  
  if (showMap.value) {
    initMapWithRadius(nearbyCats.value);
  }
});

// -------------------- Breed Identification --------------------
async function fetchCatsByBreed(breedName) {
  if (!breedName) return [];
  try {
    const q = query(collection(db, "cats"), where("species", "==", breedName));
    const snapshot = await getDocs(q);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(cat => {
        const createdAt = cat.created_at?.toDate ? cat.created_at.toDate() : null;
        return createdAt && createdAt >= oneDayAgo;
      });
  } catch (err) {
    console.error("Fetch cats failed:", err);
    return [];
  }
}

async function identifyBreed(imageBlob) {
  try {
    isLoading.value = true;
    const myLocation = await getLocation();
    const client = await Client.connect("kevansoon/cat-breed-detector");
    const result = await client.predict("/predict", { image: imageBlob });
    if (!result.data) {
      breedResult.value = "Prediction returned no data.";
      return;
    }
    const breedText = Array.isArray(result.data) ? result.data[0] : result.data;
    breedResult.value = breedText;

    const breed = extractFirstBreed(breedText);
    firstBreed.value = breed;
    if (!breed) return;
    report.species = firstBreed.value;

    const cats = await fetchCatsByBreed(breed);
    allPredictedCats.value = cats;
    nearbyCats.value = filterCatsByProximity(cats, myLocation, RADIUS_METERS);
    showMap.value = nearbyCats.value.length > 0;
    if (showMap.value) initMapWithRadius(nearbyCats.value);
  } catch (err) {
    console.error("Identify breed failed:", err);
    breedResult.value = "Failed to process image or location.";
  } finally {
    isLoading.value = false;
  }
}

// -------------------- File Upload --------------------
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    report.imageFile = file;
    const reader = new FileReader();
    reader.onload = e => report.imagePreview = e.target.result;
    reader.readAsDataURL(file);
    identifyBreed(file);
  }
}

function removeImage() {
  report.imageFile = null;
  report.imagePreview = null;
  if (fileInput.value) fileInput.value.value = null;
  
  // Reset breed identification results
  breedResult.value = null;
  firstBreed.value = null;
  report.species = '';
  
  // Clear nearby cats and hide map
  nearbyCats.value = [];
  allPredictedCats.value = [];
  showMap.value = false;
  
  // Clear map markers if map exists
  if (map) {
    clearCatMarkers();
  }
}

// -------------------- Sidebar & Severity --------------------
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
function setSeverity(level) { report.severity = level }

// -------------------- Fetch Reports --------------------
const fetchReports = async () => {
  reportsLoading.value = true;
  try {
    const q = query(collection(db, "cats"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    const catsData = [];
    for (const docSnap of snapshot.docs) {
      const cat = { id: docSnap.id, ...docSnap.data() };
      if (cat.submittedBy) {
        const userDoc = await getDoc(doc(db, "volunteers", cat.submittedBy));
        cat.username = userDoc.exists() ? userDoc.data().username || "Unknown" : "Unknown";
        cat.avatar = userDoc.exists() ? userDoc.data().avatar || null : null;
      } else {
        cat.username = "Unknown";
        cat.avatar = null;
      }
      catsData.push(cat);
    }
    reports.value = catsData;
  } catch (err) {
    console.error("Failed to fetch cats", err);
  } finally {
    reportsLoading.value = false;
  }
}

// -------------------- Submit Report --------------------
const submitReport = async () => {
  const toValidate = {
    status: report.status,
    name: report.species,
    location: report.location,
    description: report.description,
    image: report.imagePreview
  };
  const errors = validateCatReport(toValidate);
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors;
    return;
  }
  const currentUser = auth.currentUser;
  if (!currentUser) return alert("You must be logged in to submit a report.");
  try {
    if (!report.coords) await updateLocation();
    if (!report.coords) return;
    const { lat, lng } = report.coords;
    await addDoc(collection(db, "cats"), {
      age: report.estimatedAge || "Unknown",
      name: report.name || "",
      color: "",
      condition: report.condition || "",
      created_at: serverTimestamp(),
      description: report.description || "",
      gender: report.gender || "",
      last_location: new GeoPoint(lat, lng),
      last_seen: serverTimestamp(),
      neutered: report.neutered || "",
      photos: report.imagePreview ? [report.imagePreview] : [],
      severity: report.severity || 0,
      species: report.species || "",
      status: report.status || ""
    });
    // Reset form
    report.status = '';
    report.name = '';
    report.species = '';
    report.location = '';
    report.description = '';
    report.imageFile = null;
    report.imagePreview = null;
    report.condition = '';
    report.severity = 0;
    report.gender = 'Unknown';
    report.neutered = 'Unknown';
    report.estimatedAge = '';
    report.coords = null;
    fieldErrors.value = {};
    breedResult.value = null;
    firstBreed.value = null;
    isLoading.value = false;
    if (fileInput.value) fileInput.value.value = null;

    fetchReports();
    showModal.value = false;
    alert("✅ Report submitted successfully!");
  } catch (err) {
    console.error("Error submitting report:", err);
    alert("Failed to submit report. Check console.");
  }
}

// -------------------- Mounted --------------------
onMounted(async () => {
  fetchReports();
  
  // Get user's current location and autofill the location field
  const [lat, lon] = await getLocation();
  report.coords = { lat, lng: lon };
  
  // Reverse geocode to get address and autofill location field
  const address = await reverseGeocode(lat, lon);
  if (address) {
    report.location = address;
  }
});
</script>



<template>
  <Navbar>
    <template v-slot:navbar-title>Report</template>
  </Navbar>
  
  <main class="pawsitive-background">
    <h2 class="report-header">Report a Lost/Injured Cat</h2>

  <form class="report-form" @submit.prevent="submitReport">


    <!-- Image Upload -->
    <div class="mb-3">
      <label class="form-label">Upload Image</label>
      <div class="file-upload-container">
        <input type="file" class="file-input-hidden" ref="fileInput" @change="handleFileUpload" accept="image/*" id="fileUpload" />
        <label for="fileUpload" class="pawsitive-btn file-upload-btn">
          {{ report.imageFile ? report.imageFile.name : 'Choose File' }}
        </label>
      </div>


      <!-- Preview Section -->
      <div v-if="report.imagePreview" class="image-preview-container mt-2 position-relative">
        <img :src="report.imagePreview" class="img-preview rounded" />
        <button type="button" class="btn btn-sm btn-danger remove-image-btn" @click="removeImage" :disabled="isLoading">
          ✕
        </button>
      </div>
    </div>

    <!-- 🐾 Breed Prediction Result -->
    <div v-if="isLoading" class="mt-2 alert alert-info">
      <strong>Analyzing image for breed...</strong>
    </div>
    <div v-else-if="breedResult" class="mt-2 alert alert-info">
      <strong>Detected Breed:</strong> {{ breedResult }}
    </div>

    <div v-show="showMap" id="map" style="height: 400px; border-radius: 12px; margin-top: 1rem;"></div>


    <!-- Location (auto-detect) -->
    <div class="mb-3 position-relative">
      <label class="form-label">Location</label>
      <input type="text" class="pawsitive-input" :class="{ 'is-invalid': fieldErrors.location }" v-model="report.location"
        placeholder="Enter location..."
        @focus="showSuggestions = locationSuggestions.length > 0"
        @blur="setTimeout(() => showSuggestions = false, 200)" />
      <div v-if="fieldErrors.location" class="invalid-feedback d-block">
        {{ fieldErrors.location }}
      </div>

      <!-- Dropdown Suggestions -->
      <ul v-if="showSuggestions" class="list-group position-absolute w-100"
        style="z-index: 1000; max-height: 200px; overflow-y: auto;">
        <li v-for="(suggestion, index) in locationSuggestions" :key="index"
          class="list-group-item list-group-item-action" 
          @mousedown.prevent="selectLocationSuggestion(suggestion)"
          style="cursor: pointer;">
          {{ suggestion.label }}
        </li>
      </ul>
    </div>


    <!-- Status Dropdown -->
    <div class="mb-3">
      <label class="form-label">Status</label>
      <select v-model="report.status" class="pawsitive-input" :class="{ 'is-invalid': fieldErrors.status }">
        <option value="" disabled>Select status</option>
        <option value="Lost">Lost</option>
        <option value="Injured">Injured</option>
      </select>
      <div v-if="fieldErrors.location" class="invalid-feedback d-block">
        {{ fieldErrors.status }}
      </div>
    </div>

    <!-- Cat Breed -->
    <div class="mb-3">
      <label class="form-label">Cat Breed</label>
      <input type="text" class="pawsitive-input" :class="{ 'is-invalid': fieldErrors.name }" v-model="report.species"
        placeholder="Enter cat breed" />
      <div v-if="fieldErrors.location" class="invalid-feedback d-block">
        {{ fieldErrors.name }}
      </div>
    </div>

    <!-- Cat Name -->
    <div class="mb-3">
      <label class="form-label">Cat Name (optional)</label>
      <input type="text" class="pawsitive-input" v-model="report.name"
        placeholder="Enter cat name (if known)" />
    </div>

    <!-- Estimated Age -->
    <div class="form-group">
      <label class="form-label">Estimated Age</label>
      <input type="number" class="pawsitive-input" v-model="report.estimatedAge"
        placeholder="e.g. 2 (years) leave empty if unknown" min="0" />
    </div>

    <!-- Gender -->
    <div class="form-group">
      <label class="form-label">Gender</label>
      <select class="pawsitive-input" v-model="report.gender">
        <option value="" disabled>Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Unknown">Unknown</option>
      </select>
    </div>

    <!-- Neutered -->
    <div class="form-group">
      <label class="form-label">Neutered</label>
      <select class="pawsitive-input" v-model="report.neutered">
        <option value="" disabled>Select status</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="Unknown">Unknown</option>
      </select>
    </div>




    <!-- Condition Dropdown (always shown) -->
    <div class="mb-3">
      <label class="form-label">Condition of the cat (optional)</label>
      <select v-model="report.condition" class="pawsitive-input"
        :class="{ 'placeholder-selected': report.condition === '' }">
        <option value="">Select condition (if any)</option>
        <option value="Bleeding">Bleeding</option>
        <option value="Limping">Limping</option>
        <option value="Vomiting / Diarrhea">Vomiting / Diarrhea</option>
        <option value="Weak / Lethargic">Weak / Lethargic</option>
        <option value="Fracture / Broken bone">Fracture / Broken bone</option>
        <option value="Eye injury / Infection">Eye injury / Infection</option>
        <option value="Open wound / Cut">Open wound / Cut</option>
        <option value="Swelling / Bruising">Swelling / Bruising</option>
        <option value="Difficulty breathing">Difficulty breathing</option>
        <option value="Seizures">Seizures</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <!-- Severity Selector -->
    <div class="mb-3">
      <label class="form-label">Severity of Condition</label>
      <div class="severity-container">
        <div v-for="level in 5" :key="level" class="severity-box" :class="{ selected: report.severity >= level }"
          @click="setSeverity(level)">
          {{ level }}
        </div>
      </div>
      <small class="text-muted">1 = Mild, 5 = Very Severe</small>
    </div>


    <!-- Description -->
    <div class="mb-3">
      <label class="form-label">Description</label>
      <textarea class="pawsitive-input" :class="{ 'is-invalid': fieldErrors.description }" rows="3"
        v-model="report.description" placeholder="Describe the cat's condition..."></textarea>
      <div v-if="fieldErrors.location" class="invalid-feedback d-block">
        {{ fieldErrors.description }}
      </div>
    </div>

    <button class="pawsitive-btn w-100" type="submit">Submit Report</button>
  </form>
  <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">

    <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">


      <!-- Sidebar -->
      <div class="sidebar" v-if="sidebarOpen">



        <!-- Nearby Cats Section -->
        <h5 style="margin-top: 30px">Nearby Similar Reports (Past 24h, < 1 km ) </h5>
            <div v-if="nearbyCats.length === 0" class="text-muted">
              No nearby cats found.
            </div>
            <NearbyCatsList v-else :cats="nearbyCats" :show-distance="true" />

            <hr />


            <!-- Other Cats Section -->
            <h5>Other Cat Reports</h5>
            <!-- Other Cats Section with Accordion -->
            <div>
              <button class="btn btn-outline-secondary w-100 mb-2" type="button"
                @click="otherCatsOpen = !otherCatsOpen">
                Other Cats ({{ reports.length }})
                <span>{{ otherCatsOpen ? '▲' : '▼' }}</span>
              </button>

              <NearbyCatsList v-show="otherCatsOpen" :cats="reports" :show-distance="false" />
            </div>

      </div>



      <!-- Toggle button -->
      <button class="sidebar-toggle" :class="{ 'sidebar-open-btn': sidebarOpen }" @click="toggleSidebar">
        {{ sidebarOpen ? '⮞' : '⮜' }}
      </button>

    </div>


  </div>

  </main>
  
  <BottomFooter />
</template>

<style>
/* ==============================
   Container Layout
   ============================== */
.main-container {
  display: flex;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 1rem;
}

/* ==============================
   Sidebar
   ============================== */
.sidebar {
  width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 1rem;
  padding-top: 70px;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-x: hidden;
}

.sidebar-open .sidebar {
  transform: translateX(0);
}

.sidebar-toggle {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1100;
  background-color: #343a40;
  color: #fff;
  border: none;
  border-radius: 4px 0 0 4px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-open-btn {
  right: 300px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(100%);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-open-btn {
    right: 0;
  }
}

/* ==============================
   Report Form
   ============================== */
.report-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1.5rem;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(128, 110, 131, 0.1);
}

.report-header {
  text-align: center;
  padding-top: 20px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  color: #806e83;
}

.report-form .form-label {
  font-weight: 600;
  color: #806e83;
  margin-bottom: 0.5rem;
}

.placeholder-selected {
  color: #6c757d;
}

@media (max-width: 768px) {
  .report-form {
    padding: 20px;
    margin: 1rem 20px;
  }
}

/* ==============================
   File Upload Styling
   ============================== */
.file-upload-container {
  margin-top: 0.5rem;
}

.file-input-hidden {
  display: none;
}

.file-upload-btn {
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  text-align: center;
}

/* ==============================
   Severity Selector
   ============================== */
.severity-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.severity-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e0d4e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  color: #806e83;
  font-weight: 600;
}

.severity-box.selected {
  background-color: #806e83;
  color: white;
  border-color: #806e83;
}

.severity-box:hover {
  background-color: #6d5c70;
  color: white;
  border-color: #6d5c70;
}

/* ==============================
   Image Preview
   ============================== */
.image-preview-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.img-preview {
  max-width: 100%;
  height: auto;
  border-radius: 15px;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  border-radius: 50%;
  line-height: 1;
  background-color: #806e83;
  border-color: #806e83;
}

.remove-image-btn:hover:not(:disabled) {
  background-color: #6d5c70;
  border-color: #6d5c70;
}

.remove-image-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #999;
  border-color: #999;
}

/* ==============================
   Suggestion Dropdown
   ============================== */
.list-group-item:hover {
  background-color: #f8e1e1;
  color: #806e83;
}

.list-group-item {
  border: 1px solid #e0d4e0;
  transition: all 0.2s ease;
}

/* ==============================
   Alert Boxes
   ============================== */
.alert-info {
  background-color: #f8e1e1;
  border-color: #e0d4e0;
  color: #806e83;
  border-radius: 15px;
}

/* ==============================
   Form Validation
   ============================== */
.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* ==============================
   Map Styling
   ============================== */
#map .leaflet-control-attribution.leaflet-control {
  display: inline-flex !important;
  align-items: center !important;
}

#map .leaflet-control-attribution.leaflet-control>a {
  margin: 2px;
  padding: 0px;
}

#map .leaflet-control-attribution.leaflet-control>span {
  margin: 2px;
  padding-right: 1px;
}

#map {
  border-radius: 15px;
  border: 2px solid #e0d4e0;
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

:deep(.cat-marker-popup .leaflet-popup-content) {
  width: 340px !important;
  min-width: 340px !important;
  max-width: 340px !important;
}

:deep(.cat-popup-card) {
  background-color: #fadadd;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #ffc0cb;
  padding: 1rem;
  font-family: system-ui, sans-serif;
  width: 100%;
  box-sizing: border-box;
}

:deep(.cat-popup-inner) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.cat-popup-img-container) {
  width: 100%;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.cat-popup-img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.cat-popup-info) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.cat-popup-title) {
  font-size: 1.1rem;
  font-weight: 700;
  color: #806e83;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ffc0cb;
}

:deep(.cat-popup-details) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.cat-popup-detail-item) {
  font-size: 0.8rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(.cat-popup-detail-item strong) {
  color: #806e83;
  font-weight: 600;
}

:deep(.cat-popup-detail-value) {
  color: #5a4a5e;
  display: block;
  margin-top: 0.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

:deep(.cat-popup-link) {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  background-color: #806e83;
  color: white !important;
  text-decoration: none;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid #806e83;
}

:deep(.cat-popup-link:hover) {
  background-color: #6d5c70;
  border-color: #6d5c70;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
}

/* Old popup styles - keeping for compatibility */
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

:deep(.you-are-here-popup .leaflet-popup-content-wrapper) {
  background-color: #f8e1e1;
  border: 2px solid #806e83;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(128, 110, 131, 0.3);
}

:deep(.you-are-here-popup .leaflet-popup-tip) {
  background-color: #f8e1e1;
  border-left: 2px solid #806e83;
  border-bottom: 2px solid #806e83;
}
</style>

