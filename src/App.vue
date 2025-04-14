<template>
  <div id="app">
    <LayoutMain v-if="!isLoginPage" />
    <router-view v-else />
  </div>
</template>

<script>
import LayoutMain from "./layout/LayoutMain.vue";

export default {
  name: "App",
  components: { LayoutMain },
  computed: {
    isLoginPage() {
      return this.$route.path === '/'; // 登录页路径
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
