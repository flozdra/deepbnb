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
      <v-row>
        <v-col cols="12" class="text-h5 font-weight-medium pb-0">Dataset</v-col>
        <v-col v-for="(h, i) of housing.slice(0, housingShowedCount)" cols="6" :key="i">
          <v-card class="elevation-0" outlined>
            <v-card-title class="py-2 text-subtitle-2">
              <span>{{ h.title }}</span>
              <v-spacer></v-spacer>
              <span>
                {{
                  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    h.price
                  )
                }}
              </span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              {{ `${h.max_people_count} guests • ${h.property_type} • ${h.housing_type}` }}
            </v-card-text>
            <v-divider></v-divider>
            <v-card-text class="text-caption text-truncate">
              {{ h.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-center">
          <v-btn text @click="housingShowedCount += 4">Show more</v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
export default {
  name: 'DatasetPage',
  layout: 'default',
  data() {
    return {
      housing: [],
      housingShowedCount: 4,
      models: [
        {
          id: 'rtf',
          name: 'Random tree forest',
          info: {
            score: 82,
            averageError: 12,
            nbError: 84,
            trainSize: 3462,
          },
        },
        {
          id: 'xgb',
          name: 'XGBoost',
          info: {
            score: 85,
            averageError: 9,
            nbError: 94,
            trainSize: 3462,
          },
        },
      ],
    }
  },
  async fetch() {
    this.housing = await fetch('http://localhost:3000/mongodb/housing').then((res) => res.json())
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
.three-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
}
</style>
