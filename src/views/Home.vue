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
            <li>Easy and straightforward to work with</li>
          </ul>

          <h5>Cons</h5>
          <ul class="">
            <li>It can only contain a small amount of data</li>
            <li>It can only store strings as key value pairs</li>
          </ul>

          <h5>Metrics</h5>

          <ul class="">
            <li v-if="localStorageMetrics.getTime !== null">Fetch time: {{ localStorageMetrics.getTime }} Millisecond(s)</li>
            <li v-if="localStorageMetrics.sortTime !== null">Sort time: {{ localStorageMetrics.sortTime }} Millisecond(s)</li>
            <li v-if="localStorageMetrics.addTime !== null">Add time: {{ localStorageMetrics.addTime }} Millisecond(s)</li>
          </ul>
        </div>

        <div class="col-lg-6">
          <h3>Index DB</h3>

          <h5>Pros</h5>
          <ul class="">
            <li>Allows fast indexing and searching of objects, so you can manage your data and read/write it fast.</li>
            <li>It allow for storage of large amounts of data</li>
            <li>It allow for storage of various data objects including files</li>
          </ul>

          <h5>Cons</h5>
          <ul class="">
            <li>It is complex to work with</li>
          </ul>
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
        <template v-if="index < 10">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.dob | formatDate }}</td>
          <td>{{ user.address }}</td>
          <td>{{ user.bvn }}</td>
        </template>
      </tr>
      </tbody>
    </table>

    <add-user-modal @submitted="addNewUserLocally($event)"></add-user-modal>
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
      users: [],
      indexDB: null,
      localStorageRecord: [],
      indexDBRecord: [],

      localStorageMetrics: {
        getTime: null,
        sortTime: null,
        addTime: null
      },

      indexDBMetrics: {
        getTime: null,
        sortTime: null,
        addTime: null
      },

      // this if for U.I loaders to show the loading state to the users
      connecting: {
        gettingUsersFromLS: false,
        gettingUsersFromIDB: false,
        addingRecords: false
      }
    };
  },

  async created() {
    this.indexDB = await this.initializeIndexDB();
    this.indexDBRecord = await this.getRecordsFromIndexDB();
  },

  mounted() {
    // this.setUpRealTimeLink();

    // this.populateUsers();
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
        this.addRecordsToLocalStorage();
        this.addAllRecordsToIndexDB();
      });
    },

    addNewUserLocally(user) {
      this.addNewUserToLocalStorage(user);
      this.addSingleUserToIndexDB(user);
    },

    // Local storage

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
        this.localStorageMetrics.getTime = fetchFinishTime.diff(fetchStartTime);
        this.localStorageMetrics.sortTime = sortFinishTime.diff(sortStartTime);
        this.connecting.gettingUsersFromLS = false;
      }
    },

    addRecordsToLocalStorage() {
      localStorage.setItem('woven_user_records', JSON.stringify(this.users));
      this.getRecordFromLocalStorage();
    },

    addNewUserToLocalStorage(user) {
      const addStartTime = moment();
      JSON.parse(localStorage.getItem('woven_user_records')).push(user);
      const addFinishTime = moment();
      this.localStorageMetrics.addTime = addFinishTime.diff(addStartTime);
    },

    // Indexdb
    initializeIndexDB() {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('woven_user_records', 1);

        request.onerror = e => {
          this.$toastr('Error opening db', 'Error');
          reject(e);
        };

        request.onsuccess = e => {
          resolve(e.target.result);
        };

        request.onupgradeneeded = e => {
          const database = e.target.result;
          database.createObjectStore('user_records', { autoIncrement: true, keyPath: 'id' });
        };
      });
    },

    getRecordsFromIndexDB() {
      return new Promise((resolve, reject) => {
        const transaction = this.indexDB.transaction(['user_records'], 'readonly');
        const store = transaction.objectStore('user_records');
        const indexDBRecord = [];

        transaction.oncomplete = e => {
          resolve(indexDBRecord);
        };

        store.openCursor().onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            indexDBRecord.push(cursor.value);
            cursor.continue();
          }
        };
      });
    },

    addAllRecordsToIndexDB() {
      this.users.forEach(async user => {
        await this.addSingleUserToIndexDB(user);
      });
    },

    addSingleUserToIndexDB(user) {
      return new Promise((resolve, reject) => {
        const addStartTime = moment();
        const trans = this.db.transaction(['user_records'], 'readwrite');
        const store = trans.objectStore('user_records');
        store.add(user);

        trans.oncomplete = e => {
          const addFinishTime = moment();
          this.indexDBMetrics.addTime = addFinishTime.diff(addStartTime);
          resolve();
        };
      });
    },

    // this is for populating the sample set
    populateUsers() {
      this.connecting.addingRecords = true;
      const batch = db.batch();
      for (let i = 0; i < 500; i++) {
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
