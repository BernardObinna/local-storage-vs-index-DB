<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue';
import moment from 'moment'

import db from '@/utils/firebase.js';

export default {
  name: 'Home',
  components: {
    HelloWorld
  },

  data() {
    return {
      users: []
    };
  },

  mounted() {
    // db.collection('users').get().then(res => {
    //   res.docs.forEach(doc => {
    //     console.log(doc.data());
    //
    //   });
    // });
    //

    const batch = db.batch();

    for (let i = 0; i < 1; i++) {
      const user = {
        name: this.$faker().fake('{{name.firstName}} {{name.lastName}}'),
        address: this.$faker().fake('{{address.streetAddress}}, {{address.cityName}} {{address.county}}'),
        bvn: this.$faker().datatype.number({ min: 10000000000, max: 99999999998 }),
        dob: moment(this.$faker().date.past()).format('Do MMMM, YYYY'),
        email: this.$faker().internet.email(),
        phone: this.$faker().fake('0810') + this.$faker().datatype.number({ min: 1000000, max: 9999998 })
      };
      this.users.push(user);
      const refrence = db.collection('users').doc(); // to automatically generate a unique id
      batch.set(refrence, user);
    }

    // batch.commit().then(() => {
    //   this.$toastr.s('Data uploaded');
    // });
  }
};
</script>
