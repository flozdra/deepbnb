<template>
  <v-container>
    <v-row class="mb-16">
      <v-col class="d-flex justify-center align-center text-h3 font-weight-medium">
        <p>
          <span>{{ 'Welcome to ' }}</span>
          <span class="deepbnb-label">{{ ' deepbnb' }}</span>
        </p>
      </v-col>
    </v-row>
    <v-row v-if="$fetchState.pending || $fetchState.error">
      <v-col class="d-flex justify-center align-center">
        <v-progress-circular
          v-if="$fetchState.pending"
          indeterminate
          size="36"
        ></v-progress-circular>
        <span v-else class="text-h3">An error occurred</span>
      </v-col>
    </v-row>
    <div v-else>
      <v-row v-for="(model, i) of models" :key="i">
        <v-col cols="12" class="text-h5 font-weight-medium pb-0">
          {{ model.name }}
        </v-col>
        <v-col cols="9">
          <v-card class="card-info elevation-0 px-4" outlined>
            <div class="d-flex align-center px-3">
              <v-icon class="mx-3" color="green">mdi-bullseye-arrow</v-icon>
              <div class="d-flex flex-column">
                <span class="text--secondary text-caption">Score</span>
                <span class="font-weight-medium">
                  {{ (model.score * 100).toFixed(2) + '%' }}
                </span>
              </div>
            </div>
            <div class="d-flex align-center px-3">
              <v-icon class="mx-3" color="orange">mdi-currency-eur</v-icon>
              <div class="d-flex flex-column">
                <span class="text--secondary text-caption">Average error</span>
                <span class="font-weight-medium">
                  {{ model.average_error.toFixed(2) + '€' }}
                </span>
              </div>
            </div>
            <div class="d-flex align-center px-3">
              <v-icon class="mx-3" color="error">mdi-close-circle-outline</v-icon>
              <div class="d-flex flex-column">
                <span class="text--secondary text-caption">Error count</span>
                <span class="font-weight-medium">
                  {{ model.error_count }}
                </span>
              </div>
            </div>
            <div class="d-flex align-center px-3">
              <v-icon class="mx-3" color="primary">mdi-head-cog-outline</v-icon>
              <div class="d-flex flex-column">
                <span class="text--secondary text-caption">Train dataset size</span>
                <span class="font-weight-medium">
                  {{ model.test_dataset_size }}
                </span>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="3" class="d-flex flex-column justify-end">
          <v-btn text color="primary" class="my-3">See predictions</v-btn>
          <v-btn color="primary" dark depressed to="/predict">Try an estimate</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'HomePage',
  layout: 'default',
  data() {
    return {
      models: [],
    }
  },
  async fetch() {
    this.models = await fetch('http://localhost:3000/mongodb/models').then((res) => res.json())
  },
  methods: {
    predict() {
      // this.$axios.post('/mongodb/predict')
    },
  },
}
</script>

<style scoped lang="scss">
.deepbnb-label {
  background: #8356f6;
  background: -webkit-linear-gradient(to right, #8356f6 0%, #5419f7 100%);
  background: -moz-linear-gradient(to right, #8356f6 0%, #5419f7 100%);
  background: linear-gradient(to right, #8356f6 0%, #5419f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.card-info {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  .info-section {
    display: flex;
  }
}
</style>
