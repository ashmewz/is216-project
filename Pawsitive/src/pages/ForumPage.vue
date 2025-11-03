<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import GridSplit from '@/components/resuables/GridSplit.vue'
import ForumCard from '@/components/resuables/ForumCard.vue'
import ForumSideBar from '@/components/resuables/ForumSideBar.vue'
import { db } from '@/firebase'
import { getAuth } from "firebase/auth"
import {
  collection, addDoc, getDoc, doc, getDocs, serverTimestamp
} from 'firebase/firestore'
import { validatePost, validateComment } from '@/utils/validators'

const auth = getAuth()
const posts = ref([])
const loading = ref(false)
const showWelcome = ref(true)

/* ---------- MODAL REFS (no Bootstrap) ---------- */
const showCreatePostModal = ref(false)
const showCommentModal = ref(false)
const activeCommentPostId = ref(null)
/* ------------------------------------------------ */

const searchQuery = ref('')
const sortMode = ref('newest')
const newCommentText = ref('')
const fieldErrors = reactive({})
const newPost = reactive({ description: '', image: '' })

/* ------------------- SORT LABEL ------------------- */
const sortLabel = computed(() => ({
  newest: { text: 'Newest First', icon: 'bi-clock-history' },
  oldest: { text: 'Oldest First', icon: 'bi-clock' }
})[sortMode.value])

