<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';

// main.js - Fixed version with like/unlike and comment functionality
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const mainContent = document.getElementById('main-content');
const searchInput = document.getElementById('searchInput');
const postsContainer = document.getElementById('posts-container');

// Sidebar functions
function openSidebar() {
  sidebar.classList.add('open');
  overlay.style.display = 'block';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.style.display = 'none';
}

// Menu button click handler - only works on mobile
menuBtn.addEventListener('click', (e) => {
  if (window.innerWidth < 992) {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }
});

// Close sidebar when clicking overlay
overlay.addEventListener('click', closeSidebar);

// Close sidebar when clicking main content on mobile
mainContent.addEventListener('click', (e) => {
  if (window.innerWidth < 992 && sidebar.classList.contains('open')) {
    closeSidebar();
  }
});

// Sidebar links
document.querySelectorAll('.sidebar-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = a.dataset.target;
    
    if (window.innerWidth < 992) {
      closeSidebar();
    }
    
    if (target === 'forum' || !target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(`Open ${target} (implement navigation)`);
    }
  });
});

// SEARCH: filter posts as user types
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderPosts(posts);
    return;
  }
  const filtered = posts.filter(p =>
    (p.caption && p.caption.toLowerCase().includes(q)) ||
    (p.username && p.username.toLowerCase().includes(q))
  );
  renderPosts(filtered);
});

// SORT dropdown handling
document.querySelectorAll('[data-sort]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const mode = item.dataset.sort;
    let sorted = [...posts];
    if (mode === 'newest') {
      // do nothing - already newest first
    } else if (mode === 'oldest') {
      sorted = sorted.reverse();
    } else if (mode === 'popular') {
      sorted.sort((a,b) => b.likes - a.likes);
    }
    renderPosts(sorted);
  });
});

// LIKE/UNLIKE functionality
function setupLikeButtons() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.closest('.post').dataset.postId;
      const post = posts.find(p => p.id == postId);
      
      if (post) {
        // Toggle like state
        post.liked = !post.liked;
        if (post.liked) {
          post.likes++;
        } else {
          post.likes--;
        }
        
        // Update UI
        const postElement = this.closest('.post');
        const likesCount = postElement.querySelector('.likes-count');
        
        if (post.liked) {
          postElement.classList.add('liked');
        } else {
          postElement.classList.remove('liked');
        }
        
        likesCount.textContent = post.likes;
      }
    });
  });
}

// COMMENT functionality
function setupCommentButtons() {
  document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const postId = this.closest('.post').dataset.postId;
      const post = posts.find(p => p.id == postId);
      
      if (post) {
        // Store current post for comment modal
        currentPostId = postId;
        
        // Show comments in modal
        const commentsBody = document.getElementById('commentsBody');
        commentsBody.innerHTML = post.comments.map(comment => `
          <div class="comment mb-3">
            <strong>${comment.username}</strong>
            <p class="mb-1">${comment.text}</p>
            <small class="text-muted">${comment.timestamp}</small>
          </div>
        `).join('');
      }
    });
  });
}

// Handle adding new comments
document.getElementById('addCommentBtn').addEventListener('click', function() {
  const commentInput = document.getElementById('newCommentInput');
  const commentText = commentInput.value.trim();
  
  if (commentText && currentPostId) {
    const post = posts.find(p => p.id == currentPostId);
    
    if (post) {
      // Add new comment
      post.comments.push({
        username: 'You', // or get current user
        text: commentText,
        timestamp: new Date().toLocaleDateString()
      });
      
      // Update comments count
      const postElement = document.querySelector(`.post[data-post-id="${currentPostId}"]`);
      const commentsCount = postElement.querySelector('.comments-count');
      commentsCount.textContent = post.comments.length;
      
      // Clear input and close modal
      commentInput.value = '';
      
      // Close modal properly without dimming
      const modal = bootstrap.Modal.getInstance(document.getElementById('commentsModal'));
      modal.hide();
      
      // Remove backdrop manually to prevent dimming
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
      });
      
      // Re-enable body scrolling
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
  }
});

