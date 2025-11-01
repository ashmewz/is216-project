<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import GridSplit from '@/components/resuables/GridSplit.vue'
import ForumCard from '@/components/resuables/ForumCard.vue'
import ForumSideBar from '@/components/resuables/ForumSideBar.vue'
import { Modal } from 'bootstrap'

import { db } from '@/firebase'
import { getAuth } from "firebase/auth"
import {
  collection, addDoc, getDoc, doc, getDocs, serverTimestamp
} from 'firebase/firestore'
import { validatePost, validateComment } from '@/utils/validators'

// Firebase Auth & Firestore State
const auth = getAuth()
const posts = ref([])
const loading = ref(false)

const showWelcome = ref(true)
const showCreatePostModal = ref(false)

const searchQuery = ref('')
const sortMode = ref('newest')
const activeCommentPostId = ref(null)
const newCommentText = ref('')
const fieldErrors = reactive({})

const newPost = reactive({
  description: '',
  image: '',
})

// Modal instances refs
let createPostModalInstance = null
let commentModalInstance = null

// Computed label for sorting dropdown
// Adjusted computed label for sorting dropdown (removed 'popular')
const sortLabel = computed(() => {
  return {
    newest: { text: 'Newest First', icon: 'bi-clock-history' },
    oldest: { text: 'Oldest First', icon: 'bi-clock' },
  }[sortMode.value]
})

// Posts filtered and sorted based on UI controls using createdAt timestamp
const displayedPosts = computed(() => {
  let filtered = posts.value.filter(p =>
    !searchQuery.value ||
    (p.description && p.description.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
    (p.author && p.author.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )

  if (sortMode.value === 'oldest') {
    return [...filtered].sort((a, b) => {
      // Sort ascending by createdAt timestamp (oldest first)
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return aTime - bTime
    })
  }
  // Default to newest first
  return [...filtered].sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
    return bTime - aTime
  })
})


// Fetch posts and related data from Firestore
const fetchPosts = async () => {
  loading.value = true
  try {
    const postSnapshot = await getDocs(collection(db, "posts"))
    const postData = []

    for (const docSnap of postSnapshot.docs) {
      const post = { id: docSnap.id, ...docSnap.data(), comments: [] }

      // Fetch author details from 'volunteers' collection
      if (post.author) {
        const userDoc = await getDoc(doc(db, "volunteers", post.author))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          post.author = userData.username || "Unknown"
          post.avatar = userData.avatar || null
        } else {
          post.author = "Unknown"
          post.avatar = null
        }
      }

      // Fetch comments for the post, enriched with usernames and avatars
      const commentsSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"))
      post.comments = await Promise.all(commentsSnap.docs.map(async (c) => {
        const commentData = { id: c.id, ...c.data() }
        let userName = "Unknown"
        let userAvatar = null
        if (commentData.author) {
          const cUserDoc = await getDoc(doc(db, "volunteers", commentData.author))
          if (cUserDoc.exists()) {
            const uData = cUserDoc.data()
            userName = uData.username || "Unknown"
            userAvatar = uData.avatar || null
          }
        }
        commentData.username = userName
        commentData.avatar = userAvatar
        return commentData
      }))

      // Provide fallback for likes field
      if (post.likes === undefined) post.likes = 0

      postData.push(post)
    }

    posts.value = postData
  } catch (err) {
    console.error("Error fetching posts:", err)
  }
  loading.value = false
}

// Watchers to clear validation errors on input
watch(() => newPost.description, () => (fieldErrors.description = ''))
watch(() => newCommentText.value, () => (fieldErrors.comment = ''))

// Helper: convert File to Base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('File read error'))
  reader.readAsDataURL(file)
})

// Handle image upload input for new post
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  try {
    newPost.image = await fileToBase64(file)
  } catch (err) {
    console.error('Image upload error:', err)
  }
}

// Open Create Post Modal using Bootstrap's Modal API
function openCreatePost() {
  showCreatePostModal.value = true
  const modalEl = document.getElementById('createPostModal')
  createPostModalInstance = new Modal(modalEl)
  createPostModalInstance.show()
}

// Close Create Post Modal and reset
function closeCreatePostModal() {
  createPostModalInstance?.hide()
  showCreatePostModal.value = false
  newPost.description = ''
  newPost.image = ''
  fieldErrors.description = ''
}

// Create a new post in Firestore
async function createPost() {
  const errors = validatePost(newPost)
  if (Object.keys(errors).length) {
    Object.assign(fieldErrors, errors)
    return
  }
  const currentUser = auth.currentUser
  if (!currentUser) return alert("You must be logged in to create a post.")
  try {
    await addDoc(collection(db, "posts"), {
      author: currentUser.uid,
      description: newPost.description,
      image: newPost.image || null,
      createdAt: serverTimestamp(),
      likes: 0, // default likes
    })
    await fetchPosts()
    closeCreatePostModal()
  } catch (err) {
    console.error("Error creating post:", err)
  }
}

// Comments modal open and close logic
function openCommentModal(postId) {
  activeCommentPostId.value = postId
  newCommentText.value = ''
  const modalEl = document.getElementById('commentsModal')
  commentModalInstance = new Modal(modalEl)
  commentModalInstance.show()
}

function closeCommentModal() {
  commentModalInstance?.hide()
  activeCommentPostId.value = null
  newCommentText.value = ''
  fieldErrors.comment = ''
}

