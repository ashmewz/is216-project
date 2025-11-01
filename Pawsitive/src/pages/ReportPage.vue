<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import CatReportCard from '@/components/resuables/CatReportCard.vue'
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { getAuth } from "firebase/auth"
import { validateCatReport } from '@/utils/validators' // your validation util

const db = getFirestore()
const auth = getAuth()

// Reactive state for cat report form
const report = reactive({
  status: '',
  condition: '',
  catName: '',
  location: '',
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

// Functions from your original code
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
function removeImage() {
  report.imageFile = null
  report.imagePreview = null
  if (fileInput.value) fileInput.value.value = null
}
function setSeverity(level) {
  report.severity = level
}
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    report.imageFile = file
    const reader = new FileReader()
    reader.onload = e => {
      report.imagePreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
async function getLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }
  report.location = 'Fetching location...'
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        const data = await response.json()
        report.location = data.display_name || `${latitude}, ${longitude}`
      } catch (err) {
        console.error(err)
        report.location = `${latitude}, ${longitude}`
      }
    },
    (err) => {
      console.error(err)
      report.location = 'Unable to fetch location'
    }
  )
}

// Validate form fields reactively to clear errors on change
watch(() => report.status, () => fieldErrors.value.status = '')
watch(() => report.catName, () => fieldErrors.value.catName = '')
watch(() => report.location, () => fieldErrors.value.location = '')
watch(() => report.description, () => fieldErrors.value.description = '')
watch(() => report.imagePreview, () => fieldErrors.value.image = '')

// Convert File object to Base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Firebase: fetch all reports ordered by creation date
const fetchReports = async () => {
  reportsLoading.value = true
  try {
    const q = query(collection(db, "catReports"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const reportsData = []
    for (const docSnap of snapshot.docs) {
      const r = { id: docSnap.id, ...docSnap.data() }
      if (r.submittedBy) {
        const userDoc = await getDoc(doc(db, "volunteers", r.submittedBy))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          r.username = userData.username || 'Unknown'
          r.avatar = userData.avatar || null
        } else {
          r.username = 'Unknown'
          r.avatar = null
        }
      }
      reportsData.push(r)
    }
    reports.value = reportsData
  } catch (err) {
    console.error("Failed to fetch reports", err)
  } finally {
    reportsLoading.value = false
  }
}

// Submit form to Firebase
const submitReport = async () => {
  // Assemble report object for validation
  const toValidate = {
    status: report.status,
    name: report.catName,
    location: report.location,
    description: report.description,
    image: report.imagePreview
  }
  const errors = validateCatReport(toValidate)
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors
    return
  }
  const currentUser = auth.currentUser
  if (!currentUser) {
    alert("You must be logged in to submit a report.")
    return
  }
  try {
    // Store the report in Firestore
    await addDoc(collection(db, "catReports"), {
      status: report.status,
      name: report.catName.trim(),
      location: report.location.trim(),
      description: report.description.trim(),
      image: report.imagePreview || null,
      condition: report.condition,
      severity: report.severity,
      submittedBy: currentUser.uid,
      createdAt: serverTimestamp()
    })
    // Reset form fields
    report.status = ''
    report.catName = ''
    report.location = ''
    report.description = ''
    report.imageFile = null
    report.imagePreview = null
    report.condition = ''
    report.severity = 0
    fieldErrors.value = {}
    fetchReports()
    showModal.value = false
    if (fileInput.value) fileInput.value.value = null
  } catch (err) {
    console.error(err)
    alert("Failed to submit report. Try again.")
  }
}

onMounted(() => {
  fetchReports()
  getLocation() // optionally auto-fetch location on mount
})
</script>



