<template>
  <div id="app">
    <SuggestInput />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SuggestInput from './components/SuggestInput.vue'
export default defineComponent({
  name: 'App',
  components: {
    SuggestInput,
  },
});
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>