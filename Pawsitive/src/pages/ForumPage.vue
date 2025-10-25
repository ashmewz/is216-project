<script setup>
import { ref, reactive, computed } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import * as bootstrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const posts = reactive([
  {
    id: 'p1',
    username: 'Meowie',
    profilePic: '/src/assets/profilepic1.jpg',
    caption: 'I love this cat soooo much! 😻 This is Whiskers, and she’s been with me since I rescued her from the void deck. She loves cuddles, chasing string toys, and stealing my seat whenever I get up for just 2 seconds!',
    image: '/src/assets/cutecats1.jpg',
    likes: 22,
    comments: [{ user: 'Sia', text: 'So cute!', time: '2025-10-24 14:30' }],
    datePosted: '2025-10-23 18:00',
    expanded: false, // 👇 for read more
  },
  {
    id: 'p2',
    username: 'Adorablecats123',
    profilePic: '/src/assets/profilepic2.jpg',
    caption: 'Look at this cutie 😻',
    image: '/src/assets/cutecats2.jpg',
    likes: 18,
    comments: [],
    datePosted: '2025-10-24 09:15',
    expanded: false,
  },
  {
    id: 'p3',
    username: 'CatCareTips',
    profilePic: '/src/assets/profilepic3.jpg',
    caption: 'Cats are wonderful companions, but caring for them goes beyond just feeding. Regular grooming helps them stay clean and prevents hairballs. Providing scratching posts protects your furniture and helps them stretch. Always schedule vet visits, and remember — love, patience, and playtime go a long way in keeping your feline friend happy and healthy.',
    image: '', // 👇 text-only post
    likes: 12,
    comments: [],
    datePosted: '2025-10-22 16:45',
    expanded: false,
  },
])

const searchQuery = ref('')
const sortMode = ref('newest')
const activePostId = ref(null)
const newComment = ref('')

const displayedPosts = computed(() => {
  let list = posts.filter(p => {
    const q = searchQuery.value.toLowerCase()
    return (
      !q ||
      p.caption.toLowerCase().includes(q) ||
      p.username.toLowerCase().includes(q)
    )
  })
  if (sortMode.value === 'oldest') list = [...list].reverse()
  if (sortMode.value === 'popular') list = [...list].sort((a, b) => b.likes - a.likes)
  return list
})

const getLikedPosts = () => JSON.parse(localStorage.getItem('likedPosts') || '[]')
const setLikedPosts = arr => localStorage.setItem('likedPosts', JSON.stringify(arr))
const hasLiked = id => getLikedPosts().includes(id)

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId)
  if (!post) return
  const liked = hasLiked(postId)

  if (liked) {
    post.likes = Math.max(0, post.likes - 1)
    setLikedPosts(getLikedPosts().filter(id => id !== postId))
  } else {
    post.likes++
    const arr = getLikedPosts()
    arr.push(postId)
    setLikedPosts(arr)
  }
}

function openComments(postId) {
  activePostId.value = postId
  const modal = new bootstrap.Modal('#commentsModal')
  modal.show()
}

function addComment() {
  const text = newComment.value.trim()
  if (!text) return alert('Please write a comment.')
  const post = posts.find(p => p.id === activePostId.value)
  if (!post) return
  const now = new Date()
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  post.comments.push({ user: 'You', text, time: formattedTime })
  newComment.value = ''
}

// 👇 For read more toggle
function toggleExpand(post) {
  post.expanded = !post.expanded
}

