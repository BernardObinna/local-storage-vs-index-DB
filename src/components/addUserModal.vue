<template>
  <div class="modal fade" id="addUserModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel10" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Add user</h5>
          <button type="button" ref="closeDeleteModal" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="proceed">
            <div class="form-group">
              <label for="name">Name <span class="text-danger">*</span></label>
              <input class="form-control" id="name" name="name" @keyup="$v.form.name.$touch()" v-model.trim="form.name">
              <small class="text-danger" v-if="$v.form.name.$dirty && !$v.form.name.required">Please provide the user's name </small>
              <small class="text-danger" v-if="$v.form.address.$dirty && !$v.form.address.minLength">Name provided is too short </small>
            </div>

            <div class="form-group">
              <label for="email">Email <span class="text-danger">*</span></label>
              <input class="form-control" id="email" name="email" @keyup="$v.form.email.$touch()" v-model.trim="form.email">
              <small class="text-danger" v-if="$v.form.email.$dirty && !$v.form.email.required">Please provide the user's email </small>
              <small class="text-danger" v-if="$v.form.email.$dirty && !$v.form.email.email">Please provide a proper email </small>
            </div>

            <div class="form-group">
              <label for="phone">Phone <span class="text-danger">*</span></label>
              <input class="form-control" id="phone" name="phone" @keyup="$v.form.phone.$touch()" v-model.number="form.phone" @keypress="onlyNumbers">
              <small class="text-danger" v-if="$v.form.phone.$dirty && !$v.form.phone.required">Please provide the user's phone number </small>
              <small class="text-danger d-block" v-if="$v.form.phone.$dirty && !$v.form.phone.numeric">Please provide a proper phone number </small>
              <small class="text-danger" v-if="$v.form.phone.$dirty && !$v.form.phone.minLength">Phone number provided is too short </small>
              <small class="text-danger" v-if="$v.form.phone.$dirty && !$v.form.phone.maxLength">Phone number provided is too long </small>
            </div>

            <div class="form-group">
              <label for="dob">Date of Birth <span class="text-danger">*</span></label>
              <datetime id="dob" placeholder="" :max-datetime="disabledDates" input-class="form-control" v-model="form.dob" @close="$v.form.dob.$touch()"></datetime>
              <small class="text-danger" v-if="$v.form.dob.$dirty && !$v.form.dob.required">Please provide the user's date of birth </small>
            </div>

            <div class="form-group">
              <label for="address">Address <span class="text-danger">*</span></label>
              <textarea type="textarea" rows="3" class="form-control" id="address" name="address" @keyup="$v.form.address.$touch()" v-model.number="form.address"/>
              <small class="text-danger" v-if="$v.form.address.$dirty && !$v.form.address.required">Please provide the user's address </small>
              <small class="text-danger" v-if="$v.form.address.$dirty && !$v.form.address.minLength">Address provided is too short </small>
            </div>

            <div class="form-group">
              <label for="bvn">BVN <span class="text-danger">*</span></label>
              <input class="form-control" id="bvn" name="phone" @keyup="$v.form.bvn.$touch()" v-model.number="form.bvn" @keypress="onlyNumbers">
              <small class="text-danger" v-if="$v.form.bvn.$dirty && !$v.form.bvn.required">Please provide the user's BVN number </small>
              <small class="text-danger d-block" v-if="$v.form.bvn.$dirty && !$v.form.bvn.numeric">Please provide a proper BVN number </small>
              <small class="text-danger" v-if="$v.form.bvn.$dirty && !$v.form.bvn.minLength">BVN provided is too short </small>
              <small class="text-danger" v-if="$v.form.bvn.$dirty && !$v.form.bvn.maxLength">BVN provided is too long </small>
            </div>

            <div class="mt-4">
              <button type="submit" :disabled="loading" class="btn btn--color-primary-blue">{{ loading ? 'Processing' : 'Submit' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import moment from 'moment';
import { onlyNumbers } from '@/utils/Convert';
import db from '@/utils/firebase.js';

const { required, minLength, maxLength, email, numeric } = require('vuelidate/lib/validators');

export default {
  name: 'AddUserModal',
  mixins: [validationMixin],

  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        bvn: ''
      },

      loading: false,
      disabledDates: moment().subtract(18, 'years').format()
    };
  },

  validations: {
    form: {
      name: { required, minLength: minLength(2) },
      email: { required, email },
      phone: { required, numeric, minLength: minLength(11), maxLength: maxLength(11) },
      dob: { required },
      address: { required, minLength: minLength(8) },
      bvn: { required, numeric, minLength: minLength(11), maxLength: maxLength(11) }
    }
  },

  methods: {
    proceed() {
      this.$v.$touch();
      this.$v.form.$touch();
      if (!this.$v.form.$anyError) {
        this.loading = true;
        db.collection('users').add(this.form).then(() => {
          this.loading = false;
          this.$toastr.s('User data Uploaded', 'SUCCESS');
          this.$refs.closeDeleteModal.click();
        }).catch(() => {
          this.loading = false;
          this.$toastr.e('Couldn\'t upload data. Please check your network connection and try again');
        });
      }
    },

    onlyNumbers(evt) {
      return onlyNumbers(evt);
    }
  }
};
</script>
