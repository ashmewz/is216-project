<script setup>
import Navbar from '@/components/resuables/Navbar.vue'
import BottomFooter from '@/components/resuables/BottomFooter.vue'
import { ref, onMounted, watch } from "vue";
import { db } from "@/firebase"; // make sure you exported Firestore as db
import { getFirestore, collection, addDoc, getDoc, doc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { getAuth } from "firebase/auth";
import { validatePost, validateComment } from '@/utils/validators';

// State
const auth = getAuth();
const posts = ref([]);
const loading = ref(false);
const showCreatePostModal = ref(false);
// newComment maps postId -> input string for that post
const newComment = ref({});
const showCommentModal = ref(false);
const activeCommentPostId = ref(null);
const newCommentText = ref('');
const fieldErrors = ref({});

const openCommentModal = (postId) => {
  activeCommentPostId.value = postId;
  newCommentText.value = '';
  showCommentModal.value = true;
};

const closeCommentModal = () => {
  showCommentModal.value = false;
  activeCommentPostId.value = null;
};



const newPost = ref({
  author: "",
  description: "",
  image: "",
});

// Watch inputs to clear errors when user types
watch(() => newPost.value.description, () => fieldErrors.value.description = '');
watch(() => newCommentText.value, () => fieldErrors.value.comment = '');

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

  const errors = validatePost(newPost.value);
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors;
    return;
  }


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
    showCreatePostModal.value = false;
    await fetchPosts();
  } catch (err) {
    console.error("Error adding post:", err);
  }
};

//retrieve all post
const fetchPosts = async () => {
  loading.value = true;
  try {
    const snapshot = await getDocs(collection(db, "posts"));
    const postData = [];

    for (const docSnap of snapshot.docs) {
      const post = { id: docSnap.id, ...docSnap.data(), comments: [] };

      // Fetch and set post author username and avatar
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

      // Fetch comments for the post, enrich with author username and avatar
      const commentsSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"));
      post.comments = await Promise.all(commentsSnap.docs.map(async (c) => {
        const commentData = { id: c.id, ...c.data() };
        let userName = "Unknown";
        let userAvatar = null;
        if (commentData.author) {
          const cUserDoc = await getDoc(doc(db, "volunteers", commentData.author));
          if (cUserDoc.exists()) {
            const userData = cUserDoc.data();
            userName = userData.username || "Unknown";
            userAvatar = userData.avatar || null;
          }
        }
        commentData.username = userName;
        commentData.avatar = userAvatar;
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


//create a comment in a post
const addComment = async () => {

  const errors = validateComment({ comment: newCommentText.value });
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors;
    return;
  }

  const commentText = newCommentText.value.trim();
 
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return alert("You must be logged in to comment.");
  }
  try {
    await addDoc(collection(db, "posts", activeCommentPostId.value, "comments"), {
      author: currentUser.uid,
      comment: commentText,
      createdAt: serverTimestamp(),
    });
    newCommentText.value = '';
    await fetchPosts();
    closeCommentModal();
  } catch (err) {
    console.error("Error adding comment:", err);
  }
};


onMounted(() => {
  fetchPosts();
});

</script>

<template>
  <div class="forum-page">
    <Navbar />
    <main class="container mt-4">
  

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

        <button 
          class="btn btn-outline-secondary text-nowrap " 
          style="height: 40px" 
          @click="showCreatePostModal = true">
          + Create New Post
        </button>
        </div>
      </div>

      <!-- Modal -->
  <div v-if="showCreatePostModal">
    <!-- Backdrop -->
    <div class="modal-backdrop fade show"></div>

    <!-- Modal dialog centered -->
    <div class="modal d-flex align-items-center justify-content-center fade show" tabindex="-1" style="display: flex;">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 600px; width: 100%;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Post</h5>
            <button type="button" class="btn-close" @click="showCreatePostModal = false"></button>
          </div>
          <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              style="display:none" 
              @change="handleImageUpload"
            />
            <button class="btn btn-secondary mb-3 w-100" @click="triggerFileInput">
              Choose Image
            </button>
            <img v-if="newPost.image" :src="newPost.image" alt="Preview" style="max-width: 100%; margin-bottom: 1rem; border-radius: 6px;" />
            <textarea 
              v-model="newPost.description" 
              placeholder="Write something..." 
              :class="{ 'is-invalid': fieldErrors.description }"
              class="form-control" 
              rows="4"
            ></textarea>
            <div class="invalid-feedback">{{ fieldErrors.description }}</div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreatePostModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="createPost">Post</button>
          </div>
        </div>
      </div>
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
        </p>

        <div class="d-flex gap-3 align-items-center text-muted">
          <span class="comment-btn" @click="openComments(post.id)">
            <i class="bi bi-chat"></i> {{ post.comments.length }}
          </span>
        </div>

      <!-- 💬 Comments -->
      <div class="mt-3 comment-section">
      <h6 class="mb-3">Comments ({{ post.comments.length }})</h6>
      <ul class="list-group list-group-flush mb-3">
        <li v-for="comment in post.comments" :key="comment.id" class="list-group-item d-flex align-items-start gap-3 py-2">
          <img
            :src="comment.avatar" 
            alt="Profile"
            class="comment-avatar"
          />
          <div class="comment-content flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <strong class="comment-username">{{ comment.username }}</strong>
              <small class="text-muted comment-time">
                {{ comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleString() : '' }}
              </small>
            </div>
            <p class="comment-text mb-0">{{ comment.comment }}</p>
          </div>
        </li>
      </ul>
      <button class="btn btn-outline-secondary btn-sm" @click="openCommentModal(post.id)">
        Add Comment
      </button>
    </div>
</div>

      <!-- Comment Modal -->
<div v-if="showCommentModal">
  <div class="modal-backdrop fade show"></div>

  <div class="modal d-flex align-items-center justify-content-center fade show" tabindex="-1" style="display: flex;">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 600px; width: 100%;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add Comment</h5>
          <button type="button" class="btn-close" @click="closeCommentModal"></button>
        </div>
        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
          <textarea v-model="newCommentText" class="form-control" rows="4"  :class="{ 'is-invalid': fieldErrors.comment }"  placeholder="Write your comment here..."></textarea>
          <div class="invalid-feedback">{{ fieldErrors.comment }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCommentModal">Cancel</button>
          <button class="btn btn-primary" @click="addComment">Submit</button>
        </div>
      </div>
    </div>
  </div>
</div>
    </main>
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




.comment-section {
  background: #fefefe;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #ddd;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #ccc;
}

.comment-content {
  font-size: 0.9rem;
  color: #444;
}

.comment-username {
  font-weight: 600;
  color: #806e83;
}

.comment-time {
  font-size: 0.75rem;
  color: #999;
}

.comment-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
