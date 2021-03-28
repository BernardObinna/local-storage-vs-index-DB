<template>
  <div>
    <div class="text-center">
      <h1>Local storage vs Index DB</h1>
      <p>The purpose of this app is simply to weigh the pro's and cons of local storage against index database</p>
    </div>

    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-6">
          <h3>Local storage</h3>

          <h5>Pros</h5>
          <ul class="">
            <li>Fast</li>
          </ul>
        </div>

        <div class="col-lg-6">
          <h3>Index DB</h3>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-between">
      <p>showing 1 to 20 users</p>
      <button class="btn btn--color-primary-blue" data-toggle="modal" data-target="#addUserModal" data-placement="top" title="Add user">New</button>
    </div>
    <table class="table">
      <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Email</th>
        <th scope="col">Phone</th>
        <th scope="col">D.O.B</th>
        <th scope="col">Address</th>
        <th scope="col">BVN</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="(user, index) in users" :key="index">
        <td>{{ user.name }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.phone }}</td>
        <td>{{ user.dob | formatDate }}</td>
        <td>{{ user.address }}</td>
        <td>{{ user.bvn }}</td>
      </tr>
      </tbody>
    </table>

    <add-user-modal></add-user-modal>
  </div>
</template>

<script>
import moment from 'moment';
import db from '@/utils/firebase.js';
import AddUserModal from '@/components/addUserModal';

export default {
  name: 'Home',
  components: { AddUserModal },

  data() {
    return {
      users: [],
      connecting: {
        gettingUsers: false,
        addingRecords: false
      }
    };
  },

  mounted() {
    // this.populateUsers()
    // this.getUsers();
  },

  filters: {
    formatDate(date) {
      return moment(date).format('Do MMMM, YYYY');
    }
  },

  methods: {
    getUsers() {
      this.connecting.gettingUsers = true;
      db.collection('users').get().then(res => {
        this.users = res.docs.map(doc => {
          return doc.data();
        });
      });
    },

    populateUsers() {
      this.connecting.addingRecords = true;
      const batch = db.batch();
      for (let i = 0; i < 1; i++) {
        const user = {
          name: this.$faker().fake('{{name.firstName}} {{name.lastName}}'),
          address: this.$faker().fake('{{address.streetAddress}}, {{address.cityName}} {{address.county}}'),
          bvn: this.$faker().datatype.number({ min: 10000000000, max: 99999999998 }),
          dob: moment(this.$faker().date.past()).format(),
          email: this.$faker().internet.email(),
          phone: this.$faker().fake('0810') + this.$faker().datatype.number({ min: 1000000, max: 9999998 })
        };
        this.users.push(user);
        const refrence = db.collection('users').doc(); // to automatically generate a unique id
        batch.set(refrence, user);
      }

      batch.commit().then(() => {
        this.connecting.addingRecords = false;
        this.$toastr.s('Data uploaded', 'SUCCESS');
      }).catch(() => {
        this.connecting.addingRecords = false;
        this.$toastr.e('Couldn\'t upload data. Please check your network connection and refresh the page');
      });
    }
  }
};
</script>
