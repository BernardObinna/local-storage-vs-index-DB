<template>
  <div class="p-3 p-lg-5">
    <div class="heading">
      <h1>Local storage vs IndexedDB</h1>
      <p>The purpose of this app is simply to weigh the pro's and cons of local storage against indexed database.</p>
      <p>Local storage and IndexedDB are both client-side storage mechanisms that allow for data persistence while offline. However, they both have different ways of going about their business.</p>
    </div>

    <div class="container-fluid body mt-5">
      <div class="row">
        <div class="col-lg-6">
          <h3>Local storage</h3>

          <p>
            This is an API for storing key-value pairs of data within the browser.
            it stores string data as key-value pairs without an expiration date. It can store JSON objects as well, provided it's stringified
            Local storage will be available in the browser to all windows with the same origin (domain).
          </p>

          <h5>Pros</h5>
          <ul class="">
            <li>Easy and straightforward to work with.</li>
            <li>Faster when working with small data sizes.</li>
          </ul>

          <h5>Cons</h5>
          <ul class="">
            <li>It can only contain a small amount of data compared to IndexedDB (about 5MB).</li>
            <li>It can only store strings as key value pairs (JSON objects too if you stringify it).</li>
          </ul>

          <template v-show="!loading">
          <h5>Metrics</h5>

          <ul>
            <li :class="{'text-danger': lsGetsSlower, 'text-success': lsGetsFaster}" v-if="localStorageMetrics.getTime !== null">Fetch time: {{ localStorageMetrics.getTime }} Millisecond(s)</li>
            <li :class="{'text-danger': lsSortSlower, 'text-success': lsSortFaster}" v-if="localStorageMetrics.sortTime !== null">Sort time: {{ localStorageMetrics.sortTime }} Millisecond(s)</li>
            <li :class="{'text-danger': lsAddsSlower, 'text-success': lsAddsFaster}" v-if="localStorageMetrics.addTime !== null">Add time: {{ localStorageMetrics.addTime }} Millisecond(s)</li>
          </ul>
          </template>
        </div>

        <div class="col-lg-6">
          <h3>Index DB</h3>

          <p>
            IndexedDB is a much more complex and well-rounded solution for storing data in the browser.
            It is a JavaScript-based, object-oriented, database that allows us to easily store and retrieve data that has been indexed with a key.
          </p>

          <h5>Pros</h5>
          <ul class="">
            <li>It allow for fast indexing, searching and storage of large amounts of complex data.</li>
            <li>It can handle more complex and structured data.</li>
          </ul>

          <h5>Cons</h5>
          <ul class="">
            <li>It is complex and can be daunting to work with.</li>
            <li>generally slower than the alternative when working with simple data</li>
          </ul>

          <template v-show="!loading">
          <h5>Metrics</h5>

          <ul class="">
            <li :class="{'text-danger': lsGetsFaster, 'text-success': lsGetsSlower}" v-if="indexDBMetrics.getTime !== null">Fetch time: {{ indexDBMetrics.getTime }} Millisecond(s)</li>
            <li :class="{'text-danger': lsSortFaster, 'text-success': lsSortSlower}" v-if="indexDBMetrics.sortTime !== null">Sort time: {{ indexDBMetrics.sortTime }} Millisecond(s)</li>
            <li :class="{'text-danger': lsAddsFaster, 'text-success': lsAddsSlower}" v-if="indexDBMetrics.addTime !== null">Add time: {{ indexDBMetrics.addTime }} Millisecond(s)</li>
          </ul>
          </template>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center">
      <p class="mb-0" v-if="users.length">showing {{ tableShowCount }} users of {{ users.length }}</p>
      <button class="btn btn--color-primary-blue ml-auto" data-toggle="modal" data-target="#addUserModal" data-placement="top" title="Add user" :disabled="loading">New</button>
    </div>

    <div class="table-responsive mt-4" v-if="users.length && !loading">
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
          <template v-if="index < tableShowCount">
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

      <p @click="showMore" class="text-center text-primary pointer" v-if="!hideShowMore">Show more</p>
    </div>
    <div class="spinner-border text-primary d-block mx-auto my-5" role="status" v-if="loading">
      <span class="sr-only">Loading...</span>
    </div>
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
      loading: false,
      connecting: {
        gettingUsersFromFirestore: false,
        gettingUsersFromLS: false,
        gettingUsersFromIDB: false,
        addingRecords: false
      },

      tableShowCount: 20
    };
  },

  async mounted() {
    // initialize index db
    this.indexDB = await this.initializeIndexDB();
    await this.getRecordsFromIndexDB();
    this.getRecordFromLocalStorage();
    if (!this.indexDBRecord.length || !this.localStorageRecord.length) this.getUsersFromServer();
    else this.users = this.indexDBRecord;

    // methods below don't need to be called by me again because i've set them up already. check their declarations for their uses
    // this.setUpRealTimeLink();
    // this.populateUsers();
  },

  filters: {
    formatDate(date) {
      return moment(date).format('Do MMMM, YYYY');
    }
  },

  computed: {
    lsGetsFaster() {
      return this.localStorageMetrics.getTime < this.indexDBMetrics.getTime;
    },

    lsSortFaster() {
      return this.localStorageMetrics.sortTime < this.indexDBMetrics.sortTime;
    },

    lsAddsFaster() {
      return this.localStorageMetrics.addTime < this.indexDBMetrics.addTime;
    },

    lsGetsSlower() {
      return this.localStorageMetrics.getTime > this.indexDBMetrics.getTime;
    },

    lsSortSlower() {
      return this.localStorageMetrics.sortTime > this.indexDBMetrics.sortTime;
    },

    lsAddsSlower() {
      return this.localStorageMetrics.addTime > this.indexDBMetrics.addTime;
    },

    hideShowMore() {
      return this.users.length < this.tableShowCount;
    }
  },

  methods: {
    getUsersFromServer(useCache = true) {
      this.loading = true;
      const getOptions = { source: useCache ? 'cache' : 'server' };
      db.collection('users').get(getOptions).then(async res => {
        // use the cache to get data if it is present
        if (!res.docs.length) {
          this.getUsersFromServer(false);
          return;
        }
        this.users = res.docs.map(doc => {
          return doc.data();
        });

        // clear both local storages
        await this.clearIndexDB();
        localStorage.removeItem('woven_user_records');
        this.localStorageRecord = [];

        this.addAllRecordsToLocalStorage();
        await this.addUsersToIndexDB();
        this.loading = false;
      }).catch(() => {
        this.loading = false;
        this.$toastr.e('Couldn\'t get data. Please check your network connection and refresh the page');
      });
    },

    /*

     the method below is for using firebase's websocket to update data in realtime. i'm however not using it due to the large dataset i'm dealing with.
     i'm using caching here to limit the calls to to cloud server because google firestore records reads per field not per request, so this can quickly
     get out of hand when dealing with a large data set like I am here.

     */
    setUpRealTimeLink() {
      db.collection('users').onSnapshot(async records => {
        this.users = records.docs.map(record => {
          return record.data();
        });
        this.addAllRecordsToLocalStorage();
        await this.addUsersToIndexDB();
      });
    },

    addNewUserLocally(user) {
      this.addNewUserToLocalStorage(user);
      this.addUsersToIndexDB(true, user);
    },

    // Local storage
    getRecordFromLocalStorage() {
      if (localStorage.getItem('woven_user_records')) {
        this.loading = true;
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
        this.loading = false;
      }
    },

    addAllRecordsToLocalStorage() {
      localStorage.setItem('woven_user_records', JSON.stringify(this.users));
      this.getRecordFromLocalStorage();
    },

    addNewUserToLocalStorage(user) {
      const addStartTime = moment();
      const currentRecord = JSON.parse(localStorage.getItem('woven_user_records'));
      currentRecord.push(user);
      localStorage.setItem('woven_user_records', JSON.stringify(currentRecord));
      const addFinishTime = moment();
      this.localStorageRecord.push(user);
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
          database.createObjectStore('user_records', { autoIncrement: true, keyPath: 'bvn' });
          this.indexDBInitialized = true;
        };
      });
    },

    getRecordsFromIndexDB() {
      if (!this.indexDBInitialized) return;
      return new Promise((resolve) => {
        this.loading = true;

        // fetch
        const fetchStartTime = moment();
        const transaction = this.indexDB.transaction(['user_records'], 'readonly');
        const store = transaction.objectStore('user_records');
        const indexDBRecord = [];

        transaction.oncomplete = async () => {
          this.indexDBRecord = indexDBRecord;
          const fetchFinishTime = moment();
          this.loading = false;
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
      return new Promise((resolve) => {
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

        transaction.oncomplete = () => {
          this.indexDBRecord = indexDBRecord;
          const sortFinishTime = moment();
          this.loading = false;
          this.indexDBMetrics.sortTime = sortFinishTime.diff(sortStartTime);
          resolve();
        };
      });
    },

    addUsersToIndexDB(single = false, user = null) {
      if (!this.indexDBInitialized) return;
      return new Promise((resolve) => {
        const addStartTime = moment();
        const transaction = this.indexDB.transaction(['user_records'], 'readwrite');
        const store = transaction.objectStore('user_records');

        if (single && user) store.add(user);
        else {
          this.users.forEach(user => {
            store.add(user);
          });
        }

        transaction.oncomplete = () => {
          const addFinishTime = moment();
          this.indexDBMetrics.addTime = addFinishTime.diff(addStartTime);
          this.indexDBRecord.push(user);
          resolve();
        };
      });
    },

    clearIndexDB() {
      return new Promise((resolve) => {
        // open a read/write db transaction, ready for clearing the data
        const transaction = this.indexDB.transaction(['user_records'], 'readwrite');

        // create an object store on the transaction
        const store = transaction.objectStore('user_records');

        // Make a request to clear all the data out of the object store
        const storeRequest = store.clear();

        storeRequest.onsuccess = () => {
          this.indexDBRecord = [];
          resolve();
        };
      });
    },

    // this is for populating the sample set. It's already populated so this does not need to be called again
    populateUsers() {
      this.loading = true;
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

      batch.commit().then(async () => {
        await this.clearIndexDB();
        localStorage.removeItem('woven_user_records');
        this.localStorageRecord = [];
        this.addAllRecordsToLocalStorage();
        await this.addUsersToIndexDB();
        this.loading = false;
        this.$toastr.s('Data uploaded', 'SUCCESS');
      }).catch(() => {
        this.loading = false;
        this.$toastr.e('Couldn\'t upload data. Please check your network connection and refresh the page');
      });
    },

    showMore() {
      if ((this.tableShowCount + 10) < this.users.length) this.tableShowCount += 10;
      else this.tableShowCount = this.users.length;
    }
  }
};
</script>
