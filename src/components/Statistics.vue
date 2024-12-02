<template>
    <div class="flex flex-col items-center">
        <button
            @click="goBackToCategories"
            class="absolute top-4 left-4 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-150"
        >
            Vissza a kategóriákhoz
        </button>

        <!-- Bejelentkezett felhasználó neve -->
        <div class="absolute top-4 right-4 text-lg font-semibold text-gray-800">
        Jelenleg bejelentkezve: {{ loggedInUser }}
        </div>

      <h1 class="text-2xl font-semibold mb-4">Statisztika - {{ year }}</h1>
      <table class="w-full max-w-4xl border-collapse border border-gray-300">
        <thead>
          <tr>
            <th class="border border-gray-300 p-2">Felhasználó</th>
            <th class="border border-gray-300 p-2">Információtechnológiai Alapok</th>
            <th class="border border-gray-300 p-2">Hálózatok</th>
            <th class="border border-gray-300 p-2">Programozás és Adatbázis Kezelés</th>
            <th class="border border-gray-300 p-2">Szoftverfejlesztés és Webfejlesztés</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userScores" :key="user.id">
            <td class="border border-gray-300 p-2">{{ user.userName }}</td>
            <td class="border border-gray-300 p-2">{{ user.scores['Információtechnológiai Alapok'] || 'nincs adat' }}</td>
            <td class="border border-gray-300 p-2">{{ user.scores['Hálózatok'] || 'nincs adat' }}</td>
            <td class="border border-gray-300 p-2">{{ user.scores['Programozás és Adatbázis Kezelés'] || 'nincs adat' }}</td>
            <td class="border border-gray-300 p-2">{{ user.scores['Szoftverfejlesztés és Webfejlesztés'] || 'nincs adat' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    props: ["year"],
    data() {
      return {
        userScores: [],
        apiBaseUrl: "http://localhost:5136/api", // API URL
        loggedInUser: "Betöltés alatt..." // Kezdeti érték a felhasználó nevének
      };
    },
    methods: {
    async fetchStatistics() {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/scores/year/${this.year}/statistics`);
        this.userScores = response.data;
      } catch (error) {
        console.error("Hiba a statisztikák betöltésekor:", error);
      }
    },
    goBackToCategories() {
      this.$router.push({ path: `/categories/${this.year}`, query: { userId: this.$route.query.userId } });
    },
  },
  mounted() {
        // Betöltjük a statisztikákat
        this.fetchStatistics();

        // Beállítjuk a bejelentkezett felhasználó nevét
        const userId = parseInt(this.$route.query.userId) || parseInt(localStorage.getItem("userId"), 10);
        if (userId) {
            axios.get(`${this.apiBaseUrl}/users/${userId}`)
            .then(response => {
                this.loggedInUser = response.data.name; // A felhasználó neve beállítva
            })
            .catch(error => {
                console.error("Hiba a felhasználó betöltésekor:", error);
                this.loggedInUser = "Hiba történt"; // Hiba esetén visszajelzés
            });
        } else {
            this.loggedInUser = "Ismeretlen felhasználó";
        }
    },
};
  </script>
  