// Handle modal hidden event to clean up
document.getElementById('commentsModal').addEventListener('hidden.bs.modal', function () {
  // Ensure all backdrop is removed
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.remove();
  });
  document.body.classList.remove('modal-open');
  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '0';
});

let currentPostId = null;

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth >= 992) {
    sidebar.classList.add('open');
    overlay.style.display = 'none';
  } else {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  }
});

// Initialize on page load
window.dispatchEvent(new Event('resize'));

// Sample posts data with profilepic1.jpg
let posts = [
  {
    id: "p1",
    username: "Meowie",
    profilePic: "img/profilepic1.jpg", // Using profilepic1.jpg
    caption: "I love this cat soooo much!",
    image: "img/cutecats1.jpg",
    likes: 22,
    comments: [ { user: "Sia", text: "So cute!" } ]
  },
  {
    id: "p2", 
    username: "Adorablecats123",
    profilePic: "img/profilepic2.jpg", // Using profilepic1.jpg for both users for now
    caption: "Look at this cutie 😻",
    image: "img/cutecats2.jpg", 
    likes: 18,
    comments: []
  }
];

// helper to get liked posts from localStorage (array of ids)
function getLikedPosts() {
  try {
    const raw = localStorage.getItem("likedPosts");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLikedPosts(arr) {
  localStorage.setItem("likedPosts", JSON.stringify(arr));
}

function hasLiked(postId) {
  const liked = getLikedPosts();
  return liked.includes(postId);
}

// render posts to container - FIXED PROFILE PICTURE
function renderPosts(list = posts) {
  const container = document.getElementById("posts-container");
  container.innerHTML = "";

  list.forEach((post, index) => {
    const liked = hasLiked(post.id);
    const heartClass = liked ? "bi-heart-fill text-danger" : "bi-heart-fill";

    container.innerHTML += `
    <div class="post" data-post-id="${post.id}">
      <div class="post-header">
        <div class="user-info">
          <img src="img/profilepic1.jpg" alt="Profile" class="user-avatar" 
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjIuNSIgY3k9IjIyLjUiIHI9IjIyLjUiIGZpbGw9IiM4MDZFODMiLz4KPC9zdmc+'">
          <span class="username">${post.username}</span>
        </div>
        <button class="btn btn-sm btn-outline-secondary" onclick="sharePost('${post.id}')">
          <i class="bi bi-share"></i>
        </button>
      </div>
      
      <p class="post-caption">${post.caption}</p>
      
      <img src="${post.image}" alt="Post image">

      <div class="post-actions">
        <span class="like-btn" onclick="toggleLike('${post.id}')">
          <i class="bi ${heartClass}"></i>
          <span class="likes-count">${post.likes}</span>
        </span>
        <span class="comment-btn" onclick="openComments('${post.id}')">
          <i class="bi bi-chat"></i>
          <span class="comments-count">${post.comments.length}</span>
        </span>
        <span onclick="sharePost('${post.id}')">
          <i class="bi bi-share"></i> Share
        </span>
      </div>
    </div>`;
  });
}

// Function to handle profile clicks
function viewProfile(username) {
  window.location.href = `profile.html?user=${username}`;
}

// toggle like: only allow like once per user (tracked in localStorage)
function toggleLike(postId) {
  // find post
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const liked = hasLiked(postId);
  if (liked) {
    // user already liked -> unlike (optional: allow unlike; here we allow unlike to decrement)
    post.likes = Math.max(0, post.likes - 1);
    const arr = getLikedPosts().filter(id => id !== postId);
    setLikedPosts(arr);
  } else {
    post.likes = post.likes + 1;
    const arr = getLikedPosts();
    arr.push(postId);
    setLikedPosts(arr);
  }

  renderPosts(); // re-render to update button state and counts
}

// ----- Comments -----
let activeCommentPostId = null;

function openComments(postId) {
  activeCommentPostId = postId;
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const commentsBody = document.getElementById("commentsBody");
  commentsBody.innerHTML = "";

  if (post.comments.length === 0) {
    commentsBody.innerHTML = "<p class='text-muted'>No comments yet. Be the first to comment!</p>";
  } else {
    post.comments.forEach(c => {
      commentsBody.innerHTML += `
        <div class="mb-2">
          <strong>${escapeHtml(c.user || "User")}</strong>
          <div>${escapeHtml(c.text)}</div>
        </div>
      `;
    });
  }

  // show modal
  const commentsModal = new bootstrap.Modal(document.getElementById("commentsModal"));
  commentsModal.show();
}

// Post a new comment
document.getElementById("addCommentBtn").addEventListener("click", () => {
  const input = document.getElementById("newCommentInput");
  const text = input.value && input.value.trim();
  if (!text) return alert("Please write a comment.");

  const p = posts.find(pp => pp.id === activeCommentPostId);
  if (!p) return;

  p.comments.push({ user: "You", text });
  input.value = "";

  // close and re-open (to refresh content) or re-render modal body
  openComments(activeCommentPostId);

  // re-render posts so comment counts update
  renderPosts();
});

// small helper to escape HTML
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
  });
}