/* ------------------- DISPLAYED POSTS ------------------- */
const displayedPosts = computed(() => {
  let filtered = posts.value.filter(p =>
    !searchQuery.value ||
    (p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (p.author?.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )

  if (sortMode.value === 'oldest') {
    return [...filtered].sort((a, b) => {
      const aT = a.createdAt?.toMillis?.() ?? 0
      const bT = b.createdAt?.toMillis?.() ?? 0
      return aT - bT
    })
  }
  return [...filtered].sort((a, b) => {
    const aT = a.createdAt?.toMillis?.() ?? 0
    const bT = b.createdAt?.toMillis?.() ?? 0
    return bT - aT
  })
})

/* ------------------- FETCH POSTS ------------------- */
const fetchPosts = async () => {
  loading.value = true
  try {
    const snap = await getDocs(collection(db, 'posts'))
    const list = []
    for (const d of snap.docs) {
      const post = { id: d.id, ...d.data(), comments: [] }

      // author
      if (post.author) {
        const u = await getDoc(doc(db, 'volunteers', post.author))
        if (u.exists()) {
          const ud = u.data()
          post.author = ud.username || 'Unknown'
          post.avatar = ud.avatar || null
        } else {
          post.author = 'Unknown'
          post.avatar = null
        }
      }

      // comments
      const cSnap = await getDocs(collection(db, 'posts', d.id, 'comments'))
      post.comments = await Promise.all(
        cSnap.docs.map(async c => {
          const cd = { id: c.id, ...c.data() }
          let name = 'Unknown', ava = null
          if (cd.author) {
            const cu = await getDoc(doc(db, 'volunteers', cd.author))
            if (cu.exists()) {
              const ud = cu.data()
              name = ud.username || 'Unknown'
              ava = ud.avatar || null
            }
          }
          cd.username = name
          cd.avatar = ava
          return cd
        })
      )

      post.likes ??= 0
      list.push(post)
    }
    posts.value = list
  } catch (e) { console.error(e) }
  loading.value = false
}

/* ------------------- VALIDATION WATCHERS ------------------- */
watch(() => newPost.description, () => delete fieldErrors.description)
watch(() => newCommentText.value, () => delete fieldErrors.comment)

/* ------------------- IMAGE HELPERS ------------------- */
const fileToBase64 = file => new Promise((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(r.result)
  r.onerror = rej
  r.readAsDataURL(file)
})
async function handleImageUpload(e) {
  const f = e.target.files[0]
  if (!f) return
  try { newPost.image = await fileToBase64(f) }
  catch (err) { console.error(err) }
}

/* ------------------- CREATE POST ------------------- */
function openCreatePost() { showCreatePostModal.value = true }
function closeCreatePostModal() {
  showCreatePostModal.value = false
  // reset after the fade-out finishes
  nextTick(() => {
    newPost.description = ''
    newPost.image = ''
    Object.keys(fieldErrors).forEach(k => delete fieldErrors[k])
  })
}
async function createPost() {
  const err = validatePost(newPost)
  if (Object.keys(err).length) { Object.assign(fieldErrors, err); return }

  const u = auth.currentUser
  if (!u) return alert('Login required')
  try {
    await addDoc(collection(db, 'posts'), {
      author: u.uid,
      description: newPost.description,
      image: newPost.image || null,
      createdAt: serverTimestamp(),
      likes: 0
    })
    await fetchPosts()
    closeCreatePostModal()
  } catch (e) { console.error(e) }
}

/* ------------------- COMMENTS ------------------- */
function openCommentModal(postId) {
  activeCommentPostId.value = postId
  newCommentText.value = ''
  showCommentModal.value = true
}
function closeCommentModal() {
  showCommentModal.value = false
  nextTick(() => {
    activeCommentPostId.value = null
    newCommentText.value = ''
    delete fieldErrors.comment
  })
}
async function addComment() {
  const err = validateComment({ comment: newCommentText.value })
  if (Object.keys(err).length) { Object.assign(fieldErrors, err); return }

  const u = auth.currentUser
  if (!u) return alert('Login required')
  if (!activeCommentPostId.value) return

  try {
    await addDoc(collection(db, 'posts', activeCommentPostId.value, 'comments'), {
      author: u.uid,
      comment: newCommentText.value.trim(),
      createdAt: serverTimestamp()
    })
    await fetchPosts()
    closeCommentModal()
  } catch (e) { console.error(e) }
}

/* ------------------- SORT ------------------- */
function setSort(m) { sortMode.value = m }

onMounted(fetchPosts)
</script>

<template>
  <div class="forum-page">
    <Navbar />
    <main class="container mt-4">

      <!-- welcome banner -->
      <div v-if="showWelcome" class="welcome-banner mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden">
        <button class="btn-close position-absolute top-0 end-0 m-3" @click="showWelcome = false"></button>
        <div class="welcome-content">
          <h2 class="fw-bold mb-2">Welcome to the Cat Lovers Forum!</h2>
          <p class="mb-0 text-muted">
            Share your adorable cat moments, tips, and stories with fellow cat enthusiasts
          </p>
        </div>
      </div>

      <GridSplit>
        <template #main>
          <ForumCard :posts="displayedPosts" @open-comments="openCommentModal" />
        </template>
        <template #sidebar>
          <ForumSideBar v-model:searchQuery="searchQuery" :sortLabel="sortLabel" @update:sortMode="setSort"
            @create-post="openCreatePost" />
        </template>
      </GridSplit>
    </main>

    <!-- ==================== BACKDROPS ==================== -->
    <div v-if="showCreatePostModal || showCommentModal" class="modal-backdrop fade show"></div>

    <!-- ==================== CREATE POST MODAL ==================== -->
    <div v-if="showCreatePostModal" class="modal fade show" style="display:block" tabindex="-1" aria-modal="true"
      role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">Create New Post</h5>
            <button type="button" class="btn-close" @click="closeCreatePostModal"></button>
          </div>

          <div class="modal-body p-4">
            <!-- caption -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Caption</label>
              <textarea v-model="newPost.description" class="form-control create-post-textarea" rows="4"
                placeholder="Share your thoughts, stories, or tips about cats..."
                :class="fieldErrors.description ? 'is-invalid' : ''"></textarea>
              <div v-if="fieldErrors.description" class="invalid-feedback">
                {{ fieldErrors.description }}
              </div>
            </div>

            <!-- image -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Image (Optional)</label>
              <div class="image-upload-area">
                <input ref="imageUploadInput" type="file" accept="image/*" class="d-none" @change="handleImageUpload" />
                <div v-if="!newPost.image" class="upload-placeholder" @click="$refs.imageUploadInput?.click()">
                  <i class="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                  <p class="text-muted mb-0">Click to upload an image</p>
                  <small class="text-muted">JPG, PNG, or GIF</small>
                </div>
                <div v-else class="image-preview-container position-relative">
                  <img :src="newPost.image" alt="Preview" class="img-fluid rounded-3" />
                  <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                    @click="newPost.image = ''; document.getElementById('imageUpload').value = ''">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" @click="closeCreatePostModal">Cancel</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" @click="createPost">
              <i class="bi bi-send-fill me-2"></i>Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== COMMENTS MODAL ==================== -->
    <div v-if="showCommentModal" class="modal fade show" style="display:block; margin-top: 10rem;" tabindex="-1"
      aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">
              Comments
              <span class="badge bg-light text-dark ms-2">
                {{posts.find(p => p.id === activeCommentPostId)?.comments?.length || 0}}
              </span>
            </h5>
            <button type="button" class="btn-close" @click="closeCommentModal"></button>
          </div>

          <div class="modal-body" v-if="activeCommentPostId">
            <!-- newest first -->
            <div v-for="(c, i) in [...(posts.find(p => p.id === activeCommentPostId)?.comments || [])]
              .reverse()" :key="c.id || i" class="comment-item d-flex align-items-start mb-3 p-3 bg-light rounded-3">
              <img :src="c.avatar || '/src/assets/avatar_placeholder.jpg'" alt="Avatar"
                class="rounded-circle me-3 comment-avatar" />
              <div class="flex-grow-1">
                <strong class="d-block mb-1 text-accent">{{ c.username }}</strong>
                <p class="mb-2">{{ c.comment }}</p>
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>
                  {{ c.createdAt?.toDate?.().toLocaleString() ?? '-' }}
                </small>
              </div>
            </div>

            <div v-if="!(posts.find(p => p.id === activeCommentPostId)?.comments?.length)"
              class="empty-comments text-center py-5">
              <div class="empty-icon mb-3">No comments yet. Be the first!</div>
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0 d-flex align-items-center gap-2">
            <input v-model="newCommentText" :class="['form-control', 'rounded-pill', 'px-4', 'py-2', 'comment-input',
              fieldErrors.comment ? 'is-invalid' : '']" placeholder="Share your thoughts..."
              @keyup.enter="addComment" />
            <button @click="addComment" class="btn btn-primary rounded-pill px-4 post-comment-btn">
              <i class="bi bi-send-fill"></i>
            </button>
            <div v-if="fieldErrors.comment" class="invalid-feedback">
              {{ fieldErrors.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomFooter />
  </div>
</template>

<style scoped>
/* Paste your previous scoped styles here unchanged */
/* ... (as provided in your original style section) ... */

/* Example for some crucial modal and input states for validation */
.is-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>

<style scoped>
/* Welcome banner with gradient background */
.welcome-banner {
  background: linear-gradient(135deg, #fef5f5 0%, #f8e1e1 100%);
  border: 2px solid #f0d4d4;
  animation: slideDown 0.5s ease-out;
  text-align: center;
}

.welcome-content h2 {
  color: #806e83;
  font-size: 1.5rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/*End of Welcome banner with gradient background */



/* Enhanced modal styling */
.modal-content {
  border: none;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #fef5f5 0%, #f8e1e1 100%);
  padding: 1.25rem 1.5rem;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
  background: #fafafa;
  padding: 1.5rem;
}

.comment-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.comment-item:hover {
  background: white !important;
  border-color: #e0d4e0;
  transform: translateX(5px);
}

.comment-avatar {
  width: 45px;
  height: 45px;
  object-fit: cover;
  border: 2px solid #f0e8f0;
}

.comment-input {
  border: 2px solid #e0d4e0;
  transition: all 0.3s ease;
}

.comment-input:focus {
  border-color: #806e83;
  box-shadow: 0 0 0 0.2rem rgba(128, 110, 131, 0.15);
}

.post-comment-btn {
  background: #806e83;
  border: none;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.post-comment-btn:hover {
  background: #6d5c70;
  transform: scale(1.05);
}

/* Dropdown menu styling */
.dropdown-menu {
  border-radius: 15px;
  border: 2px solid #f0e8f0;
  padding: 0.5rem;


}

.controls-sidebar {
  position: relative;
  z-index: 3000;
}

.dropdown-menu {
  position: absolute !important;
  z-index: 3100 !important;
}





.dropdown-item {
  border-radius: 10px;
  padding: 0.6rem 1rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f8e1e1;
  color: #806e83;
  transform: translateX(5px);
}

.dropdown-item i {
  color: #806e83;
}

/* Added create post modal styles */
.create-post-textarea {
  border: 2px solid #e0d4e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  resize: none;
}

.create-post-textarea:focus {
  border-color: #806e83;
  box-shadow: 0 0 0 0.2rem rgba(128, 110, 131, 0.15);
}

.image-upload-area {
  border: 2px dashed #e0d4e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-placeholder {
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  background: #fafafa;
  border-color: #806e83;
}



.image-preview-container img {
  max-height: 300px;
  width: 100%;
  object-fit: contain;
  background: #f8f8f8;
}

.image-preview-container .btn-danger {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Updated controls wrapper for grid-based responsive layout */
.controls-wrapper {
  background: #f8e1e1;
  z-index: 100;
  padding: 1rem 0;
  margin: -1rem 0 1rem 0;
}

.controls-inner {
  display: grid;
  gap: 1rem;
}

/* Mobile layout - single column, only create button is sticky */
@media (max-width: 767px) {
  .controls-wrapper {
    position: static;
  }

  .controls-inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }


  .buttons-stack {
    grid-column: 1;
    grid-row: 2;
    display: grid;
    gap: 0.75rem;
  }

  .create-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: auto;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
  }

  .sort-btn {
    width: 100%;
  }
}

/* Tablet layout - single column, search on top, buttons below, all sticky */
@media (min-width: 768px) and (max-width: 1199px) {
  .controls-wrapper {
    position: sticky;
    top: 80px;
  }


  .buttons-stack {
    grid-column: 1;
    grid-row: 2;
    display: grid;
    gap: 0.75rem;
  }

  .create-btn,
  .sort-btn {
    width: 100%;
  }
}

/* Desktop layout - 2 columns, search on left, buttons on right, all sticky */
@media (min-width: 1200px) {
  .controls-wrapper {
    position: sticky;
    top: 80px;
  }


  .search-wrapper {
    min-width: 80%;
  }

  .buttons-stack {
    grid-column: 2;
    grid-row: 1;
    display: grid;
    gap: 0.75rem;
    min-width: 220px;
  }

  .create-btn,
  .sort-btn {
    width: 100%;
  }
}

/* Ensure buttons are fully rounded on all 4 corners */
.sort-btn,
.create-btn {
  border-radius: 25px !important;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-btn {
  border: 2px solid #806e83 !important;
}

.create-btn {
  background: #806e83;
  border: 2px solid #806e83 !important;
  color: white;
}

/* Updated styles for GridSplit sidebar layout */
.controls-sidebar {
  position: sticky;
  top: 100px;
  padding: 1rem;
  background: #f8e1e1;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(128, 110, 131, 0.1);
}

.posts-container {
  width: 100%;
}

.modal-backdrop.show {
  z-index: 1040 !important;
}

.modal.show {
  z-index: 1050 !important;
}

.navbar {
  z-index: 1030 !important;
}

.forum-page {
  background-color: #f8e1e1;
  /* change this to any color you want */
  min-height: 100vh;
  /* ensures it covers the full viewport height */
}

/* In your forum page CSS or GridSplit.css */
@media (max-width: 991.98px) {

  /* Medium breakpoint and smaller */
  .grid-split {
    display: flex;
    flex-direction: column;
  }

  .grid-split>.sidebar {
    order: -1;
    /* Moves sidebar on top */
    margin-bottom: 1rem;
    /* Space between sidebar and posts */
  }

  .grid-split>.main {
    width: 100%;
    /* Ensure posts take full width */
  }
}
</style>
