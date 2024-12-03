<template>
  <div class="flex flex-col items-center">
    <h1 class="text-2xl font-semibold mb-4">- Kategóriák -</h1>
    <div class="grid grid-cols-2 gap-8 w-full max-w-4xl">
      <div v-for="(category, index) in categories" :key="index" class="flex flex-col items-center">
        <button
          @click="selectCategory(category.name)"
          class="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-150"
        >
          {{ category.name }}
        </button>
        <p class="text-gray-700 mt-2">
          Eddigi teljesítmény: <span v-if="scores[category.name]">{{ scores[category.name] }} pont</span>
          <span v-else>nincs adat</span>
        </p>
      </div>
    </div>
    <button
      @click="goBackToYearSelection"
      class="mt-8 py-3 px-6 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-150"
    >
      Vissza az évválasztáshoz
    </button>
    <button
      @click="viewStatistics"
      class="mt-4 py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-150"
    >
      Statisztika
    </button>


    <div class="mt-4 text-lg font-semibold text-gray-800">
      <p class="text-gray-700 mt-4">
        Összteljesítmény: {{ totalScore }}/300 
        <span class="font-bold text-blue-500">
          → Érdemjegy: {{ gradeAndPercentage.grade }} ({{ gradeAndPercentage.percentage }}%)
        </span>
    </p>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["year"],
  data() {
    const userId = parseInt(this.$route.query.userId) || parseInt(localStorage.getItem("userId"), 10);
    return {
      userId, // Query vagy localStorage alapján töltjük be,
      categories: [
        { name: "Információtechnológiai Alapok" },
        { name: "Hálózatok" },
        { name: "Programozás és Adatbázis Kezelés" },
        { name: "Szoftverfejlesztés és Webfejlesztés" },
      ],
      scores: {}, // Objektum a pontszámok tárolására
      //apiBaseUrl: "http://localhost:5136/api", // Local API URL
      apiBaseUrl: 'https://szakmasztarapi.runasp.net/api' // Published API URL
    };
  },
  computed: {
    totalScore() {
      return Object.values(this.scores).reduce((sum, score) => sum + score, 0);
    },
    gradeAndPercentage() {
      const percentage = ((this.totalScore / 300) * 100).toFixed(2); // Százalék két tizedesjegyre kerekítve
      let grade = 1;
      if (percentage >= 60 && percentage < 80) grade = 2;
      if (percentage >= 80 && percentage < 90) grade = 3;
      if (percentage >= 90 && percentage < 95) grade = 4;
      if (percentage >= 95) grade = 5;
      return { grade, percentage };
    }
  },
  methods: {
    async fetchScores() {
      console.log('Fetch scores userId:', this.userId); // Ellenőrizd, hogy a userId helyes
      console.log('Fetch scores year:', this.year); // Ellenőrizd, hogy az év helyes
      console.log("CategorySelection userId from query:", this.$route.query.userId);
      console.log("CategorySelection userId from localStorage:", localStorage.getItem("userId"));

      try {
        const response = await axios.get(
          `${this.apiBaseUrl}/scores/user/${this.userId}/${this.year}`
        );
        const fetchedScores = response.data;

        fetchedScores.forEach((score) => {
          this.scores[score.category] = score.points; // Pontok hozzárendelése a kategóriához
        });
      } catch (error) {
        console.error("Hiba a pontszámok betöltésekor:", error);
      }
    },
    selectCategory(category) {
      this.$router.push({
        path: `/quiz/${this.year}/${category}`,
        query: { userId: this.$route.query.userId },
    });

    },
    goBackToYearSelection() {
      this.$router.push("/year-selection");
    },
    viewStatistics() {
    this.$router.push(`/statistics/${this.year}`);
    }
  },
  mounted() {
    // Inicializáljuk a userId-t a query paraméterekből
    if (!this.userId) {
      this.userId = parseInt(localStorage.getItem("userId"), 10); // Mindig ellenőrizze a localStorage-t
    }
    console.log("Kapott userId:", this.userId); // Ellenőrizd, hogy van-e userId
    this.fetchScores(); // Pontszámok lekérdezése
  },
};
</script>

<style>
.text-lg {
  font-size: 1.125rem;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-800 {
  color: #1f2937;
}
</style>
