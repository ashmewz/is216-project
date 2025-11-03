<template>
  <div class="cursor-overlay" ref="cursorOverlay"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
// import p5 from 'p5'

const cursorOverlay = ref(null)
let sketchInstance = null

onMounted(() => {
  sketchInstance = new p5((p) => {
    const paws = []
    let prevPawLeft = false
    const mouse = { prev: { x: 0, y: 0 }, dist: 0 }

    p.setup = () => {
      const canvas = p.createCanvas(window.innerWidth, window.innerHeight)
      canvas.parent(cursorOverlay.value)
      p.noStroke()
    }

    p.draw = () => {
      p.clear()
      paws.forEach((paw, index) => {
        paw.update(index, paws)
        paw.display(p)
      })
    }

    const pawDraw = () => {
      if (p.mouseX >= 0 && p.mouseY >= 0 && p.mouseX <= p.width && p.mouseY <= p.height) {
        const dx = Math.abs(p.mouseX - p.pmouseX)
        const dy = Math.abs(p.mouseY - p.pmouseY)
        if (mouse.dist > 25) {
          prevPawLeft = !prevPawLeft
          const angle = Math.atan2(
            p.mouseY - (mouse.prev.y || p.pmouseY),
            p.mouseX - (mouse.prev.x || p.pmouseX)
          )
          paws.push(new Paw(p.mouseX, p.mouseY, (angle * 180) / Math.PI, prevPawLeft))
          mouse.dist = 0
          mouse.prev = { x: p.mouseX, y: p.mouseY }
        } else {
          mouse.dist += dx + dy
        }
      } else {
        mouse.prev = { x: 0, y: 0 }
      }
    }

    p.mouseMoved = pawDraw
    p.touchMoved = pawDraw

    class Paw {
      constructor(x, y, angle, left) {
        this.x = x
        this.y = y
        this.alpha = 255
        this.size = 10       // larger paw
        this.left = left
        this.angle = angle + 90
      }
      update(index, paws) {
        this.alpha -= (paws.length - index) * 0.1
        if (this.alpha <= 0) paws.splice(index, 1)
      }
      display(p) {
        p.push()
        p.fill(0, 0, 0, this.alpha) // paw color
        const offset = this.left ? this.size : -this.size
        p.translate(this.x - this.size / 2, this.y - this.size / 2)
        p.rotate(this.angle * (Math.PI / 180))
        p.translate(offset * 1.5, 0)
        pawShape(p, this.size)
        p.pop()
      }
    }

    const pawShape = (p, size) => {
      const center = size / 2
      p.ellipse(size / 2, center, size * 0.9, size * 0.7)
      p.ellipse(0, 0, size * 0.5, size * 0.5)
      p.ellipse(center, -size * 0.2, size * 0.5, size * 0.5)
      p.ellipse(size, 0, size * 0.5, size * 0.5)
    }

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight)
    }

  })
})

onBeforeUnmount(() => {
  if (sketchInstance) sketchInstance.remove()
})
</script>

<style scoped>
.cursor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;        /* full width */
  height: 100vh;       /* full height */
  pointer-events: none; /* allows clicks to pass through */
  z-index: 9999;       /* on top of everything */
}
</style>
