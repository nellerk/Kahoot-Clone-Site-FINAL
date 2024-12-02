<template>
  <div id="app">
    <!-- Router View: Dinamikus oldalváltás -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
/* Egyszerű globális stílusok */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}
</style>
