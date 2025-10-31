<script setup>
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import { ref, onMounted } from "vue";
import { db } from "@/firebase"; // make sure you exported Firestore as db
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { getAuth } from "firebase/auth";

// State
const auth = getAuth();

const posts = ref([]);
const loading = ref(false);

// newComment maps postId -> input string for that post
const newComment = ref({});

const newPost = ref({
  author: "",
  description: "",
  image: "",
});

// File input ref (optional if you want trigger button)
const fileInput = ref(null);
const triggerFileInput = () => {
  fileInput.value.click();
};

// File to base64 converter
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Handle file change event
const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const base64 = await fileToBase64(file);
    newPost.value.image = base64;
  } catch (err) {
    console.error('Failed to convert image:', err);
  }
};

// Create post with base64 image
const createPost = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return alert("You must be logged in to create a post.");
  }
  try {
    await addDoc(collection(db, "posts"), {
      author: currentUser.uid,
      description: newPost.value.description,
      image: newPost.value.image || null, // base64 image string
      createdAt: serverTimestamp(),
    });
    // Reset form
    newPost.value.description = "";
    newPost.value.image = "";
    await fetchPosts();
  } catch (err) {
    console.error("Error adding post:", err);
  }
};

const fetchPosts = async () => {
  loading.value = true;
  try {
    const snapshot = await getDocs(collection(db, "posts"));
    const postData = [];
    for (const docSnap of snapshot.docs) {
      const post = { id: docSnap.id, ...docSnap.data(), comments: [] };
      // Post author username lookup
      if (post.author) {
        const userDoc = await getDoc(doc(db, "volunteers", post.author));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          post.author = userData.username || "Unknown";
          post.avatar = userData.avatar || null;
        } else {
          post.author = "Unknown";
          post.avatar = null;
        }
      }
      // Fetch comments for each post, resolve each author's username
      const commentsSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"));
      post.comments = await Promise.all(commentsSnap.docs.map(async (c) => {
        const commentData = { id: c.id, ...c.data() };
        // Lookup username for each comment author (UID)
        let userName = "Unknown";
        if (commentData.author) {
          const cUserDoc = await getDoc(doc(db, "volunteers", commentData.author));
          if (cUserDoc.exists()) {
            userName = cUserDoc.data().username || "Unknown";
          }
        }
        commentData.username = userName;
        return commentData;
      }));
      postData.push(post);
    }
    posts.value = postData;
  } catch (err) {
    console.error("Error fetching posts:", err);
  }
  loading.value = false;
};

const addComment = async (postId) => {
  const commentText = (newComment.value[postId] || "").trim();
  if (!commentText) {
    return alert("Please write a comment.");
  }
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return alert("You must be logged in to comment.");
  }
  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      author: currentUser.uid,      // Save current user's UID
      comment: commentText,
      createdAt: serverTimestamp(),
    });
    newComment.value[postId] = "";
    await fetchPosts();
  } catch (err) {
    console.error("Error adding comment:", err);
  }
};


onMounted(() => {
  fetchPosts();
});

// ✅ Run once when page loads
// onMounted(fetchPosts)


// ✅ Posts data
// const posts = reactive([
//   {
//     id: 'p1',
//     username: 'Meowie',
//     profilePic: '/src/assets/profilepic1.jpg',
//     caption:
//       'I love this cat soooo much! 😻 This is Whiskers, and she’s been with me since I rescued her from the void deck. She loves cuddles, chasing string toys, and stealing my seat whenever I get up for just 2 seconds!',
//     image: '/src/assets/cutecats1.jpg',
//     likes: 22,
//     comments: [{ user: 'Sia', text: 'So cute!', time: '2025-10-24 14:30' }],
//     datePosted: '2025-10-23 18:00',
//     expanded: false,
//   },
//   {
//     id: 'p2',
//     username: 'Adorablecats123',
//     profilePic: '/src/assets/profilepic2.jpg',
//     caption: 'Look at this cutie 😻',
//     image: '/src/assets/cutecats2.jpg',
//     likes: 18,
//     comments: [],
//     datePosted: '2025-10-24 09:15',
//     expanded: false,
//   },
//   {
//     id: 'p3',
//     username: 'CatCareTips',
//     profilePic: '/src/assets/profilepic3.jpg',
//     caption:
//       'Cats are wonderful companions, but caring for them goes beyond just feeding. Regular grooming helps them stay clean and prevents hairballs. Providing scratching posts protects your furniture and helps them stretch. Always schedule vet visits, and remember — love, patience, and playtime go a long way in keeping your feline friend happy and healthy.',
//     image: '',
//     likes: 12,
//     comments: [],
//     datePosted: '2025-10-22 16:45',
//     expanded: false,
//   },
// ])

// // ✅ Reactive variables
// const searchQuery = ref('')
// const sortMode = ref('newest')
// const activePostId = ref(null)
// const newComment = ref('')

