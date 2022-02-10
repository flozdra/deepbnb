<template>
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height ma-0">
      <v-col cols="12" md="6" class="justify-center d-flex align-center">
        <div
          style="
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-image: url('/landscape-gradient.png');
          "
          :style="
            $vuetify.breakpoint.smAndDown
              ? 'background-position: top center; background-size: cover;'
              : 'background-position: left center;'
          "
        ></div>
        <div
          style="position: absolute; top: 0; right: 0; bottom: 0; left: 0"
        ></div>
        <div class="d-flex">
          <v-img
            src="/deepbnb-logo.svg"
            :width="$vuetify.breakpoint.smAndDown ? 300 : 430"
            contain
          />
        </div>
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="d-flex align-self-md-center justify-center align-center"
      >
        <Login></Login>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Login from '~/components/Login'

export default {
  name: 'WelcomePage',
  auth: 'guest',
  components: { Login },
  layout: 'empty',
  data() {
    return {}
  },
}
</script>

<style scoped></style>
