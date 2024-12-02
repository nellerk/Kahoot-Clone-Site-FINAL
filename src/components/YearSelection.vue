<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-8">Válaszd ki az évet</h1>
    <div class="grid grid-cols-1 gap-6 max-w-sm">
      <button
        v-for="year in years"
        :key="year"
        @click="selectYear(year)"
        class="bg-blue-500 w-full text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-150 text-xl font-medium"
      >
        {{ year }}
      </button>
    </div>
    <button
      @click="logout"
      class="mt-8 w-full max-w-sm py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-150"
    >
      Kijelentkezés
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userId: parseInt(localStorage.getItem("userId"), 10), // Töltsd be az `userId`-t
      years: ["2024", "2023", "2022"], // Évek listája
    };
  },
  methods: {
    selectYear(year) {
      const userId = parseInt(localStorage.getItem("userId"), 10); // Töltsd be a `userId`-t a localStorage-ből
      this.$router.push({ 
        path: `/categories/${year}`,
        query: { userId }, // Adjátok át a `userId`-t query-ként
      }); // Kategóriák oldalra navigál
      console.log('Kiválasztott év:', year); // Ellenőrizd, hogy az év helyes
      console.log('Query userId:', userId); // Ellenőrizd a query-ből érkező userId-t
      console.log("YearSelection userId from localStorage:", localStorage.getItem("userId"));
    },
    logout() {
      this.$router.push('/');
    },
  },
};
</script>
