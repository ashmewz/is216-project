<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import GridSplit from '@/components/resuables/GridSplit.vue'
import { Modal } from 'bootstrap'

const posts = reactive([
  {
    id: 'p1',
    username: 'Meowie',
    profilePic: '/src/assets/profilepic1.jpg',
    caption: 'I love this cat soooo much! 😻 This is Whiskers, and she\'s been with me since I rescued her from the void deck. She loves cuddles, chasing string toys, and stealing my seat whenever I get up for just 2 seconds!',
    image: '/src/assets/cutecats1.jpg',
    likes: 22,
    comments: [{ user: 'Sia', text: 'So cute!', time: '2025-10-24 14:30' }],
    datePosted: '2025-10-23 18:00',
    expanded: false,
  },
  { id: 'p2', username: 'Adorablecats123', profilePic: '/src/assets/profilepic2.jpg', caption: 'Look at this cutie 😻', image: '/src/assets/cutecats2.jpg', likes: 18, comments: [], datePosted: '2025-10-24 09:15', expanded: false },
  { id: 'p3', username: 'CatCareTips', profilePic: '/src/assets/profilepic3.jpg', caption: 'Cats are wonderful companions, but caring for them goes beyond just feeding...', image: '', likes: 12, comments: [], datePosted: '2025-10-22 16:45', expanded: false },
])

const searchQuery = ref('')
const sortMode = ref('newest')
const activePostId = ref(null)
const newComment = ref('')
const showWelcome = ref(true)
const likeAnimations = reactive({})
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const newPost = reactive({ caption: '', image: null, imagePreview: null })

const displayedPosts = computed(() => {
  const filtered = posts.filter(p => 
    !searchQuery.value || 
    p.caption.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    p.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  
  if (sortMode.value === 'oldest') return [...filtered].reverse()
  if (sortMode.value === 'popular') return [...filtered].sort((a, b) => b.likes - a.likes)
  return filtered
})

const sortLabel = computed(() => ({
  newest: { text: 'Newest First', icon: 'bi-clock-history' },
  oldest: { text: 'Oldest First', icon: 'bi-clock' },
  popular: { text: 'Most Liked', icon: 'bi-heart-fill' }
}[sortMode.value]))

const getLikedPosts = () => JSON.parse(localStorage.getItem('likedPosts') || '[]')
const setLikedPosts = arr => localStorage.setItem('likedPosts', JSON.stringify(arr))
const hasLiked = id => getLikedPosts().includes(id)

const formatDateTime = (date = new Date()) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function setSort(mode) {
  sortMode.value = mode
  dropdownOpen.value = false
}

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId)
  if (!post) return
  
  const liked = hasLiked(postId)
  post.likes += liked ? -1 : 1
  
  if (liked) {
    setLikedPosts(getLikedPosts().filter(id => id !== postId))
  } else {
    setLikedPosts([...getLikedPosts(), postId])
    likeAnimations[postId] = true
    setTimeout(() => likeAnimations[postId] = false, 600)
  }
}

function toggleExpand(post) {
  post.expanded = !post.expanded
}

async function sharePost(postId) {
  const post = posts.find(p => p.id === postId)
  if (!post) return
  
  const shareData = { 
    title: `Post by ${post.username}`, 
    text: post.caption, 
    url: `${location.href}#post-${postId}` 
  }
  
  if (navigator.share) {
    try { 
      await navigator.share(shareData)
      return 
    } catch(e) {}
  }
  
  await navigator.clipboard.writeText(shareData.url)
  alert('Link copied to clipboard! 📋')
}

function openComments(postId) {
  activePostId.value = postId
  new Modal(document.getElementById('commentsModal')).show()
}

function addComment() {
  const text = newComment.value.trim()
  if (!text) return alert('Please write a comment.')
  
  const post = posts.find(p => p.id === activePostId.value)
  if (!post) return
  
  post.comments.push({ user: 'You', text, time: formatDateTime() })
  newComment.value = ''
}

