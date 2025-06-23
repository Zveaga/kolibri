<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    closeButtonIconType="close"
    @closePanel="$emit('close')"
  >
    <template #header>
      <h1 class="side-panel-title">
        {{ $tr('createNewUserHeader') }}
      </h1>
    </template>
    <template #default>
      <form
        v-if="!loading"
        class="form"
        @submit.prevent="submitForm"
      >
        <section>
          <FullNameTextbox
            ref="fullNameTextbox"
            :autofocus="true"
            :disabled="busy"
            :value.sync="fullName"
            :isValid.sync="fullNameValid"
            :shouldValidate="formSubmitted"
          />

          <UsernameTextbox
            ref="usernameTextbox"
            :disabled="busy"
            :value.sync="username"
            :isValid.sync="usernameValid"
            :shouldValidate="formSubmitted"
            :isUniqueValidator="usernameIsUnique"
            :errors.sync="caughtErrors"
          />
          <template v-if="showPasswordInput">
            <PasswordTextbox
              ref="passwordTextbox"
              :disabled="busy"
              :value.sync="password"
              :isValid.sync="passwordValid"
              :shouldValidate="formSubmitted"
            />
          </template>
          <KSelect
            v-model="kind"
            class="select"
            :disabled="busy"
            :label="coreString('userTypeLabel')"
            :options="userTypeOptions"
          />

          <fieldset
            v-if="coachIsSelected"
            class="coach-selector"
          >
            <KRadioButtonGroup>
              <KRadioButton
                v-model="classCoachIsSelected"
                :disabled="busy"
                :label="coreString('classCoachLabel')"
                :description="coreString('classCoachDescription')"
                :buttonValue="true"
              />
              <KRadioButton
                v-model="classCoachIsSelected"
                :disabled="busy"
                :label="coreString('facilityCoachLabel')"
                :description="coreString('facilityCoachDescription')"
                :buttonValue="false"
              />
            </KRadioButtonGroup>
          </fieldset>

          <IdentifierTextbox
            :value.sync="idNumber"
            :disabled="busy"
          />

          <BirthYearSelect
            :value.sync="birthYear"
            :disabled="busy"
            class="select"
          />

          <GenderSelect
            :value.sync="gender"
            :disabled="busy"
            class="select"
          />

          <ExtraDemographics
            v-model="extraDemographics"
            :facilityDatasetExtraFields="facilityConfig.extra_fields"
            :disabled="busy"
          />
        </section>
      </form>
    </template>
    <template #bottomNavigation>
      <div class="bottom-nav-container">
        <KButtonGroup>
          <KButton
            type="submit"
            :text="saveAndClose$()"
            :disabled="busy"
            :primary="true"
          />
          <KButton
            :text="saveAndAddAnother$()"
            :disabled="busy"
            @click="goToUserManagementPage()"
          />
        </KButtonGroup>
      </div>
    </template>
  </SidePanelModal>

</template>


