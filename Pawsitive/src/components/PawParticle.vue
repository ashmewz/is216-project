<template>
  <div class="paw" :style="style">
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="40" r="16" fill="#1b1b1f"/>
      <circle cx="15" cy="23" r="7" fill="#1b1b1f"/>
      <circle cx="32" cy="18" r="7" fill="#1b1b1f"/>
      <circle cx="49" cy="23" r="7" fill="#1b1b1f"/>
      <circle cx="24" cy="28" r="6" fill="#1b1b1f" opacity=".9"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const style = ref({})
let animationId = null

const random = (min, max) => Math.random() * (max - min) + min

onMounted(() => {
  const w = window.innerWidth
  const h = window.innerHeight
  const startX = random(0, w)
  const startY = h + 40 + random(0, 60)
  const driftX = random(-80, 80)
  const travelY = h + 160
  const time = 12000 + random(0, 9000)
  const startRot = random(0, 360)
  const rotDir = Math.random() > 0.5 ? 1 : -1
  const startTime = performance.now()

  const animate = (t) => {
    const p = Math.min(1, (t - startTime) / time)
    const x = startX + driftX * p
    const y = startY - travelY * p
    const rot = startRot + rotDir * p * 180
    style.value = {
      transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
      opacity: (0.25 * (1 - p)).toFixed(3)
    }

    if (p < 1) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.paw {
  position: fixed;
  top: 0;
  left: 0;
  width: 28px;
  height: 28px;
  pointer-events: none;
  opacity: 0.22;
  transform: translate(-50%, -50%);
}
.paw svg {
  width: 100%;
  height: 100%;
}
</style>