function openCreatePost() {
  new Modal(document.getElementById('createPostModal')).show()
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  newPost.image = file
  const reader = new FileReader()
  reader.onload = e => newPost.imagePreview = e.target.result
  reader.readAsDataURL(file)
}

function removeImage() {
  newPost.image = null
  newPost.imagePreview = null
  const fileInput = document.getElementById('imageUpload')
  if (fileInput) fileInput.value = ''
}

function createPost() {
  const caption = newPost.caption.trim()
  if (!caption) return alert('Please write a caption for your post.')

  posts.unshift({
    id: `p${Date.now()}`,
    username: 'You',
    profilePic: '/src/assets/profilepic_placeholder.jpg',
    caption,
    image: newPost.imagePreview || '',
    likes: 0,
    comments: [],
    datePosted: formatDateTime(),
    expanded: false,
  })

  newPost.caption = ''
  removeImage()
  Modal.getInstance(document.getElementById('createPostModal'))?.hide()
}

function triggerImageUpload() {
  document.getElementById('imageUpload')?.click()
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <main class="container mt-4">
      <!-- Added welcoming hero section -->
      <div v-if="showWelcome" class="welcome-banner mb-4 p-4 rounded-4 shadow-sm position-relative overflow-hidden">
        <button 
          class="btn-close position-absolute top-0 end-0 m-3" 
          @click="showWelcome = false"
        ></button>
        <div class="welcome-content">
          <h2 class="fw-bold mb-2">🐱 Welcome to the Cat Lovers Forum!</h2>
          <p class="mb-0 text-muted">Share your adorable cat moments, tips, and stories with fellow cat enthusiasts</p>
        </div>
      </div>

      <!-- Replaced manual grid with GridSplit component -->
      <GridSplit>
        <!-- Main content area (9/12 width) - Posts -->
        <template #main>
          <div class="posts-container">
            <div
              v-for="(post, index) in displayedPosts"
              :key="post.id"
              class="post mb-4 p-4 border-0 rounded-4 shadow-sm animate-in"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <div class="profile-pic-wrapper">
                    <img
                      :src="post.profilePic"
                      alt="Profile"
                      class="rounded-circle border-2"
                    />
                  </div>
                  <div class="ms-3">
                    <span class="fw-bold text-accent d-block">{{ post.username }}</span>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>{{ post.datePosted }}
                    </small>
                  </div>
                </div>

                <button class="btn btn-sm btn-light share-btn rounded-circle" @click="sharePost(post.id)">
                  <i class="bi bi-share-fill"></i>
                </button>
              </div>

              <div v-if="post.image" class="post-image-wrapper mb-3">
                <img
                  :src="post.image"
                  alt="Post image"
                  class="post-image rounded-3"
                />
              </div>

              <p class="mb-3 post-caption">
                {{ post.expanded || post.caption.length <= 150
                  ? post.caption
                  : post.caption.slice(0, 150) + '...' }}
                <button
                  v-if="post.caption.length > 150"
                  class="btn btn-link p-0 text-accent read-more-btn"
                  @click="toggleExpand(post)"
                >
                  {{ post.expanded ? 'Show less' : 'Read more' }}
                </button>
              </p>

              <div class="d-flex gap-4 align-items-center interaction-bar pt-2 border-top">
                <button 
                  class="interaction-btn like-btn" 
                  :class="{ 'liked': hasLiked(post.id), 'animating': likeAnimations[post.id] }"
                  @click="toggleLike(post.id)"
                >
                  <i :class="['bi', hasLiked(post.id) ? 'bi-heart-fill' : 'bi-heart']"></i>
                  <span class="ms-2">{{ post.likes }}</span>
                  <span class="like-text ms-1">{{ post.likes === 1 ? 'Like' : 'Likes' }}</span>
                </button>
              
                <button class="interaction-btn comment-btn" @click="openComments(post.id)">
                  <i class="bi bi-chat-dots"></i>
                  <span class="ms-2">{{ post.comments.length }}</span>
                  <span class="comment-text ms-1">{{ post.comments.length === 1 ? 'Comment' : 'Comments' }}</span>
                </button>
              </div>
            </div>

            <div v-if="displayedPosts.length === 0" class="empty-state text-center py-5">
              <div class="empty-icon mb-3">🔍</div>
              <h4 class="mb-2">No posts found</h4>
              <p class="text-muted">Try adjusting your search or create a new post!</p>
            </div>
          </div>
        </template>

        <!-- Sidebar area (3/12 width) - Controls -->
        <template #sidebar>
          <div class="controls-sidebar">
            <div class="search-wrapper position-relative mb-3">
              <i class="bi bi-search position-absolute search-icon"></i>
              <input
                v-model="searchQuery"
                class="form-control search-input"
                placeholder="Search posts or users..."
              />
            </div>

            <button @click="openCreatePost" class="btn btn-primary create-btn text-nowrap w-100 mb-3">
              <i class="bi bi-plus-circle"></i>
              <span class="ms-2">Create Post</span>
            </button>

            <div class="btn-group position-relative sort-dropdown w-100" ref="dropdownRef">
              <button
                class="btn btn-outline-secondary sort-btn w-100"
                @click="dropdownOpen = !dropdownOpen"
              >
                <i :class="['bi', sortLabel.icon]"></i>
                <span class="ms-2">{{ sortLabel.text }}</span>
                <i class="bi bi-caret-down-fill ms-2 float-end"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow w-100" :class="{ 'show': dropdownOpen }">
                <li><a class="dropdown-item" href="#" @click.prevent="setSort('newest')"><i class="bi bi-clock-history me-2"></i>Newest First</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setSort('oldest')"><i class="bi bi-clock me-2"></i>Oldest First</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="setSort('popular')"><i class="bi bi-heart-fill me-2"></i>Most Liked</a></li>
              </ul>
            </div>
          </div>
        </template>
      </GridSplit>
    </main>

    <!-- Comments Modal -->
    <div class="modal fade" id="commentsModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">
              💬 Comments
              <span v-if="activePostId" class="badge bg-light text-dark ms-2">
                {{ posts.find(p => p.id === activePostId)?.comments?.length || 0 }}
              </span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <template v-if="activePostId">
              <div
                v-for="(c, i) in [...(posts.find(p => p.id === activePostId)?.comments || [])].reverse()"
                :key="i"
                class="comment-item d-flex align-items-start mb-3 p-3 bg-light rounded-3"
              >
                <img
                  :src="`/src/assets/profilepic_placeholder.jpg`"
                  alt="Profile"
                  class="rounded-circle me-3 comment-avatar"
                />
                <div class="flex-grow-1">
                  <strong class="d-block mb-1 text-accent">{{ c.user }}</strong>
                  <p class="mb-2">{{ c.text }}</p>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>{{ c.time }}
                  </small>
                </div>
              </div>

              <div
                v-if="!posts.find(p => p.id === activePostId)?.comments?.length"
                class="empty-comments text-center py-5"
              >
                <div class="empty-icon mb-3">💭</div>
                <p class="text-muted mb-0">No comments yet. Be the first to share your thoughts!</p>
              </div>
            </template>
          </div>

          <div class="modal-footer border-top-0 pt-0 d-flex align-items-center gap-2">
            <input
              v-model="newComment"
              class="form-control rounded-pill px-4 py-2 comment-input"
              placeholder="Share your thoughts..."
              @keyup.enter="addComment"
            />
            <button @click="addComment" class="btn btn-primary rounded-pill px-4 post-comment-btn">
              <i class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Added Create Post Modal -->
    <div class="modal fade" id="createPostModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom-0 pb-2">
            <h5 class="modal-title fw-bold">
              ✨ Create New Post
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Caption</label>
              <textarea
                v-model="newPost.caption"
                class="form-control create-post-textarea"
                rows="4"
                placeholder="Share your thoughts, stories, or tips about cats..."
              ></textarea>
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
                
                <div v-if="!newPost.imagePreview" class="upload-placeholder" @click="triggerImageUpload">
                  <i class="bi bi-cloud-upload fs-1 text-muted mb-2"></i>
                  <p class="text-muted mb-0">Click to upload an image</p>
                  <small class="text-muted">JPG, PNG, or GIF</small>
                </div>

                <div v-else class="image-preview-container position-relative">
                  <img :src="newPost.imagePreview" alt="Preview" class="img-fluid rounded-3" />
                  <button
                    type="button"
                    class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                    @click="removeImage"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary rounded-pill px-4" @click="createPost">
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

/* Enhanced base styles with better colors and animations */
body {
  background-color: #f8e1e1;
  font-family: 'Nunito', sans-serif;
  color: #2f2f2f;
}

.text-accent {
  color: #806e83 !important;
}

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

/* Enhanced search input with icon */

.search-input {
  padding-left: 2.5rem;
  border-radius: 25px;
  border: 2px solid #e0d4e0;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #806e83;
  box-shadow: 0 0 0 0.2rem rgba(128, 110, 131, 0.15);
  transform: translateY(-1px);
}

.search-icon {
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #806e83;
  pointer-events: none;
  z-index: 10;
}

/* Enhanced buttons with hover effects */
.sort-btn,
.create-btn {
  border-radius: 25px;
  padding: 0 !important;
  font-weight: 600;
  transition: all 0.3s ease;
  height: 42px;
}

.sort-btn svg {
  flex-shrink: 0;
}

.btn-outline-secondary {
  border: 2px solid #806e83;
  color: #806e83;
}

.btn-outline-secondary:hover {
  background: #806e83;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.3);
}

.create-btn {
  background: #806e83;
  border: 2px solid #806e83;
  color: white;
  height: 42px;
}

.create-btn:hover {
  background: #6d5c70;
  border-color: #6d5c70;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
}

/* Animated post cards */
.post {
  background: #fff;
  transition: all 0.3s ease;
  border: 1px solid #f0e8f0;
  width: 100%;
}

.post:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(128, 110, 131, 0.15) !important;
}