// // ✅ Computed posts
// const displayedPosts = computed(() => {
//   let list = posts.filter(p => {
//     const q = searchQuery.value.toLowerCase()
//     return (
//       !q ||
//       p.caption.toLowerCase().includes(q) ||
//       p.username.toLowerCase().includes(q)
//     )
//   })
//   if (sortMode.value === 'oldest') list = [...list].reverse()
//   if (sortMode.value === 'popular') list = [...list].sort((a, b) => b.likes - a.likes)
//   return list
// })



// // ✅ Comments modal
// function openComments(postId) {
//   activePostId.value = postId
//   const modal = new bootstrap.Modal('#commentsModal')
//   modal.show()
// }

// function addComment() {
//   const text = newComment.value.trim()
//   if (!text) return alert('Please write a comment.')
//   const post = posts.find(p => p.id === activePostId.value)
//   if (!post) return
//   const now = new Date()
//   const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
//     now.getDate()
//   ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
//     now.getMinutes()
//   ).padStart(2, '0')}`
//   post.comments.push({ user: 'You', text, time: formattedTime })
//   newComment.value = ''
// }

// // ✅ Read more toggle
// function toggleExpand(post) {
//   post.expanded = !post.expanded
// }

// // ✅ Share post
// async function sharePost(postId) {
//   const post = posts.find(p => p.id === postId)
//   if (!post) return
//   const shareData = {
//     title: `Post by ${post.username}`,
//     text: post.caption,
//     url: location.href + `#post-${postId}`,
//   }
//   if (navigator.share) {
//     try {
//       await navigator.share(shareData)
//       return
//     } catch (e) {}
//   }
//   await navigator.clipboard.writeText(shareData.url)
//   alert('Link copied to clipboard.')
// }
</script>

