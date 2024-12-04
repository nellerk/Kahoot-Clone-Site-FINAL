<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div
      class="absolute top-4 right-4 bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold"
    >
      Pontok: {{ totalPoints }}
    </div>
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 class="text-center text-2xl font-semibold mb-4">
        {{ category }} Quiz
      </h1>

      <!-- Haladási sáv -->
      <div
        v-if="currentQuestionIndex < questions.length"
        class="progress-container mb-4"
      >
        <progress
          :value="currentQuestionIndex + 1"
          :max="questions.length"
        ></progress>
        <p class="text-center text-sm text-gray-600">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }} kérdés
        </p>
      </div>

      <div v-if="currentQuestionIndex < questions.length">
        <p class="text-lg text-gray-700 mb-6">{{ currentQuestion.text }}</p>

        <!-- Kérdés pontszáma -->
        <p class="question-info text-center font-semibold mb-4">
          Ez a kérdés {{ currentQuestion.maxPoints }} pontot ér.
        </p>

        <!-- Kép megjelenítése, ha van -->
        <div v-if="currentQuestion.imageUrl" class="mb-6">
          <img
            :src="`${currentQuestion.imageUrl}`"
            alt="Question image"
            class="w-full h-auto rounded-lg shadow-sm"
          />
        </div>

        <!-- Válaszok listája -->
        <ul class="space-y-4">
          <li v-for="(answerText, key) in currentQuestion.answers" :key="key">
            <button
              @click="selectAnswer(key)"
              :disabled="showCorrectAnswer"
              :class="getAnswerClass(key)"
              class="w-full py-3 px-4 rounded-lg text-left font-medium transition-colors duration-150 whitespace-normal break-words min-h-[50px] max-h-[150px] overflow-y-auto"
            >
              {{ answerText }}
            </button>
          </li>
        </ul>

        <button
          v-if="selectedAnswers.length > 0 && !showCorrectAnswer"
          @click="revealCorrectAnswer"
          class="mt-6 w-full py-3 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-150"
        >
          Következő kérdés
        </button>
        <button
          @click="cancelQuiz"
          class="mt-6 w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-150"
        >
          Kérdéssor megszakítása
        </button>
      </div>

      <!-- Eredmény megjelenítése -->
      <div v-else class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Eredmény</h2>
        <p class="text-lg text-gray-700 mb-6">
          Helyes válaszok száma: {{ score }} / {{ questions.length }}
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Összes pontszám: {{ totalPoints }}
        </p>

        <!-- Visszajelzés a kérdésekről -->
        <div
          v-for="(question, index) in questions"
          :key="index"
          class="mb-4 text-left"
        >
          <p class="font-semibold">{{ index + 1 }}. {{ question.text }}</p>
          <ul class="ml-4 mt-2">
            <li
              v-for="(answer, i) in question.answers"
              :key="i"
              :class="{
                'text-green-600 font-semibold':
                  question.correctAnswers.includes(i) &&
                  userAnswers[index]?.includes(i),
                'text-yellow-500 font-semibold':
                  question.correctAnswers.includes(i) &&
                  !userAnswers[index]?.includes(i),
                'text-red-500 font-semibold':
                  !question.correctAnswers.includes(i) &&
                  userAnswers[index]?.includes(i),
                'text-gray-700':
                  !userAnswers[index]?.includes(i) &&
                  !question.correctAnswers.includes(i),
              }"
              class="ml-2"
            >
              {{ answer }}
            </li>
          </ul>
        </div>

        <button
          @click="restartQuiz"
          class="mt-6 w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-150"
        >
          Vissza a kategóriákhoz
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    props: ['year', 'category'],
    data() {
      return {
        userId: parseInt(localStorage.getItem("userId"), 10) || undefined, // Biztosítsd, hogy a userId mindig elérhető legyen
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswers: [],
        score: 0,
        totalPoints: 0, // Total points tracker
        userAnswers: [],
        showCorrectAnswer: false,
        //apiBaseUrl: 'http://localhost:5136/api', // Local API URL
        apiBaseUrl: 'https://szakmasztarapi.runasp.net/api', // Published API URL
        isAnswerConfirmed: false // Prevent multiple scoring
      };
    },
    computed: {
      currentQuestion() {
        return this.questions[this.currentQuestionIndex];
      },
      isLastQuestion() {
        return this.currentQuestionIndex === this.questions.length - 1;
      }
    },
    methods: {
      async fetchQuestions() {
        try {
          const response = await axios.get(
            `${this.apiBaseUrl}/questions/year/${this.year}/category/${this.category}`
          );
          this.questions = response.data;
        } catch (error) {
          console.error('Error fetching questions:', error);
        }
      },
      selectAnswer(key) {
      const correctAnswerLimit = this.currentQuestion.correctAnswers.length; // Determine the limit

      if (correctAnswerLimit === 1) {
        // For single correct answer, allow free switching
        this.selectedAnswers = [key]; // Replace the selection with the new one
      } else {
        // For multiple correct answers, enforce the selection limit
        if (this.selectedAnswers.includes(key)) {
          // Deselect the answer if already selected
          this.selectedAnswers = this.selectedAnswers.filter(i => i !== key);
        } else if (this.selectedAnswers.length < correctAnswerLimit) {
          // Allow selection only if the limit is not reached
          this.selectedAnswers.push(key);
        } else {
          alert(`You can select up to ${correctAnswerLimit} answers.`);
        }
      }
    },
    revealCorrectAnswer() {
      const correctAnswers = this.currentQuestion.correctAnswers; // A helyes válaszok
      const maxPoints = this.currentQuestion.maxPoints; // Az adott kérdés maximális pontszáma
      const numCorrectAnswers = correctAnswers.length; // A helyes válaszok száma
      const correctSelections = this.selectedAnswers.filter(answer => correctAnswers.includes(answer)).length; // Helyesen kiválasztott válaszok száma

      let points = 0;

      if (correctSelections === numCorrectAnswers) {
        // Ha minden helyes választ eltalált
        points = maxPoints; // Maximális pontot kap
      } else if (correctSelections > 0) {
        // Ha legalább egy helyes választ eltalált
        points = Math.floor((correctSelections / numCorrectAnswers) * maxPoints); // Arányos pontozás
      }

      this.totalPoints += points; // Hozzáadja az összesített pontszámhoz
      if (correctSelections === numCorrectAnswers) this.score++; // Növeli a helyesen megválaszolt kérdések számát, ha minden helyes választ eltalált

      this.showCorrectAnswer = true;

      // Továbblépés a következő kérdésre 1,5 másodperc után
      setTimeout(this.nextQuestion, 1500);
    },
    nextQuestion() {
      this.userAnswers.push([...this.selectedAnswers]); // Save user selections
      this.selectedAnswers = []; // Reset selections for the next question
      this.currentQuestionIndex++;
      this.showCorrectAnswer = false;
    },
    getAnswerClass(key) {
      if (!this.showCorrectAnswer) {
        return this.selectedAnswers.includes(key)
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-blue-100';
      }

      if (this.currentQuestion.correctAnswers.includes(key) && !this.selectedAnswers.includes(key)) {
        return 'bg-yellow-400 text-black'; // Highlight unselected correct answers in yellow
      }

      if (this.currentQuestion.correctAnswers.includes(key) && this.selectedAnswers.includes(key)) {
        return 'bg-green-500 text-white'; // Highlight selected correct answers in green
      }

      if (!this.currentQuestion.correctAnswers.includes(key) && this.selectedAnswers.includes(key)) {
        return 'bg-red-500 text-white'; // Highlight incorrect answers in red
      }

      return 'bg-gray-200 text-gray-700 hover:bg-blue-100';
    },
    cancelQuiz() {
      this.$router.push({
        path: `/categories/${this.year}`,
        query: { userId: this.userId },
      });
    },
    async saveScore() {
  if (!this.userId) {
    console.error('Hiba: Nincs userId, nem lehet pontszámot menteni.');
    return;
  }

  // Pontszám konzolra írása mentés előtt
  console.log(`Mentésre kerülő pontszám: ${this.totalPoints}`);

  try {
    const response = await axios.post(`${this.apiBaseUrl}/scores`, {
      userId: this.userId, // Felhasználó ID
      year: this.year, // Év
      category: this.category, // Kategória
      points: this.totalPoints, // Pontszám
    });

    // Sikeres mentés után kiírja az ID-t és a pontszámot
    console.log(`A(z) ${this.userId} - ${this.totalPoints} - al adta be a feladatot.`);
    console.log('Pontszám mentve:', response.data);
  } catch (error) {
    console.error('Hiba a pontszám mentésekor:', error);
  }
},

restartQuiz() {
  if (!this.userId) {
    this.userId = parseInt(localStorage.getItem("userId"), 10); // Újratöltés szükség esetén
  }

  this.$emit('quizEnded'); // Kibocsátja az eseményt, ha a szülő komponens hallgat rá

  // Pontok mentése az adatbázisba
  this.saveScore();

  // Alapértelmezett értékek visszaállítása
 // Késleltetés 2 másodpercig
 setTimeout(() => {
    // Alapértelmezett értékek visszaállítása
    this.currentQuestionIndex = 0; 
    this.selectedAnswers = []; 
    this.score = 0; 
    this.userAnswers = []; 
    this.showCorrectAnswer = false; 
    
    // Kategória oldalra ugrás és újratöltés
    this.$router.push(`/categories/${this.year}`).then(() => {
      window.location.reload(); // Az oldal újratöltése
    });

    console.log("Újratöltés megtörtént 2 másodperc után.");
  }, 2000); // 2 másodperces késleltetés
},
    mounted() {
      if (!this.userId) {
        this.userId = parseInt(localStorage.getItem("userId"), 10); // Töltse be újra a localStorage-ből
      }
      console.log('Quiz.vue userId:', this.userId);
      console.log('Quiz.vue year:', this.year);
      console.log('Quiz.vue category:', this.category);
      this.fetchQuestions();
    }
  }
}
</script>

<style>
.absolute {
  position: absolute;
}
.top-4 {
  top: 1rem;
}
.right-4 {
  right: 1rem;
}
.bg-gray-200 {
  background-color: #e2e8f0;
}
.text-gray-700 {
  color: #4a5568;
}
.rounded-lg {
  border-radius: 0.5rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.font-semibold {
  font-weight: 600;
}

.bg-yellow-400 {
  background-color: #f6e05e; /* Yellow */
}
.text-black {
  color: #000000; /* Black text for better contrast */
}

.progress-container {
  width: 100%;
  margin-bottom: 20px;
}

progress {
  width: 100%;
  height: 20px;
}

.question-info {
  text-align: center;
  font-weight: bold;
}
</style>