.animate-in {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced profile picture with hover effect */
.profile-pic-wrapper {
  position: relative;
}

.profile-pic-wrapper img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border: 3px solid #f0e8f0 !important;
  transition: all 0.3s ease;
}

.profile-pic-wrapper:hover img {
  border-color: #806e83 !important;
  transform: scale(1.05);
}

/* Share button with hover effect */
.share-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.share-btn:hover {
  background: #f8e1e1 !important;
  border-color: #806e83;
  transform: rotate(15deg) scale(1.1);
}

/* Improved post image container and styling */
.post-image-wrapper {
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #f8f8f8;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;
}

.post-image:hover {
  transform: scale(1.02);
}

/* Enhanced modal backdrop for click-outside functionality */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Added posts container with width constraints */
.posts-container {
  width: 90%;
  margin: 0;
}

@media (min-width: 768px) {
  .posts-container {
    width: 80%;
  }
}

@media (max-width: 768px) {
  .search-wrapper {
    min-width: 100%;
  }
}
@media (min-width: 992px) {
  .post {
    width: 100%;
  }
}

/* Enhanced post caption */
.post-caption {
  line-height: 1.6;
  color: #2f2f2f;
}

.read-more-btn {
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.read-more-btn:hover {
  text-decoration: underline;
  transform: translateX(3px);
}

/* Interactive buttons with animations */
.interaction-bar {
  padding-top: 0.75rem;
  border-top: 1px solid #f0e8f0 !important;
}

.interaction-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  color: #666;
}

.interaction-btn:hover {
  background: #f8e1e1;
  transform: translateY(-2px);
}

.like-btn i {
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.like-btn.liked {
  color: #e74c3c;
}

.like-btn.liked i {
  color: #e74c3c;
}

.like-btn.animating i {
  animation: heartBeat 0.6s ease;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.25);
  }
}

.comment-btn i {
  font-size: 1.1rem;
}

.comment-btn:hover {
  color: #806e83;
}

.like-text,
.comment-text {
  font-size: 0.9rem;
}

/* Empty state styling */
.empty-state {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 500px;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.empty-comments {
  padding: 2rem 1rem;
}

.empty-comments .empty-icon {
  font-size: 3rem;
}

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