<template>
  <div class="forum-page">
    <Navbar />

    <main class="container mt-4">
      <div class="container py-4">
    <h2 class="mb-3">🐾 Forum Posts</h2>

    <!-- 🧱 Create Post -->
    <div class="card p-3 mb-4 shadow-sm">
      <h5>Create New Post</h5>
      <!-- File input with custom trigger button -->
      <input 
        type="file" 
        ref="fileInput" 
        accept="image/*"
        style="display:none"
        @change="handleImageUpload" 
      />
      <button class="btn btn-secondary" @click="triggerFileInput">
        Choose Image
      </button>
      <!-- Preview image -->
      <img v-if="newPost.image" :src="newPost.image" alt="Preview" style="max-width:200px"/>
      <textarea v-model="newPost.description" placeholder="Write something..." class="form-control mb-2" />
      <button @click="createPost" class="btn btn-primary">Post</button>
    
    </div>

    <!-- 🐱 Posts -->
    <div v-for="post in posts" :key="post.id" class="card p-3 mb-3 shadow-sm">
      <h6>{{ post.author }}</h6>
      <p>{{ post.description }}</p>
      <img
        v-if="post.image"
        :src="post.image"
        alt="Post image"
        class="img-fluid rounded mb-2"
        style="max-height: 300px; object-fit: cover"
      />
      <small class="text-muted">
        {{ post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : '' }}
      </small>

      <!-- 💬 Comments -->
      <div class="mt-3">
        <h6>Comments ({{ post.comments.length }})</h6>
          <ul class="list-group mb-2">
          <li v-for="comment in post.comments" :key="comment.id" class="list-group-item d-flex justify-content-between">
            <div>
              <strong>{{ comment.username }}</strong>: {{ comment.comment }}
            </div>
            <small class="text-muted">
              {{ comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : '' }}
            </small>
          </li>
        </ul>
        <div class="input-group">
      <input
        v-model="newComment[post.id]"
        placeholder="Add a comment..."
        class="form-control"
        @keyup.enter="addComment(post.id)"
      />
      <button class="btn btn-outline-secondary" @click="addComment(post.id)">Post</button>
    </div>
      </div>
    </div>
  </div>





















      <!-- Search + Sort + Create -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <!-- Search -->
        <input
          v-model="searchQuery"
          class="form-control me-2"
          placeholder="Search posts or users"
          style="width: 250px"
        />

        <!-- Sort + Create -->
        <div class="d-flex align-items-center">
          <div class="btn-group me-2">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              style="height: 40px"
              data-bs-toggle="dropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="currentColor"
                class="bi bi-arrow-down-up"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146
                  3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0
                  0-.708 0l-4 4a.5.5 0 1 0 .708.708L11
                  2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5
                  0 0 1 .5.5v11.793l3.146-3.147a.5.5
                  0 0 1 .708.708l-4 4a.5.5 0 0
                  1-.708 0l-4-4a.5.5 0 0 1
                  .708-.708L4 13.293V1.5a.5.5
                  0 0 1 .5-.5"
                />
              </svg>
              Sort
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sortMode='newest'">Newest</a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sortMode='oldest'">Oldest</a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="sortMode='popular'">Most Liked</a>
              </li>
            </ul>
          </div>

          <RouterLink to="/create-post" class="btn btn-outline-secondary text-nowrap" style="height: 40px">
            + Create New Post
          </RouterLink>
        </div>
      </div>

      <!-- Posts -->
      <div
        v-for="post in posts" 
        :key="post.id"
        class="post mb-4 p-3 border rounded shadow-sm"
      >
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="d-flex align-items-center">
            <img
              :src="post.avatar"
              alt="Profile"
              class="rounded-circle me-2 border"
              style="width:40px; height:40px; object-fit:cover;"
            />
            <div>
              <span class="fw-semibold text-accent">{{ post.author }}</span><br />
              <small class="text-muted">{{ post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : '' }}</small>
            </div>
          </div>

          <button class="btn btn-sm" @click="sharePost(post.id)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="bi bi-share"
              viewBox="0 0 16 16"
            >
              <path
                d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5
                1.5 0 0 0 0-3M11 2.5a2.5 2.5 0
                1 1 .603 1.628l-6.718 3.12a2.5
                2.5 0 0 1 0 1.504l6.718 3.12a2.5
                2.5 0 1 1-.488.876l-6.718-3.12a2.5
                2.5 0 1 1 0-3.256l6.718-3.12A2.5
                2.5 0 0 1 11 2.5m-8.5 4a1.5
                1.5 0 1 0 0 3 1.5 1.5 0 0 0
                0-3m11 5.5a1.5 1.5 0 1 0 0 3
                1.5 1.5 0 0 0 0-3"
              />
            </svg>
          </button>
        </div>

        <!-- Post content -->
        <img
          v-if="post.image"
          :src="post.image"
          alt="Post image"
          class="responsive-img rounded mb-2"
        />

        <p class="mb-2">
           {{ post.description }}
          <!-- <button
            v-if="post.caption.length > 150"
            class="btn btn-link p-0 text-accent"
            @click="toggleExpand(post)"
          >
            {{ post.expanded ? 'Show less' : 'Read more' }}
          </button> -->
        </p>

        <!-- <div class="d-flex gap-3 align-items-center text-muted">
          <span class="like-btn" @click="toggleLike(post.id)">
            <i :class="['bi', hasLiked(post.id) ? 'bi-heart-fill text-danger' : 'bi-heart-fill']"></i>
            <span>{{ post.likes }}</span>
          </span>
          <span class="comment-btn" @click="openComments(post.id)">
            <i class="bi bi-chat"></i> {{ post.comments.length }}
          </span>
        </div> -->
      </div>
    </main>

    <!-- Comments Modal -->
    <div class="modal fade" id="commentsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content rounded-4 shadow-lg border-0">
          <div class="modal-header border-bottom bg-light">
            <h5 class="modal-title fw-semibold">
              Comments
              <span v-if="activePostId" class="text-muted fs-6">
                ({{ posts.find(p => p.id === activePostId)?.comments?.length || 0 }})
              </span>
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body bg-light">
            <template v-if="activePostId">
              <div
                v-for="(c, i) in [...(posts.find(p => p.id === activePostId)?.comments || [])].reverse()"
                :key="i"
                class="comment d-flex align-items-start mb-3 p-3 bg-white rounded-3 shadow-sm"
              >
                <img
                  :src="`/src/assets/profilepic_placeholder.jpg`"
                  alt="Profile"
                  class="rounded-circle me-3"
                  style="width: 45px; height: 45px; object-fit: cover;"
                />
                <div class="flex-grow-1">
                  <strong class="d-block mb-1">{{ c.user }}</strong>
                  <p class="mb-1">{{ c.text }}</p>
                  <small class="text-muted">{{ c.time }}</small>
                </div>
              </div>

              <p
                v-if="!posts.find(p => p.id === activePostId)?.comments?.length"
                class="text-muted text-center py-4"
              >
                No comments yet. Be the first to comment!
              </p>
            </template>
          </div>

          <div class="modal-footer border-top bg-white d-flex align-items-center gap-2">
            <input
              v-model="newComment"
              class="form-control rounded-pill px-3 py-2"
              placeholder="Write a comment..."
              @keyup.enter="addComment"
            />
            <button @click="addComment" class="btn btn-primary btn-sm rounded-pill px-3">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <BottomFooter />
  </div>
</template>

<style scoped>
body {
  background-color: #f8e1e1;
  font-family: 'Nunito', sans-serif;
  color: #2f2f2f;
}

.text-accent {
  color: #806e83 !important;
}

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

@media (max-width: 768px) {
  .responsive-img {
    width: 100%;
    max-width: none;
  }
}

@media (min-width: 992px) {
  .post {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

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
  color: #4e7c73;
}

.btn-outline-secondary {
  border: 2px solid #806e83;
  color: #806e83;
}

.btn-outline-secondary:hover {
  background: #806e83;
  color: #fff;
}

.comment-profile {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.comment p {
  margin: 0;
  line-height: 1.3;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