<template>
  <Navbar>
    <template v-slot:navbar-title>Report</template>
  </Navbar>
  <h2 class="report-header">Report a Cat</h2>

  <form class="report-form" @submit.prevent="submitReport">

    <!-- Status Dropdown -->
    <div class="mb-3">
      <label class="form-label">Status</label>
      <select v-model="report.status" class="form-select">
        <option value="" disabled>Select status</option>
        <option value="Lost">Lost</option>
        <option value="Injured">Injured</option>
      </select>
    </div>

    <!-- Cat Breed -->
    <div class="mb-3">
      <label class="form-label">Cat Breed</label>
      <input type="text" class="form-control" v-model="report.catName" placeholder="Enter cat breed" />
    </div>

    <!-- Location (auto-detect) -->
    <div class="mb-3">
      <label class="form-label">Location</label>
      <div class="d-flex gap-2 align-items-center">
        <input type="text" class="form-control" v-model="report.location" readonly placeholder="Fetching location..." />
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="getLocation">Refresh</button>
      </div>
    </div>

    <!-- Image Upload -->
      <div class="mb-3">
        <label class="form-label">Upload Image</label>
        <input 
        type="file" 
        class="form-control" 
        ref="fileInput"
        @change="handleFileUpload" 
        accept="image/*"
      />



        <!-- Preview Section -->
        <div v-if="report.imagePreview" class="image-preview-container mt-2 position-relative">
          <img :src="report.imagePreview" class="img-preview rounded" />
          <button 
            type="button" 
            class="btn btn-sm btn-danger remove-image-btn" 
            @click="removeImage"
          >
            ✕
          </button>
        </div>
      </div>

    
    <!-- Condition Dropdown (always shown) -->
    <div class="mb-3">
      <label class="form-label">Condition of the cat (optional)</label>
      <select v-model="report.condition" class="form-select">
        <option value="" disabled>Select condition</option>
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
        <div 
          v-for="level in 5" 
          :key="level"
          class="severity-box"
          :class="{ selected: report.severity >= level }"
          @click="setSeverity(level)"
        >
          {{ level }}
        </div>
      </div>
      <small class="text-muted">1 = Mild, 5 = Very Severe</small>
    </div>


    <!-- Description -->
    <div class="mb-3">
      <label class="form-label">Description</label>
      <textarea class="form-control" rows="3" v-model="report.description" placeholder="Describe the cat's condition..."></textarea>
    </div>

    <button class="btn btn-dark w-100" type="submit">Submit Report</button>
  </form>
  <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">
  
  <div class="d-flex main-container" :class="{ 'sidebar-open': sidebarOpen }">
  
  <!-- Main content (report form) -->
  <div class="flex-grow-1 main-content">

    <form class="report-form" @submit.prevent="submitReport">
      <!-- existing form code here -->
      <!-- Status, Cat Breed, Location, Image Upload, Condition, Severity, Description, Submit button -->
    </form>
  </div>

  <!-- Sidebar -->
  <div class="sidebar" v-if="sidebarOpen">

    <!-- My Reports Section -->
    <h5 style="margin-top: 30px">My Reports</h5>
    <div v-for="reportItem in reports.filter(r => r.username === 'Alice')" :key="reportItem.id">
      <CatReportCard :report="reportItem" />
    </div>
    <hr />

    <!-- Others' Reports Section -->
    <h5>Others' Reports</h5>
    <div v-for="reportItem in reports.filter(r => r.username !== 'Alice')" :key="reportItem.id">
      <CatReportCard :report="reportItem" />
    </div>

  </div>



  <!-- Toggle button -->
    <button 
      class="sidebar-toggle" 
      :class="{ 'sidebar-open-btn': sidebarOpen }" 
      @click="toggleSidebar"
    >
      {{ sidebarOpen ? '⮞' : '⮜' }}
    </button>

</div>


</div>

  <BottomFooter />
</template>

<style>
.report-form {
  max-width: 500px;
  margin: 2rem auto;
}
.report-form input,
.report-form textarea,
.report-form select {
  font-size: 0.95rem;
  border-radius: 8px;
}
.report-header {
  text-align: center;
  padding-top: 20px;
  margin-bottom: 1.5rem; /* spacing below header */
  font-weight: 600;       /* optional: make it stand out */
}
.severity-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.severity-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.severity-box.selected {
  background-color: #343a40;
  color: white;
  border-color: #343a40;
}

.severity-box:hover {
  background-color: #495057;
  color: white;
  border-color: #495057;
}

.img-preview {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  display: block;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  border-radius: 50%;
  line-height: 1;
}
.main-container {
  display: flex;
  justify-content: center;  /* center form by default */
  transition: all 0.3s ease;
  padding: 1rem;
}

.main-content {
  transition: margin-right 0.3s ease;
  max-width: 500px; /* keeps form size consistent */
  width: 100%; /* allows it to shrink on small screens */
  padding-top:30px;
}

/* When sidebar is open, push form left */
.sidebar-open .main-content {
  margin-right: 300px; /* width of sidebar */
}

/* Sidebar */
.sidebar {
  width: 300px;
  position: fixed;
  right: 0;
  top: 0; /* change from 60px to 0 */
  bottom: 0;
  background-color: #fff; /* ensures full white background */
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  overflow-y: auto;
  padding: 1rem;
  padding-top: 70px; /* space for navbar height so content doesn’t overlap */
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar, h5{
  /* margin-top: 20px; */
}

/* Responsive: on smaller screens, make sidebar full width overlay */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(100%);
  }
  .sidebar-open .sidebar {
    transform: translateX(0);
  }
  .sidebar-open .main-content {
    margin-right: 0; /* main content doesn’t shift on small screens */
  }
}


.main-content {
  transition: margin-right 0.3s ease;
  margin-right: 0; /* centered by default */
  max-width: 500px; /* same width as your form */
}

/* when sidebar is open, push main content left */
.sidebar {
  transform: translateX(100%);
}
.sidebar-open .sidebar {
  transform: translateX(0);
}


/* default toggle (right edge) */
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

/* when sidebar is open, move toggle to left of sidebar */
.sidebar-open-btn {
  right: 300px; /* same as sidebar width */
  border-radius: 4px 4px 4px 4px; /* optional: round all sides */
}

/* Responsive for mobile */
@media (max-width: 768px) {
  .sidebar-open-btn {
    right: 0; /* toggle stays on screen since sidebar overlays */
  }
}


</style>