// ---- Share ----
async function sharePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const shareData = {
    title: `Post by ${post.username}`,
    text: post.caption,
    url: location.href + `#post-${postId}`
  };

  // try Web Share API
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (e) {
      // user cancelled or failed — fall back
    }
  }

  // fallback: copy link
  try {
    await navigator.clipboard.writeText(shareData.url);
    alert("Link copied to clipboard.");
  } catch (e) {
    alert("Share not supported on this browser.");
  }
}

// initial render
document.addEventListener("DOMContentLoaded", () => renderPosts());

// Handle window resize - FIXED VERSION
window.addEventListener('resize', function() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  if (window.innerWidth >= 992) {
    // Desktop - ensure sidebar is open and no overlay
    sidebar.classList.add('open');
    overlay.style.display = 'none';
    
    // Ensure navbar title is visible
    document.querySelector('.navbar').style.paddingLeft = '280px';
  } else {
    // Mobile - ensure sidebar is closed initially
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
    
    // Reset navbar padding for mobile
    document.querySelector('.navbar').style.paddingLeft = '1rem';
  }
});

// Initialize on page load
window.dispatchEvent(new Event('resize'));
</script>

<template>
    <Navbar>
        <template v-slot:navbar-title>
            Forum
        </template>
    </Navbar>

<body>

    <!-- Navbar -->
    <nav class="navbar navbar-light bg-light px-3 shadow-sm">
        <div class="d-flex align-items-center">
            <button class="btn" id="menu-btn" aria-label="Open menu">
                <i class="bi bi-list fs-4"></i>
            </button>
            <span class="fw-semibold ms-2">Community Forum</span>
        </div>

        <div class="d-flex align-items-center ms-auto">
            <!-- visible search input -->
            <input id="searchInput" class="form-control me-2" placeholder="Search posts or users..."
                style="width:220px;">
            <a href="profile.html" class="btn btn-outline-secondary rounded-circle" title="Profile">
                <i class="bi bi-person"></i>
            </a>
        </div>
    </nav>

    <!-- Sidebar Menu (Dropdown Menu Bar) -->
    <div id="sidebar" class="bg-light shadow p-3">
        <h6 class="fw-bold mb-3">Explore Communities</h6>
        <ul class="list-unstyled">
            <li><a href="#" class="sidebar-link" data-target="map">Map</a></li>
            <li><a href="#" class="sidebar-link" data-target="forum">Forum</a></li>
            <li><a href="#" class="sidebar-link">Adopt</a></li>
            <li><a href="#" class="sidebar-link">News</a></li>
            <li><a href="#" class="sidebar-link">Cat Profile</a></li>
            <li><a href="#" class="sidebar-link">AI Picture</a></li>
            <li><a href="#" class="sidebar-link">Volunteer Form</a></li>
            <li><a href="#" class="sidebar-link">Adoption Form</a></li>
        </ul>
    </div>
    <!-- Overlay -->
    <div id="overlay"></div>


    <!-- Main Forum Section -->
    <main id="main-content" class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Posts</h5>
            <div>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                        <i class="bi bi-arrow-down-up"></i> Sort
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" data-sort="newest">Newest</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="oldest">Oldest</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="popular">Most Liked</a></li>
                    </ul>
                    <button class="btn btn-outline-primary ms-2" id="filterBtn">
                        <i class="bi bi-funnel"></i> Filter
                    </button>
                </div>
                <a href="new-post.html" class="btn btn-success ms-2">+ Create New Post</a>
            </div>
        </div>

        <!-- Posts will load here -->
        <div id="posts-container"></div>
    </main>

    <!-- Comment Modal (Bootstrap) -->
    <div class="modal fade" id="commentsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Comments</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="commentsBody">
                    <!-- comments will be injected here -->
                </div>
                <div class="modal-footer">
                    <input id="newCommentInput" class="form-control" placeholder="Write a comment...">
                    <button id="addCommentBtn" class="btn btn-primary">Post</button>
                </div>
            </div>
        </div>
    </div>

    <BottomFooter></BottomFooter>
