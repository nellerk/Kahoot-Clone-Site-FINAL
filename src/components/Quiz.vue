<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="absolute top-4 right-4 bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold">
      Pontok: {{ totalPoints }}
    </div>
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full py-3">
      <button
        @click="cancelQuiz"
        class="mt-6 w-full px-4 pb-4 pt-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-150"
      >
        Kérdéssor megszakítása
      </button>
      <h1 class="text-center text-2xl font-semibold mb-4">{{ category }} Quiz</h1>

      <!-- Haladási sáv -->
      <div v-if="currentQuestionIndex < questions.length" class="progress-container mb-4">
        <progress :value="currentQuestionIndex + 1" :max="questions.length"></progress>
        <p class="text-center text-sm text-gray-600">
          {{ currentQuestionIndex + 1 }} / {{ questions.length }} kérdés
        </p>
      </div>

      <div v-if="currentQuestionIndex < questions.length">
        <p class="text-lg text-gray-700 mb-6">{{ currentQuestion.text }}</p>

        <!-- Kérdés pontszáma -->
        <p class="question-info text-center font-semibold mb-4">Ez a kérdés {{ currentQuestion.maxPoints }} pontot ér.</p>

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
          @click="revealCorrectAnswer"
          :disabled="selectedAnswers.length !== currentQuestion.correctAnswers.length || showCorrectAnswer"
          :class="{
            'bg-green-500 text-white': selectedAnswers.length === currentQuestion.correctAnswers.length && !showCorrectAnswer,
            'bg-gray-300 text-gray-500': selectedAnswers.length !== currentQuestion.correctAnswers.length || showCorrectAnswer
          }"
          class="mt-6 w-full py-3 px-4 rounded-lg font-medium transition-colors duration-150"
        >
          Következő kérdés
        </button>
      </div>

      <!-- Eredmény megjelenítése -->
      <div v-else class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Eredmény</h2>
        <p class="text-lg text-gray-700 mb-6">Helyes válaszok száma: {{ score }} / {{ questions.length }}</p>
        <p class="text-lg text-gray-700 mb-6">Összes pontszám: {{ totalPoints }}</p>

        <!-- Visszajelzés a kérdésekről -->
        <div v-for="(question, index) in questions" :key="index" class="mb-4 text-left">
          <p class="font-semibold">{{ index + 1 }}. {{ question.text }}</p>
          <ul class="ml-4 mt-2">
            <li
              v-for="(answer, i) in question.answers" :key="i"
              :class="{
                'text-green-600 font-semibold': question.correctAnswers.includes(i) && userAnswers[index]?.includes(i),
                'text-yellow-500 font-semibold': question.correctAnswers.includes(i) && !userAnswers[index]?.includes(i),
                'text-red-500 font-semibold': !question.correctAnswers.includes(i) && userAnswers[index]?.includes(i),
                'text-gray-700': !userAnswers[index]?.includes(i) && !question.correctAnswers.includes(i)
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
      userId: parseInt(localStorage.getItem("userId"), 10) || undefined,
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: [],
      score: 0,
      totalPoints: 0,
      userAnswers: [],
      showCorrectAnswer: false,
      apiBaseUrl: 'https://szakmasztarapi.runasp.net/api',
      isAnswerConfirmed: false
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] || {};
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
      const correctAnswerLimit = this.currentQuestion.correctAnswers.length;

      if (correctAnswerLimit === 1) {
        this.selectedAnswers = [key];
      } else {
        if (this.selectedAnswers.includes(key)) {
          this.selectedAnswers = this.selectedAnswers.filter(i => i !== key);
        } else if (this.selectedAnswers.length < correctAnswerLimit) {
          this.selectedAnswers.push(key);
        } else {
          alert(`You can select up to ${correctAnswerLimit} answers.`);
        }
      }
    },
    revealCorrectAnswer() {
      const correctAnswers = this.currentQuestion.correctAnswers;
      const maxPoints = this.currentQuestion.maxPoints;
      const numCorrectAnswers = correctAnswers.length;
      const correctSelections = this.selectedAnswers.filter(answer => correctAnswers.includes(answer)).length;

      let points = 0;

      if (correctSelections === numCorrectAnswers) {
        points = maxPoints;
      } else if (correctSelections > 0) {
        points = Math.floor((correctSelections / numCorrectAnswers) * maxPoints);
      }

      this.totalPoints += points;
      if (correctSelections === numCorrectAnswers) this.score++;

      this.showCorrectAnswer = true;
      this.saveScore();
      setTimeout(this.nextQuestion, 1500);
    },
    nextQuestion() {
      this.userAnswers.push([...this.selectedAnswers]);
      this.selectedAnswers = [];
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
        return 'bg-yellow-400 text-black';
      }

      if (this.currentQuestion.correctAnswers.includes(key) && this.selectedAnswers.includes(key)) {
        return 'bg-green-500 text-white';
      }

      if (!this.currentQuestion.correctAnswers.includes(key) && this.selectedAnswers.includes(key)) {
        return 'bg-red-500 text-white';
      }

      return 'bg-gray-200 text-gray-700 hover:bg-blue-100';
    },
    cancelQuiz() {
      if (confirm("Biztosan meg akarod szakítani a kérdéssor kitöltését? Az eddigi válaszok nem lesznek mentve.")) {
        this.$router.push({
          path: `/categories/${this.year}`,
          query: { userId: this.userId },
        });
      }
    },
    async saveScore() {
      if (!this.userId) {
        console.error('Hiba: Nincs userId, nem lehet pontszámot menteni.');
        return;
      }
      try {
        const response = await axios.post(`${this.apiBaseUrl}/scores`, {
          userId: this.userId,
          year: this.year,
          category: this.category,
          points: this.totalPoints,
        });
        console.log('Pontszám mentve:', response.data);
      } catch (error) {
        console.error('Hiba a pontszám mentésekor:', error);
      }
    },
    restartQuiz() {
      if (!this.userId) {
        this.userId = parseInt(localStorage.getItem("userId"), 10);
      }
      this.$emit('quizEnded');
      this.saveScore();
      this.currentQuestionIndex = 0;
      this.selectedAnswers = [];
      this.score = 0;
      this.userAnswers = [];
      this.showCorrectAnswer = false;

      this.$router.push(`/categories/${this.year}`).then(() => {
        window.location.reload();
      });
    }
  },
  mounted() {
    if (!this.userId) {
      this.userId = parseInt(localStorage.getItem("userId"), 10);
    }
    console.log('Quiz.vue userId:', this.userId);
    console.log('Quiz.vue year:', this.year);
    console.log('Quiz.vue category:', this.category);
    this.fetchQuestions();
  }
};
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
  background-color: #f6e05e;
}
.text-black {
  color: #000000;
}
.progress-container {
  width: 100%;
  margin-bottom: 20px;
}
progress {
  width: 100%;
  height: 20px;
  appearance: none;
}
progress::-webkit-progress-bar {
  background-color: #e2e8f0;
  border-radius: 0.5rem;
}
progress::-webkit-progress-value {
  background-color: #4a5568;
  border-radius: 0.5rem;
}
.question-info {
  text-align: center;
  font-weight: bold;
}
button:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}
</style>