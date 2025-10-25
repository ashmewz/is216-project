import { defineStore } from 'pinia'

export const useCatStore = defineStore('cat', {
  state: () => ({
    imageData: null,
    breedData: null
  }),
  actions: {
    setCatData(image, breed) {
      this.imageData = image
      this.breedData = breed
    },
    clearCatData() {
      this.imageData = null
      this.breedData = null
    }
  }
})
