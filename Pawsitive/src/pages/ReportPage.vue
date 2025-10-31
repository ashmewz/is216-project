<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'

// --- Reactive State ---
const selectedArticle = ref(null)
const articles = ref([])
const searchQuery = ref('') // store search input

const report = reactive({
  catName: '',
  location: '',
  description: '',
  imageFile: null,
  imagePreview: null
})

const showMobileReport = ref(false)

// --- Functions ---
function toggleMobileReport() {
  showMobileReport.value = !showMobileReport.value
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    report.imageFile = file
    const reader = new FileReader()
    reader.onload = e => (report.imagePreview = e.target.result)
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  report.imageFile = null
  report.imagePreview = null
}

function submitReport() {
  console.log('Report submitted:', {
    catName: report.catName,
    location: report.location,
    description: report.description,
    imageFile: report.imageFile
  })
  alert('Report submitted! Check console for details.')
  // Reset form
  report.catName = ''
  report.location = ''
  report.description = ''
  report.imageFile = null
  report.imagePreview = null
}

async function loadRSS() {
  try {
    const response = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
    )
    const data = await response.json()

    if (data.items && data.items.length) {
      articles.value = data.items.slice(0, 20).map(item => ({
        id: item.guid || item.link,
        title: item.title,
        summary: cleanHTML(item.description || ''),
        full: cleanHTML(item.content || item.description || ''),
        image: item.enclosure?.link || '/src/assets/default.jpg',
        link: item.link,
        author: item.author || 'New York Times',
        pubDate: new Date(item.pubDate).toLocaleDateString(),
        isFeatured: false
      }))
    }
  } catch (error) {
    console.error('Error loading RSS:', error)
  }
}

function cleanHTML(html) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

function openArticle(article) {
  selectedArticle.value = article
}

function goBack() {
  selectedArticle.value = null
}

// --- Computed ---
const filteredArticles = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return articles.value.filter(
    a =>
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query)
  )
})

// --- Lifecycle ---
onMounted(loadRSS)
</script>

<template>
  <Navbar>
    <template v-slot:navbar-title>Report</template>
  </Navbar>

  <div class="container my-5 news-layout">
    <!-- Left: News Content -->
    <div class="news-container">
      <!-- Show all news if none selected -->
      <div v-if="!selectedArticle">
        <!-- Search Bar -->
        <div class="mb-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search news..."
          />
        </div>

        <!-- Articles List -->
        <div
          v-for="article in filteredArticles"
          :key="article.id"
          :class="article.isFeatured ? 'latest-news row align-items-center mb-4' : 'news-card text-start mb-4'"
        >
          <!-- Featured Article -->
          <template v-if="article.isFeatured">
            <div class="col-md-6">
              <h2 class="news-title">{{ article.title }}</h2>
              <p class="news-summary">{{ article.summary }}</p>
              <button class="btn btn-dark" @click="openArticle(article)">Read More</button>
            </div>
            <div class="col-md-6 text-center">
              <img :src="article.image" :alt="article.title" class="img-fluid rounded shadow-sm" />
            </div>
          </template>

          <!-- Older Article -->
          <template v-else>
            <img :src="article.image" :alt="article.title" class="img-fluid news-image rounded shadow-sm" />
            <div class="news-text mt-2">
              <h4 class="news-title">{{ article.title }}</h4>
              <p class="news-summary">{{ article.summary }}</p>
              <button class="btn btn-outline-dark" @click="openArticle(article)">Read More</button>
            </div>
          </template>
        </div>

        <!-- No Results -->
        <p v-if="filteredArticles.length === 0" class="text-muted mt-3">No articles found.</p>
      </div>

      <!-- Selected Article -->
      <div v-else class="selected-article">
        <button class="btn btn-outline-secondary mb-3" @click="goBack">← Back to All Articles</button>
        <h2 class="news-title">{{ selectedArticle.title }}</h2>
        <img
          :src="selectedArticle.image"
          :alt="selectedArticle.title"
          class="img-fluid rounded shadow-sm my-3"
        />
        <p class="news-full">{{ selectedArticle.full }}</p>
        <a
          :href="selectedArticle.link"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-dark mt-3"
        >
          Read Full Article on NYTimes →
        </a>
      </div>
    </div>

    <!-- Right: Sidebar (Desktop) -->
    <aside class="sidebar d-none d-lg-block">
      <h4 class="mb-3">Create a Cat Report</h4>
      <form class="report-form" @submit.prevent="submitReport">
        <div class="mb-3">
          <label class="form-label">Cat Breed</label>
          <input type="text" class="form-control" v-model="report.catName" placeholder="Enter cat breed" />
        </div>
        <div class="mb-3">
          <label class="form-label">Location</label>
          <input type="text" class="form-control" v-model="report.location" placeholder="Where was the cat found?" />
        </div>
        <div class="mb-3">
          <label class="form-label">Upload Image</label>
          <input type="file" class="form-control" @change="handleFileUpload" accept="image/*" />
          <div v-if="report.imagePreview" class="mt-2">
            <img :src="report.imagePreview" class="img-fluid rounded mb-2" />
            <button type="button" class="btn btn-outline-danger btn-sm" @click="removeImage">Remove Image</button>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" v-model="report.description" placeholder="Describe the cat's condition..."></textarea>
        </div>
        <button class="btn btn-dark w-100" type="submit">Submit Report</button>
      </form>
    </aside>
  </div>

  <!-- Floating button for smaller screens -->
  <button class="btn report-floating-btn d-lg-none" @click="toggleMobileReport" title="Create a Cat Report">
    <i class="bi bi-pencil-square"></i>
  </button>

  <!-- Mobile sliding panel -->
  <div class="mobile-report-panel" v-if="showMobileReport">
    <div class="mobile-report-header">
      <h5>Cat Report</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="toggleMobileReport">✕</button>
    </div>
    <form @submit.prevent="submitReport">
      <!-- replicate form inputs if needed -->
    </form>
  </div>

  <BottomFooter />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

.news-layout {
  display: flex;
  gap: 2rem;
}
.news-container { flex: 3; font-family: "Nunito", sans-serif; }

.sidebar {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: sticky;
  top: 2rem;
  align-self: start;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.report-form input,
.report-form textarea { font-size: 0.95rem; }

.latest-news img { width: 100%; height: auto; border-radius: 12px; }
.latest-news .news-title { font-weight: 700; }
.latest-news .news-summary { font-size: 1rem; color: #555; }

.news-card { display: flex; flex-direction: column; align-items: flex-start; }
.news-image { width: 100%; height: auto; object-fit: cover; display: block; margin: 0 auto; }
.news-text { text-align: left; }
.news-title { font-weight: 700; }
.news-summary { font-size: 0.95rem; color: #666; }
.news-full { font-size: 1rem; color: #444; line-height: 1.6; }

@media (max-width: 768px) {
  .news-layout { flex-direction: column; gap: 1rem; }
  .sidebar { margin-top: 0.8rem; padding: 1rem; }
  .latest-news { flex-direction: column; }
  .latest-news .col-md-6 { text-align: center; }
  .latest-news .btn { margin-top: 1rem; margin-bottom: 1.2rem; }
}

.mb-4 { margin-bottom: 1.5rem !important; }
.mb-3 { margin-bottom: 1rem !important; }

/* Floating button */
.report-floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 1000;
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
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.report-floating-btn:hover { background-color: #495057; }

/* Mobile sliding panel */
.mobile-report-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 90%;
  max-width: 400px;
  height: 100%;
  background: #f8f9fa;
  padding: 1.5rem;
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  z-index: 1050;
  overflow-y: auto;
}
.mobile-report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