// Add comment to Firestore subcollection
async function addComment() {
  const errors = validateComment({ comment: newCommentText.value })
  if (Object.keys(errors).length) {
    Object.assign(fieldErrors, errors)
    return
  }
  const currentUser = auth.currentUser
  if (!currentUser) return alert("You must be logged in to comment.")
  if (!activeCommentPostId.value) return

  try {
    await addDoc(collection(db, "posts", activeCommentPostId.value, "comments"), {
      author: currentUser.uid,
      comment: newCommentText.value.trim(),
      createdAt: serverTimestamp(),
    })
    await fetchPosts()
    closeCommentModal()
  } catch (err) {
    console.error("Error adding comment:", err)
  }
}

// Sort mode change handler
function setSort(mode) {
  sortMode.value = mode
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <main class="container mt-4">
      <div
        v-if="showWelcome"
        class="welcome-banner mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden"
      >
        <button
          class="btn-close position-absolute top-0 end-0 m-3"
          @click="showWelcome = false"
        ></button>
        <div class="welcome-content">
          <h2 class="fw-bold mb-2">🐱 Welcome to the Cat Lovers Forum!</h2>
          <p class="mb-0 text-muted">
            Share your adorable cat moments, tips, and stories with fellow cat
            enthusiasts
          </p>
        </div>
      </div>

      <GridSplit>
        <template #main>
          <ForumCard
            :posts="displayedPosts"
            @open-comments="openCommentModal"
          />
        </template>

        <template #sidebar>
          <ForumSideBar
            v-model:searchQuery="searchQuery"
            :sortLabel="sortLabel"
            @update:sortMode="setSort"
            @create-post="openCreatePost"
          />
        </template>
      </GridSplit>
    </main>

    <!-- Comments Modal -->
    <div class="modal fade" id="commentsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">
              💬 Comments
              <span class="badge bg-light text-dark ms-2">
                {{
                  posts.find(p => p.id === activeCommentPostId)?.comments?.length || 0
                }}
              </span>
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeCommentModal"
            ></button>
          </div>

          <div class="modal-body" v-if="activeCommentPostId">
            <!-- comment items, newest first -->
            <div
              v-for="(comment, index) in [...(posts.find(p => p.id === activeCommentPostId)?.comments || [])].reverse()"
              :key="comment.id || index"
              class="comment-item d-flex align-items-start mb-3 p-3 bg-light rounded-3"
            >
              <img
                :src="comment.avatar || '/src/assets/profilepic1.jpg'"
                alt="Profile"
                class="rounded-circle me-3 comment-avatar"
              />
              <div class="flex-grow-1">
                <strong class="d-block mb-1 text-accent">{{ comment.username }}</strong>
                <p class="mb-2">{{ comment.comment }}</p>
                <small class="text-muted"
                  ><i class="bi bi-clock me-1"></i>{{ comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : '-' }}</small
                >
              </div>
            </div>

            <div v-if="!(posts.find(p => p.id === activeCommentPostId)?.comments?.length)" class="empty-comments text-center py-5">
              <div class="empty-icon mb-3">💭</div>
              <p class="text-muted mb-0">No comments yet. Be the first to share your thoughts!</p>
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0 d-flex align-items-center gap-2">
            <input
              v-model="newCommentText"
              :class="['form-control', 'rounded-pill', 'px-4', 'py-2', 'comment-input', fieldErrors.comment ? 'is-invalid' : '']"
              placeholder="Share your thoughts..."
              @keyup.enter="addComment"
            />
            <button
              @click="addComment"
              class="btn btn-primary rounded-pill px-4 post-comment-btn"
            >
              <i class="bi bi-send-fill"></i>
            </button>
            <div v-if="fieldErrors.comment" class="invalid-feedback">{{ fieldErrors.comment }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div class="modal fade" id="createPostModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">✨ Create New Post</h5>
            <button type="button" class="btn-close" @click="closeCreatePostModal"></button>
          </div>

          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Caption</label>
              <textarea
                v-model="newPost.description"
                class="form-control create-post-textarea"
                rows="4"
                placeholder="Share your thoughts, stories, or tips about cats..."
                :class="fieldErrors.description ? 'is-invalid' : ''"
              ></textarea>
              <div v-if="fieldErrors.description" class="invalid-feedback">{{ fieldErrors.description }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Image (Optional)</label>
              <div class="image-upload-area">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  class="d-none"
                  @change="handleImageUpload"
                />
                <div
                  v-if="!newPost.image"
                  class="upload-placeholder"
                  @click="$refs.fileInput.click()"
                >
                  <i class="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                  <p class="text-muted mb-0">Click to upload an image</p>
                  <small class="text-muted">JPG, PNG, or GIF</small>
                </div>
                <div v-else class="image-preview-container position-relative">
                  <img
                    :src="newPost.image"
                    alt="Preview"
                    class="img-fluid rounded-3"
                  />
                  <button
                    type="button"
                    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                    @click="newPost.image = ''; document.getElementById('imageUpload').value = ''"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
              <input ref="fileInput" type="file" class="d-none" accept="image/*" @change="handleImageUpload" />
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0">
            <button
              type="button"
              class="btn btn-light rounded-pill px-4"
              @click="closeCreatePostModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary rounded-pill px-4"
              @click="createPost"
            >
              <i class="bi bi-send-fill me-2"></i>Post
            </button>
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
</style>