<script>

  import every from 'lodash/every';
  import { mapState, mapGetters } from 'vuex';

  import CatchErrors from 'kolibri/utils/CatchErrors';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import ExtraDemographics from 'kolibri-common/components/ExtraDemographics';
  import GenderSelect from 'kolibri-common/components/userAccounts/GenderSelect';
  import commonCoreStrings, { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { UserKinds, ERROR_CONSTANTS, DemographicConstants } from 'kolibri/constants';
  import BirthYearSelect from 'kolibri-common/components/userAccounts/BirthYearSelect';
  import FullNameTextbox from 'kolibri-common/components/userAccounts/FullNameTextbox';
  import UsernameTextbox from 'kolibri-common/components/userAccounts/UsernameTextbox';
  import PasswordTextbox from 'kolibri-common/components/userAccounts/PasswordTextbox';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import IdentifierTextbox from './IdentifierTextbox';

  const { NOT_SPECIFIED } = DemographicConstants;

  export default {
    name: 'UserCreateSidePanel',
    metaInfo() {
      return {
        title: this.$tr('createNewUserHeader'),
      };
    },
    components: {
      GenderSelect,
      BirthYearSelect,
      UsernameTextbox,
      FullNameTextbox,
      PasswordTextbox,
      IdentifierTextbox,
      SidePanelModal,
      ExtraDemographics,
    },
    mixins: [commonCoreStrings],
    setup() {
      const { getFacilityConfig, facilityConfig } = useFacilities();
      const { saveAndClose$ } = coreStrings;
      const { saveAndAddAnother$ } = bulkUserManagementStrings;
      return {
        getFacilityConfig,
        facilityConfig,
        saveAndClose$,
        saveAndAddAnother$,
      };
    },
    data() {
      return {
        fullName: '',
        fullNameValid: false,
        username: '',
        usernameValid: false,
        password: '',
        passwordValid: false,
        gender: NOT_SPECIFIED,
        birthYear: NOT_SPECIFIED,
        extraDemographics: {},
        idNumber: '',
        loading: true,
        kind: {
          label: this.coreString('learnerLabel'),
          value: UserKinds.LEARNER,
        },
        classCoachIsSelected: true,
        busy: false,
        formSubmitted: false,
        caughtErrors: [],
      };
    },
    computed: {
      ...mapGetters(['activeFacilityId']),
      ...mapState('userManagement', ['facilityUsers']),
      showPasswordInput() {
        if (this.facilityConfig.learner_can_login_with_no_password) {
          return this.kind.value !== UserKinds.LEARNER;
        }
        return true;
      },
      newUserRole() {
        if (this.coachIsSelected) {
          return this.classCoachIsSelected ? UserKinds.ASSIGNABLE_COACH : UserKinds.COACH;
        }
        // Admin or Learner
        return this.kind.value;
      },
      coachIsSelected() {
        return this.kind.value === UserKinds.COACH;
      },
      formIsValid() {
        return every([this.fullNameValid, this.usernameValid, this.passwordValid]);
      },
      userTypeOptions() {
        return [
          {
            label: this.coreString('learnerLabel'),
            value: UserKinds.LEARNER,
          },
          {
            label: this.coreString('coachLabel'),
            value: UserKinds.COACH,
          },
          {
            label: this.coreString('adminLabel'),
            value: UserKinds.ADMIN,
          },
        ];
      },
    },
    beforeMount() {
      this.getFacilityConfig(this.activeFacilityId).then(() => {
        this.$store.dispatch('notLoading');
        this.loading = false;
      });
    },
    methods: {
      goToUserManagementPage(onComplete) {
        this.$router.push(this.$store.getters.facilityPageLinks.UserPage, onComplete);
      },
      usernameIsUnique(value) {
        return !this.facilityUsers.find(
          ({ username }) => username.toLowerCase() === value.toLowerCase(),
        );
      },
      submitForm() {
        this.formSubmitted = true;
        let password = this.password;

        if (!this.showPasswordInput) {
          password = NOT_SPECIFIED;
          this.passwordValid = true;
        }

        if (!this.formIsValid) {
          return this.focusOnInvalidField();
        }
        this.busy = true;
        this.$store
          .dispatch('userManagement/createFacilityUser', {
            username: this.username,
            full_name: this.fullName,
            id_number: this.idNumber,
            gender: this.gender,
            birth_year: this.birthYear,
            extra_demographics: this.extraDemographics,
            role: {
              kind: this.newUserRole,
            },
            password,
          })
          .then(() => {
            this.handleSubmitSuccess();
          })
          .catch(error => {
            this.handleSubmitFailure(error);
          });
      },
      handleSubmitSuccess() {
        this.goToUserManagementPage(() => {
          this.showSnackbarNotification('userCreated');
        });
      },
      handleSubmitFailure(error) {
        this.caughtErrors = CatchErrors(error, [ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS]);
        this.busy = false;
        if (this.caughtErrors.length > 0) {
          this.focusOnInvalidField();
        } else {
          this.$store.dispatch('handleApiError', { error });
        }
      },
      focusOnInvalidField() {
        this.$nextTick().then(() => {
          if (!this.fullNameValid) {
            this.$refs.fullNameTextbox.focus();
          } else if (!this.usernameValid) {
            this.$refs.usernameTextbox.focus();
          } else if (!this.passwordValid) {
            this.$refs.passwordTextbox.focus();
          }
        });
      },
    },
    $trs: {
      createNewUserHeader: {
        message: 'Create new user',
        context:
          "Refers to the window accessed via the 'New user' button in the Facility > Users section.",
      },
    },
  };

</script>


<style lang="scss" scoped>

  .coach-selector {
    padding: 0;
    margin: 0;
    border: 0;
  }

  .select {
    margin: 18px 0 36px;
  }

  .form {
    width: 100%;
  }

  .side-panel-title {
    font-size: 18px;
    font-weight: 600;
  }

  /deep/ .textbox {
    max-width: 100% !important;
  }

  .bottom-nav-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

</style>
