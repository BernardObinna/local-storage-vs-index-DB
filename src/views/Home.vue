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

          <h5>Metrics</h5>

          <ul class="">
            <li v-if="indexDBMetrics.getTime !== null">Fetch time: {{ indexDBMetrics.getTime }} Millisecond(s)</li>
            <li v-if="indexDBMetrics.sortTime !== null">Sort time: {{ indexDBMetrics.sortTime }} Millisecond(s)</li>
            <li v-if="indexDBMetrics.addTime !== null">Add time: {{ indexDBMetrics.addTime }} Millisecond(s)</li>
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
      indexDBInitialized: false,
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
        gettingUsersFromFirestore: false,
        gettingUsersFromLS: false,
        gettingUsersFromIDB: false,
        addingRecords: false
      }
    };
  },

  async mounted() {
    // initialize index db
    this.indexDB = await this.initializeIndexDB();
    await this.getRecordsFromIndexDB();
    this.getRecordFromLocalStorage();
    if (!this.indexDBRecord.length || !this.localStorageRecord.length) this.getUsersFromServer();

    // methods below don't need to be called by me again because i've set them up already. check their declarations for their uses
    // this.setUpRealTimeLink();
    // this.populateUsers();
  },

  filters: {
    formatDate(date) {
      return moment(date).format('Do MMMM, YYYY');
    }
  },

  methods: {
    getUsersFromServer(useCache = true) {
      this.connecting.gettingUsersFromFirestore = true;
      const getOptions = { source: useCache ? 'cache' : 'server' };
      db.collection('users').get(getOptions).then(res => {
        // use the cache to get data if it is present
        if (!res.docs.length) {
          this.getUsersFromServer(false);
          return;
        }
        this.users = res.docs.map(doc => {
          return doc.data();
        });
        this.addAllRecordsToLocalStorage();
        this.addAllRecordsToIndexDB();
        this.connecting.gettingUsersFromFirestore = false;
      }).catch(() => {
        this.connecting.gettingUsersFromFirestore = false;
        this.$toastr.e('Couldn\'t get data. Please check your network connection and refresh the page');
      });
    },

    /*

     the method below is for using firebase's websocket to update data in realtime. i'm however not using it due to the large dataset i'm dealing with.
     i'm using caching here to limit the calls to to cloud server because google firestore records reads per field not per request, so this can quickly
     get out of hand when dealing with a large data set like I am here.

     */
    setUpRealTimeLink() {
      db.collection('users').onSnapshot(records => {
        this.users = records.docs.map(record => {
          return record.data();
        });
        this.addAllRecordsToLocalStorage();
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

    addAllRecordsToLocalStorage() {
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
          this.$toastr.e('Error opening db', 'Error');
          reject(e);
        };

        request.onsuccess = e => {
          this.indexDBInitialized = true;
          resolve(e.target.result);
        };

        request.onupgradeneeded = e => {
          const database = e.target.result;
          database.createObjectStore('user_records', { autoIncrement: true, keyPath: 'id' });
          this.indexDBInitialized = true;
        };
      });
    },

    getRecordsFromIndexDB() {
      if (!this.indexDBInitialized) return;
      return new Promise((resolve, reject) => {
        this.connecting.gettingUsersFromIDB = true;

        // fetch
        const fetchStartTime = moment();
        const transaction = this.indexDB.transaction(['user_records'], 'readonly');
        const store = transaction.objectStore('user_records');
        const indexDBRecord = [];

        transaction.oncomplete = async e => {
          this.indexDBRecord = indexDBRecord;
          const fetchFinishTime = moment();
          this.connecting.gettingUsersFromIDB = false;
          this.indexDBMetrics.getTime = fetchFinishTime.diff(fetchStartTime);
          await this.sortIndexDB();
          resolve();
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

    sortIndexDB() {
      if (!this.indexDBInitialized) return;
      return new Promise((resolve, reject) => {
        const sortStartTime = moment();
        const transaction = this.indexDB.transaction(['user_records'], 'readonly');
        const store = transaction.objectStore('user_records');
        const indexDBRecord = [];
        const cursorRequest = store.openCursor(null, 'prev');

        cursorRequest.onsuccess = e => {
          const cursor = e.target.result;
          if (cursor) {
            indexDBRecord.push(cursor.value);
            cursor.continue();
          }
        };

        transaction.oncomplete = e => {
          this.indexDBRecord = indexDBRecord;
          const sortFinishTime = moment();
          this.connecting.gettingUsersFromIDB = false;
          this.indexDBMetrics.sortTime = sortFinishTime.diff(sortStartTime);
          resolve();
        };
      });
    },

    addAllRecordsToIndexDB() {
      if (!this.indexDBInitialized) return;
      this.users.forEach(async user => {
        await this.addSingleUserToIndexDB(user);
      });
    },

    addSingleUserToIndexDB(user) {
      if (!this.indexDBInitialized) return;
      return new Promise((resolve, reject) => {
        const addStartTime = moment();
        const trans = this.indexDB.transaction(['user_records'], 'readwrite');
        const store = trans.objectStore('user_records');
        store.add(user);

        trans.oncomplete = e => {
          const addFinishTime = moment();
          this.indexDBMetrics.addTime = addFinishTime.diff(addStartTime);
          this.indexDBRecord.push(user);
          resolve();
        };
      });
    },

    // this is for populating the sample set. It's already populated so this does not need to be called again
    populateUsers() {
      this.connecting.addingRecords = true;
      const batch = db.batch();
      // for (let i = 0; i < 500; i++) {
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
        this.addAllRecordsToLocalStorage();
        this.addAllRecordsToIndexDB();
        this.$toastr.s('Data uploaded', 'SUCCESS');
      }).catch(() => {
        this.connecting.addingRecords = false;
        this.$toastr.e('Couldn\'t upload data. Please check your network connection and refresh the page');
      });
    }
  }
};
</script>