</template>

<style scoped>
/* ========================
   General Styling
======================== */
body {
  background-color: #F8E1E1;
  font-family: 'Nunito', sans-serif;
  color: #2F2F2F;
  overflow-x: hidden;
  margin: 0;
}

/* Navbar - Fix community forum title blocking */
.navbar {
  background-color: #fff !important;
  position: relative;
  z-index: 1000;
  transition: padding-left 0.3s ease;
  padding-left: 1rem !important; /* Ensure title has space */
}

.navbar > .d-flex {
  margin-left: 0 !important; /* Remove any left margin */
}

.navbar span {
  font-family: 'Potta One', cursive;
  color: #806E83;
  font-size: 1.25rem;
  margin-left: 0.5rem;
}

/* ========================
   Sidebar (Dropdown Menu) - MOBILE FIRST
======================== */
#sidebar {
  position: fixed;
  top: 0;
  left: -260px;
  width: 260px;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  transition: left 0.3s ease;
  z-index: 2000;
  overflow-y: auto;
}

#sidebar.open {
  left: 0;
}

#sidebar a {
  display: block;
  text-decoration: none;
  color: #333;
  margin: 0.6rem 0;
  font-weight: 500;
}

#overlay {
  display: none;
  position: fixed;
  top: 0; 
  left: 0;
  width: 100%; 
  height: 100%;
  background: rgba(0,0,0,0.4);
  z-index: 1500;
}

/* ========================
   DESKTOP STYLES (≥ 992px)
======================== */
@media (min-width: 992px) {
  #sidebar {
    left: 0 !important;
    box-shadow: none;
    border-right: 1px solid #e9ecef;
  }
  
  #menu-btn {
    display: none;
  }
  
  /* Main content with proper spacing from sidebar */
  main {
    margin-left: 280px !important; /* Increased from 260px for more space */
    width: calc(100% - 280px) !important;
    transition: none;
    padding: 2rem 1.5rem; /* More padding on desktop */
  }
  
  /* Navbar adjustment for desktop */
  .navbar {
    padding-left: 280px !important; /* Match sidebar width */
  }
  
  #overlay {
    display: none !important;
  }
  
  .forum-container {
    max-width: 650px; /* Slightly larger for better spacing */
    margin: 0 auto;
  }
  
  /* Image styling for desktop - more padding */
  .post img {
    padding: 15px; /* More padding on desktop */
    margin: 15px 0; /* More space around image */
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
  }
}

/* ========================
   MOBILE STYLES (< 992px)
======================== */
@media (max-width: 991px) {
  #overlay {
    display: none;
  }
  
  #sidebar.open ~ #overlay {
    display: block;
  }
  
  main {
    margin-left: 0 !important;
    width: 100% !important;
    padding: 1.5rem 1rem; /* Standard mobile padding */
  }
  
  .navbar {
    padding-left: 1rem !important;
  }
  
  /* Image styling for mobile - less padding, full width */
  .post img {
    padding: 5px; /* Less padding on mobile */
    margin: 10px 0; /* Standard mobile spacing */
    background-color: #f8f9fa;
    border: none; /* No border on mobile */
  }
}

