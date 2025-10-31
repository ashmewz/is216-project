<script setup>
import { ref } from 'vue'
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';

// ✅ Import images properly
import newscat1 from '@/assets/newscat1.jpg'
import newscat2 from '@/assets/newscat2.jpg'
import newscat3 from '@/assets/newscat3.jpg'

// Track selected article
const selectedArticle = ref(null)

// ✅ Article data
const articles = [
  {
    id: 'latest',
    title: 'Latest News Headline',
    summary: 'This is a short summary of the latest news article. It gives an overview of what the article is about and encourages users to read more.',
    full: 'Here’s the full article content for the latest news. You can include more detailed text, background info, quotes, or related updates about the story.',
    image: newscat1,
    isFeatured: true
  },
  {
    id: 'older1',
    title: 'Older News Title',
    summary: 'A brief description of this older news article, providing a quick look into the topic covered.',
    full: 'This is the extended version of the older news article. You can provide more context or related updates here.',
    image: newscat2,
    isFeatured: false
  },
  {
    id: 'older2',
    title: 'Another News Title',
    summary: 'Another short summary of a different news article. The image fits nicely within this post and is centered.',
    full: 'This is more detail about the second older news article. Add further information or links here.',
    image: newscat3,
    isFeatured: false
  }
]

// Functions to handle navigation
function openArticle(article) {
  selectedArticle.value = article
}
function goBack() {
  selectedArticle.value = null
}
</script>

<template>
  <Navbar>
    <template v-slot:navbar-title>
      Report
    </template>
  </Navbar>

  <div class="container my-5 news-layout">

    <iframe width="800" height="1000" src="https://rss.app/embed/v1/feed/t5NpsAOuQiydgeJJ" frameborder="0"></iframe>
  

    <!-- Right: Sidebar for reporting -->
    <aside class="sidebar">
      <h4 class="mb-3">Create a Cat Report</h4>
      <form class="report-form">
        <div class="mb-3">
          <label class="form-label">Cat Name</label>
          <input type="text" class="form-control" placeholder="Enter cat name" />
        </div>
        <div class="mb-3">
          <label class="form-label">Location</label>
          <input type="text" class="form-control" placeholder="Where was the cat found?" />
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea class="form-control" rows="3" placeholder="Describe the cat's condition..."></textarea>
        </div>
        <button class="btn btn-dark w-100">Submit Report</button>
      </form>
    </aside>
  </div>

  <BottomFooter />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

.news-layout {
  display: flex;
  gap: 2rem;
}

/* Left: main content */
.news-container {
  flex: 3;
  font-family: "Nunito", sans-serif;
}

/* Right: sidebar */
.sidebar {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: "Nunito", sans-serif;
}

.report-form input,
.report-form textarea {
  font-size: 0.95rem;
}

/* --- Latest News Section --- */
.latest-news img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.latest-news .news-title {
  font-weight: 700;
}

.latest-news .news-summary {
  font-size: 1rem;
  color: #555;
}

/* --- Older News Section --- */
.news-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.news-image {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  object-fit: cover;
}

.news-text {
  text-align: left;
}

.news-title {
  font-weight: 700;
}

.news-summary {
  font-size: 0.95rem;
  color: #666;
}

.news-full {
  font-size: 1rem;
  color: #444;
  line-height: 1.6;
}

/* --- Responsive Fixes (SMALL screens only) --- */
@media (max-width: 768px) {
  .news-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar {
    margin-top: 0.8rem;
    padding: 1rem;
  }

  .latest-news {
    flex-direction: column;
  }

  .latest-news .col-md-6 {
    text-align: center;
  }

  .latest-news .btn {
    margin-top: 1rem;
    margin-bottom: 1.2rem;
  }

  .older-news {
    margin-bottom: 0.3rem;
  }
}
</style>