async function sharePost(postId) {
  const post = posts.find(p => p.id === postId)
  if (!post) return
  const shareData = {
    title: `Post by ${post.username}`,
    text: post.caption,
    url: location.href + `#post-${postId}`,
  }
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch (e) {}
  }
  await navigator.clipboard.writeText(shareData.url)
  alert('Link copied to clipboard.')
}
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <nav class="navbar navbar-light bg-light shadow-sm px-3">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <div class="d-flex justify-content-end w-100 align-items-center">
          <input
            v-model="searchQuery"
            class="form-control me-2"
            placeholder="Search posts or users..."
            style="width: 220px"
          />
          <a href="profile.html" class="btn btn-outline-secondary rounded-circle" title="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>

    <main class="container mt-4">
      <div class="d-flex justify-content-end align-items-center mb-3">
        <!-- 👇 Buttons moved to right -->
        <div class="btn-group me-2">
          <button class="btn btn-outline-secondary dropdown-toggle" style="height: 40px" data-bs-toggle="dropdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-arrow-down-up" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/>
            </svg> Sort
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#" @click.prevent="sortMode='newest'">Newest</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="sortMode='oldest'">Oldest</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="sortMode='popular'">Most Liked</a></li>
          </ul>
        </div>

        <a href="new-post.html" class="btn btn-outline-secondary" style="height: 40px">+ Create New Post</a>
      </div>

      <div v-for="post in displayedPosts" :key="post.id" class="post mb-4 p-3 border rounded shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center">
            <img
              :src="post.profilePic"
              alt="Profile"
              class="rounded-circle me-2 border"
              style="width:40px; height:40px; object-fit:cover;"
            />
            <div>
              <span class="fw-semibold text-accent">{{ post.username }}</span><br />
              <small class="text-muted">{{ post.datePosted }}</small>
            </div>
          </div>

          <button class="btn btn-sm" @click="sharePost(post.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
              <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
            </svg>
          </button>
        </div>

        <!-- 👇 Read more functionality -->
        <img
        v-if="post.image"
        :src="post.image"
        alt="Post image"
        class="responsive-img rounded mb-2"
      />

        <p class="mb-2">
          {{ post.expanded || post.caption.length <= 150 ? post.caption : post.caption.slice(0, 150) + '...' }}
          <button
            v-if="post.caption.length > 150"
            class="btn btn-link p-0 text-accent"
            @click="toggleExpand(post)"
          >
            {{ post.expanded ? 'Show less' : 'Read more' }}
          </button>
        </p>


        <div class="d-flex gap-3 align-items-center text-muted">
          <span class="like-btn" @click="toggleLike(post.id)">
            <i :class="['bi', hasLiked(post.id) ? 'bi-heart-fill text-danger' : 'bi-heart-fill']"></i>
            <span>{{ post.likes }}</span>
          </span>
          <span class="comment-btn" @click="openComments(post.id)">
            <i class="bi bi-chat"></i> {{ post.comments.length }}
          </span>
        </div>
      </div>
    </main>

    <div class="modal fade" id="commentsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Comments</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <template v-if="activePostId">
              <div
                v-for="(c, i) in [...(posts.find(p=>p.id===activePostId)?.comments || [])].reverse()"
                :key="i"
                class="mb-2 border-bottom pb-2"
              >
                <strong>{{ c.user }}</strong>
                <div>{{ c.text }}</div>
                <small class="text-muted">{{ c.time }}</small>
              </div>
              <p v-if="!posts.find(p=>p.id===activePostId)?.comments?.length" class="text-muted">
                No comments yet. Be the first to comment!
              </p>
            </template>
          </div>
          <div class="modal-footer">
            <input v-model="newComment" class="form-control" placeholder="Write a comment..." />
            <button @click="addComment" class="btn btn-primary">Post</button>
          </div>
        </div>
      </div>
    </div>

    <BottomFooter />
  </div>
</template>

<style scoped>
body {
  background-color: #F8E1E1;
  font-family: 'Nunito', sans-serif;
  color: #2F2F2F;
}

.text-accent {
  color: #806E83 !important;
}

/* 🖼 Responsive images — smaller and scale nicely */
.responsive-img {
  width: 85%;
  max-width: 600px;
  display: block;
  margin: 0 auto;
  height: auto;
  object-fit: cover;
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* Adjust on smaller screens */
@media (max-width: 768px) {
  .responsive-img {
    width: 100%;
    max-width: none;
  }
}

/* Limit post width on large screens */
@media (min-width: 992px) {
  .post {
    max-width: 700px;  /* or 650px if you want smaller */
    margin-left: auto;
    margin-right: auto;
  }
}

/* Optional: make post images also stop expanding */
@media (min-width: 992px) {
  .post img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
  }
}


.post {
  background: #fff;
  border-radius: 15px;
  transition: transform 0.2s;
}

.post:hover {
  transform: translateY(-3px);
}

.like-btn,
.comment-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.like-btn:hover i,
.comment-btn:hover i {
  color: #4E7C73;
}

.btn-outline-secondary {
  border: 2px solid #806E83;
  color: #806E83;
}

.btn-outline-secondary:hover {
  background: #806E83;
  color: #fff;
}
</style>