/* ========================
   Forum Layout
======================== */
main {
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - 76px);
}

.forum-container {
  max-width: 700px;
  margin: 0 auto;
}

/* ========================
   Post Cards
======================== */
.post {
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s;
}

.post:hover {
  transform: translateY(-3px);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

/* User profile section - LARGER PROFILE PICTURE */
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.user-avatar {
  width: 50px !important;        /* Even larger */
  height: 50px !important;       /* Even larger */
  border-radius: 50% !important;
  object-fit: cover !important;
  cursor: pointer;
  border: 3px solid #806E83;
  display: block;
  flex-shrink: 0;
}

.username {
  font-family: 'Potta One', cursive;
  color: #806E83;
  font-size: 1.5rem;             /* Larger to match */
  cursor: pointer;
  margin: 0;
  line-height: 1;
}

.username:hover {
  color: #6a5a6c;
  text-decoration: underline;
}

.username {
  font-family: 'Potta One', cursive;
  color: #806E83;
  font-size: 1.1rem;
  cursor: pointer;
  text-decoration: none;
  margin: 0;
  transition: color 0.2s;
  /* No background, no padding, just pure text */
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
}

.username:hover {
  color: #6a5a6c;
  text-decoration: underline;
}

/* POST CONTENT IMAGE (the main post picture) */
.post-content-image {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
  object-fit: contain;
  border-radius: 12px;
  margin: 10px 0;
  padding: 0;
  background-color: #f8f9fa;
}

.post-caption {
  margin: 0.8rem 0;
  padding: 0 0.5rem;
  line-height: 1.5;
  font-size: 1rem;
}

/* Post image - consistent across devices */
.post img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
  object-fit: contain; /* Show full image without squashing */
  border-radius: 12px;
}

/* ========================
   Actions (like/comment/share)
======================== */
.post-actions {
  display: flex;
  align-items: center;
  margin-top: 0.8rem;
  font-size: 1rem;
  padding: 0 0.5rem;
}

.post-actions span {
  cursor: pointer;
  margin-right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: transform 0.2s;
}

.post-actions span:hover {
  transform: scale(1.05);
}

.post-actions i {
  color: #806E83;
  transition: color 0.2s;
  font-size: 1.2rem;
}

/* Heart styling */
.post-actions .bi-heart-fill {
  color: #806E83;
}

.post-actions .bi-heart-fill.text-danger {
  color: #E63946 !important;
}

.post-actions span:hover i {
  color: #4E7C73;
}

.likes-count, .comments-count {
  font-size: 0.95rem;
  font-weight: 500;
}

/* ========================
   Buttons
======================== */
.btn-outline-secondary {
  border: 2px solid #806E83;
  color: #806E83;
  background: transparent;
  border-radius: 0.375rem;
}

.btn-outline-secondary:hover {
  background: #806E83;
  color: white;
}

.btn-outline-primary {
  border: 2px solid #806E83;
  color: #806E83;
  border-radius: 0.375rem;
}

.btn-outline-primary:hover {
  background: #806E83;
  color: #fff;
}

/* Fix dropdown toggle button */
.btn-group .dropdown-toggle {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.btn-group .btn:not(.dropdown-toggle) {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px;
}

/* ========================
   Responsive adjustments
======================== */
@media (max-width: 768px) {
  main {
    padding: 1rem;
  }

  .post {
    padding: 1rem;
    margin-bottom: 1.2rem;
  }

  .post img {
    max-height: none; /* Remove any height restrictions */
  }

  .navbar input {
    width: 150px !important;
  }

  .btn {
    font-size: 0.9rem;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
  }
  
  .username {
    font-size: 1rem;
  }
  
  .post-actions {
    margin-top: 0.6rem;
  }
  
  .post-actions span {
    margin-right: 1.2rem;
  }
}
</style>