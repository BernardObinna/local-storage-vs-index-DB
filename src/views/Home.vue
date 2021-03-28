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

          <h5>Metrics</h5>

          <ul class="">
            <li v-if="localStorageInfo.getTime !== null">Fetch time: {{ localStorageInfo.getTime }} Millisecond(s)</li>
            <li v-if="localStorageInfo.sortTime !== null">Sort time: {{ localStorageInfo.sortTime }} Millisecond(s)</li>
            <li v-if="localStorageInfo.addTime !== null">Add time: {{ localStorageInfo.addTime }} Millisecond(s)</li>
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

    <add-user-modal @submitted="setAddTime($event)"></add-user-modal>
  </div>
</template>

<script>
import moment from 'moment';
import { db, timeStamp } from '@/utils/firebase.js';
import AddUserModal from '@/components/addUserModal';

export default {
  name: 'Home',
  components: { AddUserModal },

  data() {
    return {
      dataExists: false,
      users: [],
      localStorageRecord: [],
      indexDBRecord: [],
      localStorageInfo: {
        getTime: null,
        sortTime: null,
        addTime: null
      },

      connecting: {
        gettingUsers: false,
        gettingUsersFromLS: false,
        gettingUsersFromIDB: false,
        addingRecords: false
      }
    };
  },

  mounted() {
    this.setUpRealTimeLink();
    // if (!localStorage.getItem('woven_user_records')) this.populateUsers();
    // else this.dataExists = true;
    // this.getUsers();
  },

  filters: {
    formatDate(date) {
      return moment(date).format('Do MMMM, YYYY');
    }
  },

  methods: {
    setUpRealTimeLink() {
      db.collection('users').onSnapshot(records => {
        this.users = records.docs.map(record => {
          return record.data();
        });
        this.addRecordToLocalStorage();
      });
    },

    getUsers() {
      if (!this.dataExists) {
        this.connecting.gettingUsers = true;
        // db.collection('users').get().then(res => {
        //   console.log('the doc', res);
        //   this.users = res.docs.map(doc => {
        //     console.log('the doc time', doc.data());
        //     return doc.data();
        //   });
        //
        //   // this.addRecordToLocalStorage();
        //   this.connecting.gettingUsers = false;
        // }).catch(() => {
        //   this.connecting.gettingUsers = false;
        //   this.$toastr.e('Couldn\'t get data. Please check your network connection and refresh the page');
        // });

          // this.addRecordToLocalStorage();
          this.connecting.gettingUsers = false;
        }).catch(() => {
          this.connecting.gettingUsers = false;
          this.$toastr.e('Couldn\'t get data. Please check your network connection and refresh the page');
        });
      } else {
        this.getRecordFromLocalStorage();
      }
    },

    getRecordFromLocalStorage() {
      if (localStorage.getItem('woven_user_records')) {
        this.connecting.gettingUsersFromLS = true;
        // fetch
        const fetchStartTime = moment();
        this.localStorageRecord = JSON.parse(localStorage.getItem('woven_user_records'));
        const fetchFinishTime = moment();

        // sort
        const sortStartTime = moment();
        this.localStorageRecord = this.localStorageRecord.sort((a, b) => (a.timeStamp.nanoseconds > b.timeStamp.nanoseconds) ? 1 : -1);
        const sortFinishTime = moment();

        this.users = this.localStorageRecord;
        this.localStorageInfo.getTime = fetchFinishTime.diff(fetchStartTime);
        this.localStorageInfo.sortTime = sortFinishTime.diff(sortStartTime);
        this.connecting.gettingUsersFromLS = false;
      }
    },

    addRecordToLocalStorage() {
      localStorage.setItem('woven_user_records', JSON.stringify(this.users));
      this.getRecordFromLocalStorage();
    },

    getRecordsFromIndexDB() {
      if (!localStorage.getItem('woven_user_records')) {
        const startTime = moment();
        this.indexDBRecord = JSON.parse(localStorage.getItem('woven_user_records'));
        const finishTime = moment();
        this.localStorageInfo.getTime = startTime.diff(finishTime);
      }
    },

    setAddTime(addTime) {
      this.localStorageInfo.addTime = addTime;
    },

    populateUsers() {
      this.connecting.addingRecords = true;
      const batch = db.batch();
      for (let i = 0; i < 1; i++) {
        const user = {
          timeStamp,
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
