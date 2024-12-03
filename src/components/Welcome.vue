<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 class="text-center text-2xl font-semibold mb-4">
        Üdvözöljük a Szakmasztár gyakorlófelületén!
      </h1>
      <div>
        <label for="username" class="block text-lg text-gray-700 mb-2">Adja meg a nevét:</label>
        <input
          id="username"
          type="text"
          v-model="username"
          placeholder="Vezetéknév Keresztnév"
          class="w-full py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          @click="submit"
          class="mt-6 w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-150"
        >
          Tovább
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '', // A felhasználó neve
      //apiBaseUrl: 'http://localhost:5136/api', // Local API URL
      apiBaseUrl: 'https://szakmasztarapi.runasp.net/api' // Published API URL
    };
  },
  methods: {
    async submit() {
      if (!this.username.trim()) {
        alert('Kérlek, add meg a neved!');
        return;
      }

      try {
        // Validációs kérés a szerverhez
        const validateResponse = await axios.post(`${this.apiBaseUrl}/users/validate`, {
          name: this.username, // JSON formátumban küldjük a felhasználónevet
        });

        if (validateResponse.data.message === "Sikeres bejelentkezés.") {
          console.log('Bejelentkezés sikeres:', validateResponse.data);

          // Tároljuk a felhasználói ID-t a válaszból
          const userId = validateResponse.data.id;
          parseInt(localStorage.setItem('userId', userId)); // Mentés localStorage-be
          console.log('Kapott userId:', userId);

          // Továbbirányítás az évválasztáshoz
          this.$router.push({
            path: '/year-selection',
            query: { userId },
          });
        } else {
          alert('A megadott felhasználónév nem található az adatbázisban. Kérlek, próbáld újra!');
        }
      } catch (error) {
        console.error('Hiba a bejelentkezés során:', error);
        alert('Nem sikerült bejelentkezni. Próbáld újra!');
      }
    },
  },
};

</script>
  
  <style scoped>
  .welcome-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  </style>
  