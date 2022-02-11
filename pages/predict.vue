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
    <v-row class="mb-3">
      <v-col cols="12" class="text-h5 font-weight-medium">Try an estimate</v-col>
    </v-row>
    <v-form :disabled="loading || error">
      <v-row>
        <v-col
          v-for="(field, i) of Object.keys(place)"
          :key="i"
          :cols="
            place[field] === '' || (typeof place[field] === 'string' && isNaN(place[field]))
              ? 12
              : 4
          "
          class="align-center"
        >
          <v-switch
            v-if="typeof place[field] === 'boolean'"
            v-model="place[field]"
            dense
            hide-details
            class="mt-1"
          >
            <template #label>
              <span class="text-truncate">{{ sentenceCase(field) }}</span>
            </template>
          </v-switch>
          <v-text-field
            v-else-if="!isNaN(place[field]) && place[field] !== ''"
            v-model="place[field]"
            type="number"
            :label="sentenceCase(field)"
            outlined
            dense
            hide-details
          ></v-text-field>
          <v-text-field
            v-else-if="typeof place[field] === 'string'"
            v-model="place[field]"
            :label="sentenceCase(field)"
            outlined
            dense
            hide-details
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row class="mt-6">
        <v-col>
          <v-btn color="primary" :loading="loading" @click="predict">Estimate</v-btn>
        </v-col>
      </v-row>
    </v-form>

    <v-row v-if="done" class="mt-6">
      <v-col>
        <p class="text-subtitle-2">
          <span>Estimation for XGBoost :</span>
          <span class="font-weight-bold">
            {{
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                prediction.regression_predicted_price.toFixed(2)
              )
            }}
          </span>
        </p>
        <p class="text-subtitle-2">
          <span>Estimation for Random tree forest :</span>
          <span class="font-weight-bold">
            {{
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                prediction.rf_predicted_price.toFixed(2)
              )
            }}
          </span>
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PredictPage',
  layout: 'default',
  data() {
    return {
      loading: false,
      error: false,
      done: false,
      place: {
        'title': '',
        'description': '',
        // latitude: 40,
        // longitude: 5,
        'max_people_count': '0',
        'bedroom_count': 0,
        'housing_type': 'Maison',
        'property_type': 'Logement entier',
        'kitchen': false,
        'internet': false,
        'television': false,
        'commodities': false,
        'shampooing': false,
        'heating': false,
        'air_conditioning': false,
        'washing_machine': false,
        'dryer': false,
        'parking': false,
        'wifi': false,
        'tv_decoder': false,
        'breakfast': false,
        'pets_allowed': false,
        'for_kids': false,
        'adapted_for_events': false,
        'smoking': false,
        'accessibility': false,
        'elevator': false,
        'fireplace': false,
        'intercom': false,
        'doorman': false,
        'swimming_pool': false,
        'jacuzzi': false,
        'gym': false,
        '24_hours_entry': false,
        'hangers': false,
        'iron': false,
        'hair_dryer': false,
        'workspace': false,
        'smoke_detector': false,
        'carbon_monoxide_detector': false,
        'rescue_kit': false,
        'safety_sheet': false,
        'extinguisher': false,
        'bedroom_lock': false,
        'discount_week': 0,
        'discount_mounth': 0,
        'additional_traveler_cost': false,
        'cleaning_cost': 0,
        'deposit': 0,
        'minimum_stay': 0,
        'cancel_conditions': 'Flexibles',
      },
      prediction: {},
    }
  },
  async fetch() {
    // this.housing = await fetch('http://localhost:3000/mongodb/dataset').then((res) => res.json())
  },
  methods: {
    sentenceCase(t) {
      const text = t.replace(/_/g, ' ')
      return text[0].toUpperCase() + text.substr(1).toLowerCase()
    },
    async predict() {
      this.loading = true
      try {
        const dataPlace = JSON.parse(JSON.stringify(this.place))
        for (const [key, value] of Object.entries(dataPlace)) {
          if (typeof value === 'boolean') {
            dataPlace[key] = value ? 0 : 1
          }
        }

        const response = await this.$axios.post('/mongodb/predict', {
          place: dataPlace,
        })
        this.prediction = response.data
        this.done = true
      } catch (e) {
        console.log(e)
        this.error = true
      }
      this.loading = false
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
.three-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  white-space: normal;
}
</style>
