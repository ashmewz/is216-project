<template>
  <div class="posts-container">
    <div
      v-for="(post, index) in posts"
      :key="post.id"
      class="post mb-4 p-4 border-0 rounded-4 shadow-sm animate-in"
      :style="{ animationDelay: `${index * 0.1}s` }"
    >
      <div class="d-flex justify-content-between align-items-center mb-3">
        <RouterLink
          :to="`/volunteer/profile/${post.author}`"
          class="d-flex align-items-center text-decoration-none text-dark"
          style="cursor: pointer; background-color: transparent;"
        >
          <div class="profile-pic-wrapper">
            <img
              :src="post.avatar || defaultAvatar"
              alt="Profile"
              class="rounded-circle border-2"
            />
          </div>
          <div class="ms-3">
            <span class="fw-bold text-accent d-block">{{ post.author }}</span>
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>{{ post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : '' }}
            </small>
          </div>
        </RouterLink>

        <!-- <button class="btn btn-sm btn-light share-btn rounded-circle" @click="$emit('share', post.id)">
          <i class="bi bi-share-fill"></i>
        </button> -->
      </div>

      <div v-if="post.image" class="post-image-wrapper mb-3">
        <img
          :src="post.image"
          alt="Post image"
          class="post-image rounded-3"
        />
      </div>

      <p class="mb-3 post-caption">
        {{ post.description }}
      </p>

      <div class="d-flex gap-4 align-items-center interaction-bar pt-2 border-top">
        <button class="interaction-btn comment-btn" @click="$emit('open-comments', post.id)">
          <i class="bi bi-chat-dots"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { RouterLink } from 'vue-router'
import defaultAvatar from '@/assets/avatar_placeholder.jpg'

const props = defineProps({
  posts: { type: Array, required: true },
  hasLiked: { type: Function, required: true },
  likeAnimations: { type: Object, required: true }
})

const emit = defineEmits(['toggle-like', 'share', 'open-comments', 'toggle-expand'])
</script>

<style scoped>
.posts-container {
  width: 90%;
  margin: 0;
}

@media (min-width: 768px) {
  .posts-container {
    width: 80%;
  }
}

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

.post-caption {
  line-height: 1.6;
  color: #2f2f2f;
}

.read-more-btn {
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.read-more-btn:hover {
  text-decoration: underline;
  transform: translateX(3px);
}

.interaction-bar {
  padding-top: 0.75rem;
  border-top: 1px solid #f0e8f0 !important;
  display: flex;
  gap: 1rem;
  align-items: center;
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

.empty-state {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  margin: 2rem auto;
  max-width: 500px;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}
</style>
