<template>
  <v-app id="deepbnb-app">
    <v-app-bar app color="shade" elevation="1" height="80">
      <v-container class="d-flex justify-start">
        <v-img src="/deepbnb-logo.svg" max-width="130" contain />

        <v-spacer></v-spacer>
        <div>
          <v-btn text class="text-subtitle-1 text--secondary" to="/models">Models</v-btn>
          <v-btn text class="text-subtitle-1 text--secondary" to="/dataset">Dataset</v-btn>
          <v-btn text class="text-subtitle-1" color="red" @click="logout">Logout</v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <v-main class="shade">
      <v-container class="my-12">
        <v-row justify="center">
          <v-col cols="12" sm="11" lg="10">
            <nuxt></nuxt>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      search: '',
      links: ['Dashboard'],
    }
  },
  methods: {
    async logout() {
      await this.$auth.logout()
      await this.$router.push('/')
    },
  },
}
</script>

<style>
/* width */
::-webkit-scrollbar {
  width: 6px;
  height: 4px;
}

/* Track */
::-webkit-scrollbar-track {
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #bdc2c9;
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #9ba2ab;
}
</style>
