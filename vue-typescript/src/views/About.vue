<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="clickThis">clickME</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      testLog: 'dfad',
    };
  },
  methods: {
    clickThis(): void {
      console.log(this.testLog);
    },
  }
});
</script>
