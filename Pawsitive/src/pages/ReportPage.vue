<script setup>
import { ref, watch, onMounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { validateCatReport } from '@/utils/validators';
import { getAuth } from "firebase/auth";
import CatReportCard from '@/components/resuables/CatReportCard.vue';


const db = getFirestore()
const auth = getAuth();
const reportsLoading = ref(true)
const rssLoading = ref(true)
const fieldErrors = ref({})
const showModal = ref(false)
const reports = ref([])

// Form state
const form = ref({
  name: '',
  location: '',
  description: '',
  image: null,
  status: 'Lost'

})
watch(() => form.value.status, () => fieldErrors.value.status = '')
watch(() => form.value.name, () => fieldErrors.value.name = '')
watch(() => form.value.location, () => fieldErrors.value.location = '')
watch(() => form.value.description, () => fieldErrors.value.description = '')
watch(() => form.value.image, () => fieldErrors.value.image = '')


// Fetch reports with user info
const fetchReports = async () => {
  reportsLoading.value = true; // start spinner
  try {
    const q = query(collection(db, "catReports"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const reportsData = [];
    for (const docSnap of snapshot.docs) {
      const report = { id: docSnap.id, ...docSnap.data() };

      if (report.submittedBy) {
        const userDoc = await getDoc(doc(db, "volunteers", report.submittedBy));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          report.username = userData.username || 'Unknown';
          report.avatar = userData.avatar || null;
        } else {
          report.username = 'Unknown';
          report.avatar = null;
        }
      }
      reportsData.push(report);
    }
    reports.value = reportsData;
  } catch (err) {
    console.error("Failed to fetch reports", err);
  } finally {
    reportsLoading.value = false; // stop spinner
  }
};


onMounted(() => {
  fetchReports();
});

// Open modal
const openModal = () => showModal.value = true

// Submit report
const submitReport = async () => {
  const errors = validateCatReport(form.value);
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors;
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return alert("You must be logged in to submit a report.");
  }

  try {
    await addDoc(collection(db, "catReports"), {
      status: form.value.status,
      name: form.value.name.trim(),
      location: form.value.location.trim(),
      description: form.value.description.trim(),
      image: form.value.image || null,
      submittedBy: currentUser.uid,  // store user ID as foreign key
      createdAt: serverTimestamp()
    });


    form.value.status = '';
    form.value.name = '';
    form.value.location = '';
    form.value.description = '';
    form.value.image = null;
    fieldErrors.value = {};
    fetchReports();
    showModal.value = false;

  } catch (err) {
    console.error(err);
    alert("Failed to submit report. Try again.");
  }
};

// Trigger file input
const fileInput = ref(null)
const triggerFileInput = () => {
  fileInput.value.click()
}

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// Handle file change
const onFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  try {
    const base64 = await fileToBase64(file)
    form.value.image = base64
  } catch (err) {
    console.error('Failed to convert image:', err)
  }
}



</script>

<template>
  <Navbar>
    <template v-slot:navbar-title>
      Report
    </template>
  </Navbar>
  <div class="container my-5">

    <div class="row">

      <!-- Left Column: RSS Feed -->
      <div class="col-12 col-lg-8">
        <div v-if="rssLoading" class="d-flex justify-content-center align-items-center" style="height: 400px;">
          <div class="spinner-border text-dark" role="status">
          </div>
        </div>

        <iframe v-show="!rssLoading" @load="rssLoading = false" width="100%"
          src="https://rss.app/embed/v1/feed/t5NpsAOuQiydgeJJ" height="3800px" scrolling="no" frameborder="0">
        </iframe>

      </div>

      <!-- Right Column: Sidebar -->

      <div class="col-12 col-lg-4 reports">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4>Cat Reports</h4>
          <button class="btn btn-dark btn-sm" @click="openModal">Create Report</button>
        </div>

        <div v-if="reportsLoading" class="d-flex justify-content-center align-items-center" style="height: 200px;">
          <div class="spinner-border text-dark" role="status">
          </div>
        </div>

        <div v-if="reports.length === 0">No reports yet.</div>

        <div class="d-flex flex-column gap-3">
          <CatReportCard v-for="report in reports" :key="report.id" :report="report" />
        </div>

      </div>

    </div>

  </div>


  <!-- Modal -->
  <div v-if="showModal">
    <!-- Backdrop -->
    <div class="modal-backdrop fade show"></div>

    <div class="modal d-flex align-items-center justify-content-center fade show" tabindex="-1">
      <!-- Modal dialog: responsive -->
      <div class="modal-dialog modal-dialog-centered" :style="{ maxWidth: '', width: '100%' }">
        <div class="modal-content">
          <form @submit.prevent="submitReport">
            <div class="modal-header">
              <h5 class="modal-title">Create a Cat Report</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>

            <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">

              <!-- Status -->
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select" :class="{ 'is-invalid': fieldErrors.status }">
                  <option value="" disabled>Select status</option>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
                <div class="invalid-feedback">{{ fieldErrors.status }}</div>
              </div>


              <!-- Cat Name -->
              <div class="mb-3">
                <label class="form-label">Cat Name</label>
                <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': fieldErrors.name }"
                  placeholder="Enter cat name" />
                <div class="invalid-feedback">{{ fieldErrors.name }}</div>
              </div>

              <!-- Location -->
              <div class="mb-3">
                <label class="form-label">Location</label>
                <input v-model="form.location" type="text" class="form-control"
                  :class="{ 'is-invalid': fieldErrors.location }" placeholder="Where was the cat found/lost?" />
                <div class="invalid-feedback">{{ fieldErrors.location }}</div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="form.description" class="form-control"
                  :class="{ 'is-invalid': fieldErrors.description }" rows="3"
                  placeholder="Describe the cat's condition..."></textarea>
                <div class="invalid-feedback">{{ fieldErrors.description }}</div>
              </div>

              <!-- Image Upload -->
              <div class="mb-3">
                <label class="form-label">Upload Image</label>
                <div class="d-flex gap-2 align-items-center">
                  <button type="button" class="btn btn-outline-primary btn-sm" @click="triggerFileInput">
                    Choose Image
                  </button>
                </div>
                <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" style="display:none" />
                <div v-if="form.image" class="mt-2">
                  <img :src="form.image" alt="Preview" style="max-width: 100%; border-radius: 4px;" />
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" @click="showModal = false">Cancel</button>
              <button type="submit" class="btn btn-dark btn-sm">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>




  <BottomFooter />

  <!-- Floating Button (Mobile only) -->
  <button class="btn report-floating-btn d-lg-none" @click="openModal" title="Create Report">
    <i class="bi bi-pencil-square"></i>
  </button>

</template>

<style scoped>
.report-floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 2000;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #343a40;
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.report-floating-btn:hover {
  background-color: #495057;
}

@media (max-width: 992px) {
  .reports {
    margin-top: -15rem;
  }
}

@media (max-width: 768px) {
  .reports {
    margin-top: -50rem;
    /* adjust smaller for smaller screen */
  }
}

@media (max-width: 576px) {
  .reports {
    margin-top: -50rem;
  }
}
</style>
