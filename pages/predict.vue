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
    <v-row>
      <v-col cols="12" class="text-h5 font-weight-medium">Try an estimate</v-col>
    </v-row>
    <v-form>
      <v-row>
        <v-col
          v-for="(field, i) of Object.keys(place)"
          :key="i"
          :cols="typeof place[field] === 'string' ? 12 : 4"
          class="align-center"
        >
          <v-text-field
            v-if="typeof place[field] === 'number' || Number.isInteger(place[field])"
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
          <v-switch
            v-else-if="typeof place[field] === 'boolean'"
            v-model="place[field]"
            dense
            hide-details
            class="mt-1"
          >
            <template #label>
              <span class="text-truncate">{{ sentenceCase(field) }}</span>
            </template>
          </v-switch>
        </v-col>
      </v-row>
      <v-row class="mt-6">
        <v-col>
          <v-btn color="primary" @click="predict">Estimate</v-btn>
        </v-col>
      </v-row>
    </v-form>
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
      place: {
        'title': '',
        'description': '',
        // latitude: 40,
        // longitude: 5,
        'max_people_count': 0,
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
        console.log(response)
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
