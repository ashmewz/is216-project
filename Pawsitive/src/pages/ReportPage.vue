<script setup>
import Navbar from '@/components/resuables/Navbar.vue';
import BottomFooter from '@/components/resuables/BottomFooter.vue';
</script>

<template>
  <Navbar>
    <template v-slot:navbar-title>
      Report
    </template>
  </Navbar>

  <div class="container my-5 news-container">
    <!-- Search Bar -->
    <div class="mb-4">
      <input
        type="text"
        class="form-control"
        placeholder="Search news..."
      />
    </div>

    <!-- Latest News Section -->
    <div class="latest-news row align-items-center mb-5">
      <div class="col-md-6">
        <h2 class="news-title">Latest News Headline</h2>
        <p class="news-summary">
          This is a short summary of the latest news article. It gives an overview of what the article is about and
          encourages users to read more.
        </p>
        <button class="btn btn-dark">Read More</button>
      </div>
      <div class="col-md-6 text-center">
        <img
          src="@/assets/newscat1.jpg"
          alt="Latest News"
          class="img-fluid rounded shadow-sm"
        />
      </div>
    </div>

    <!-- Older News Section -->
    <div class="older-news">
      <!-- Example of one older post -->
      <div class="news-card text-start mb-5">
        <img
          src="@/assets/newscat2.jpg"
          alt="News 1"
          class="img-fluid news-image rounded shadow-sm"
        />
        <div class="news-text mt-3">
          <h4 class="news-title">Older News Title</h4>
          <p class="news-summary">
            A brief description of this older news article, providing a quick look into the topic covered.
          </p>
          <button class="btn btn-outline-dark">Read More</button>
        </div>
      </div>

      <!-- Another older post -->
      <div class="news-card text-start mb-5">
        <img
          src="@/assets/newscat3.jpg"
          alt="News 2"
          class="img-fluid news-image rounded shadow-sm"
        />
        <div class="news-text mt-3">
          <h4 class="news-title">Another News Title</h4>
          <p class="news-summary">
            Another short summary of a different news article. The image fits nicely within this post and is centered.
          </p>
          <button class="btn btn-outline-dark">Read More</button>
        </div>
      </div>
    </div>
  </div>

  <BottomFooter />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

.news-container {
  font-family: "Nunito", sans-serif;
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

<<<<<<< Updated upstream
=======
/* Add space below Read More button on mobile */
@media (max-width: 768px) {
  .latest-news .btn,
  .news-card .btn {
    margin-bottom: 2rem;
  }
}

>>>>>>> Stashed changes
/* --- Older News Section --- */
.news-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.news-image {
  width: 100%;
  max-width: 100%;
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

/* Responsive */
@media (max-width: 768px) {
  .latest-news {
    flex-direction: column;
  }

  .latest-news .col-md-6 {
    text-align: center;
  }

  .latest-news .news-title {
    margin-top: 1rem;
  }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
}
</style>
