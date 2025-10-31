<template>
  <button class="create-btn ">
    <slot>Default Button Text</slot>
  </button>
</template>

<script>
export default {
  name: "Button",
};
</script>

<style scoped>
.create-btn {
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  transition: all 0.3s ease;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;

  background:  #6982B5 ;
  border: 2px solid #6982B5 ;
  color: white;

  box-shadow: 0 4px 12px rgba(128, 110, 131, 0.4);
  cursor: pointer;

  /* Optional fixed position, comment out if you want the button used anywhere */
  /* position: fixed;
  bottom: 20px;
  right: 20px;
  width: auto;
  z-index: 1000; */
}

.create-btn:hover {
  background: #6982B5;
  border-color: #6982B5;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(109, 92, 112, 0.5);
}

</style>
