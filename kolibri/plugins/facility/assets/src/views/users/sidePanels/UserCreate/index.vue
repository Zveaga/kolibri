<template>

  <SidePanelModal
    hideHeaderBorder
    alignment="right"
    sidePanelWidth="700px"
    class="bum-side-panel"
    closeButtonIconType="close"
    :contentContainerStyleOverrides="{ padding: '0px 24px 24px' }"
    :headerContainerStyleOverrides="{ paddingLeft: '24px', paddingRight: '24px' }"
    @closePanel="close"
  >
    <template #header>
      <h1 class="side-panel-title">
        {{ $tr('createNewUserHeader') }}
      </h1>
    </template>
    <template #default>
      <div
        v-if="showErrorWarning"
        :style="{ color: $themeTokens.error }"
        class="warning-text"
      >
        <span>{{ defaultErrorMessage$() }}</span>
      </div>
      <form
        v-if="!loading"
        :id="formId"
        class="form"
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
          <template v-if="showUsernameInput">	<!-- Added by me  -->
            <UsernameTextbox
              ref="usernameTextbox"
              :disabled="busy"
              :value.sync="username"
              :isValid.sync="usernameValid"
              :shouldValidate="formSubmitted"
              :isUniqueValidator="usernameIsUnique"
              :errors.sync="caughtErrors"
            />
          </template>
          <template v-if="showPasswordInput">
            <PasswordTextbox
              ref="passwordTextbox"
              :disabled="busy"
              :value.sync="password"
              :isValid.sync="passwordValid"
              :shouldValidate="formSubmitted"
            />
          </template>
		  <!-- Added by me  -->
          <div
            v-if="learnerIsSelected && !generatedCredentials" 
            class="info-text"
          >
            <p>{{ $tr('autoGenerateCredentialsInfo') }}</p>
          </div>
          <div
            v-if="generatedCredentials"
            class="credentials-box"
          >
            <h3>{{ $tr('generatedCredentialsTitle') }}</h3>
            <p><strong>{{ $tr('username') }}:</strong> {{ generatedCredentials.username }}</p>
            <p><strong>{{ $tr('password') }}:</strong> {{ generatedCredentials.password }}</p>
            <p class="warning-text">{{ $tr('saveCredentialsWarning') }}</p>
          </div>
		  <!----------------->
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

          <ClassesSelect
            v-model="selectedClasses"
            :classes="classes"
            :disabled="busy || !classes.length"
            :action="classesAction"
          />

          <ExtraDemographics
            v-model="extraDemographics"
            :facilityDatasetExtraFields="facilityConfig.extra_fields"
            :disabled="busy"
          />
        </section>
      </form>
      <CloseConfirmationGuard
        ref="closeConfirmationGuardRef"
        :hasUnsavedChanges="hasUnsavedChanges"
      />
    </template>
    <template #bottomNavigation>
      <div class="bottom-nav-container">
        <KButton
          primary
          :form="formId"
          :text="saveAndClose$()"
          :disabled="busy"
          @click="saveAndClose()"
        />
        <KButton
          :form="formId"
          :text="saveAndAddAnother$()"
          :disabled="busy"
          @click="saveAndAddAnother()"
        />
      </div>
    </template>
  </SidePanelModal>

</template>


<script>

  import store from 'kolibri/store';
  import { ref, computed, nextTick, onBeforeMount, getCurrentInstance } from 'vue';
  import { useRoute, useRouter } from 'vue-router/composables';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import notificationStrings from 'kolibri/uiText/notificationStrings';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import ExtraDemographics from 'kolibri-common/components/ExtraDemographics';
  import GenderSelect from 'kolibri-common/components/userAccounts/GenderSelect';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import commonCoreStrings, { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { UserKinds, ERROR_CONSTANTS, DemographicConstants } from 'kolibri/constants';
  import BirthYearSelect from 'kolibri-common/components/userAccounts/BirthYearSelect';
  import FullNameTextbox from 'kolibri-common/components/userAccounts/FullNameTextbox';
  import UsernameTextbox from 'kolibri-common/components/userAccounts/UsernameTextbox';
  import PasswordTextbox from 'kolibri-common/components/userAccounts/PasswordTextbox';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import CloseConfirmationGuard from '../../common/CloseConfirmationGuard.vue';
  import { ClassesActions } from '../../../../constants';
  import IdentifierTextbox from './IdentifierTextbox.vue';
  import ClassesSelect from './ClassesSelect.vue';

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
      ClassesSelect,
      BirthYearSelect,
      UsernameTextbox,
      FullNameTextbox,
      PasswordTextbox,
      IdentifierTextbox,
      SidePanelModal,
      ExtraDemographics,
      CloseConfirmationGuard,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const formId = 'create-user-form';
      const route = useRoute();
      const router = useRouter();
      const $refs = getCurrentInstance().proxy.$refs;
      const { getFacilityConfig, facilityConfig } = useFacilities();
      const { createSnackbar } = useSnackbar();
      const userTypeOptions = [
        {
          label: coreStrings.learnerLabel$(),
          value: UserKinds.LEARNER,
        },
        {
          label: coreStrings.coachLabel$(),
          value: UserKinds.COACH,
        },
        {
          label: coreStrings.adminLabel$(),
          value: UserKinds.ADMIN,
        },
      ];

      const closeConfirmationGuardRef = ref(null);

      // Form data properties
      const fullName = ref('');
      const fullNameValid = ref(false);
      const username = ref('');
      const usernameValid = ref(false);
      const password = ref('');
      const passwordValid = ref(false);
      const generatedCredentials = ref(null); // Added by me
      const gender = ref(NOT_SPECIFIED);
      const birthYear = ref(NOT_SPECIFIED);
      const extraDemographics = ref({});
      const idNumber = ref('');
      const loading = ref(true);
      const kind = ref(null);
      const selectedClasses = ref([]);
      const classCoachIsSelected = ref(true);
      const busy = ref(false);
      const formSubmitted = ref(false);
      const caughtErrors = ref([]);

      const showErrorWarning = ref(false);

      const resetForm = () => {
        fullName.value = '';
        username.value = '';
        password.value = '';
        gender.value = NOT_SPECIFIED;
        birthYear.value = NOT_SPECIFIED;
        extraDemographics.value = {};
        idNumber.value = '';
        kind.value = userTypeOptions[0]; // Reset to Learner
        classCoachIsSelected.value = true;
        formSubmitted.value = false;
        caughtErrors.value = [];
        busy.value = false;
        selectedClasses.value = [];
        generatedCredentials.value = null; // Added by me
        $refs.fullNameTextbox?.reset();
        $refs.usernameTextbox?.reset();
        $refs.passwordTextbox?.reset();
      };

      resetForm();

      const activeFacilityId = computed(() => route.params.facility_id);
      const facilityUsers = computed(() => store.state.userManagement.facilityUsers);

	  // Added by me
      const learnerIsSelected = computed(() => {
        return kind.value && kind.value.value === UserKinds.LEARNER;
      });
	  //---------//

      const showPasswordInput = computed(() => {
        // Hide password field for learners (will be auto-generated) // Added by me
        if (learnerIsSelected.value) {
          return false;
        }
        if (facilityConfig.value.learner_can_login_with_no_password) {
          return kind.value.value !== UserKinds.LEARNER;
        }
        return true;
      });
      
      const showUsernameInput = computed(() => {
        // Hide username field for learners (will be auto-generated)
        return !learnerIsSelected.value;
      });

      const coachIsSelected = computed(() => {
        return kind.value.value === UserKinds.COACH;
      });

      const newUserRole = computed(() => {
        if (coachIsSelected.value) {
          return classCoachIsSelected.value ? UserKinds.ASSIGNABLE_COACH : UserKinds.COACH;
        }
        // Admin or Learner
        return kind.value.value;
      });

	  // Added by me
      const formIsValid = computed(() => {
        // For learners, username and password are auto-generated, so only check full name
        if (learnerIsSelected.value) {
          return fullNameValid.value;
        }
	  //-------------//
        return [fullNameValid.value, usernameValid.value, passwordValid.value].every(Boolean);
      });

      const hasUnsavedChanges = computed(() => {
        const formValuesUnsaved = [
          fullName.value,
          username.value,
          password.value,
          idNumber.value,
          gender.value !== NOT_SPECIFIED,
          birthYear.value !== NOT_SPECIFIED,
          newUserRole.value !== UserKinds.LEARNER,
          Object.values(extraDemographics.value).some(value => {
            if (Array.isArray(value)) {
              return value.length > 0;
            }
            return Boolean(value);
          }),
          selectedClasses.value.length > 0,
        ];
        return formValuesUnsaved.some(Boolean);
      });

      const classesAction = computed(() =>
        kind.value.value === UserKinds.LEARNER
          ? ClassesActions.ENROLL_LEARNER
          : ClassesActions.ASSIGN_COACH,
      );

      const usernameIsUnique = value => {
        return !facilityUsers.value.find(
          ({ username }) => username.toLowerCase() === value.toLowerCase(),
        );
      };

      const focusOnInvalidField = async () => {
        await nextTick();
        if (!fullNameValid.value) {
          $refs.fullNameTextbox.focus();
        } else if (!usernameValid.value) {
          $refs.usernameTextbox.focus();
        } else if (!passwordValid.value) {
          $refs.passwordTextbox.focus();
        }
      };

      const handleSubmitSuccess = () => {
        createSnackbar(notificationStrings.userCreated$());
        props.onChange();
      };

      const handleSubmitFailure = error => {
        caughtErrors.value = CatchErrors(error, [ERROR_CONSTANTS.USERNAME_ALREADY_EXISTS]);
        busy.value = false;
        if (caughtErrors.value.length > 0) {
          focusOnInvalidField();
        } else {
          showErrorWarning.value = true;
        }
      };

      const saveUserRole = (facilityUser, newRoleKind) => {
        const { id, facility } = facilityUser;
        return RoleResource.saveModel({
          data: {
            user: id,
            collection: facility,
            kind: newRoleKind,
          },
        });
      };

      const enrollLearnerInClasses = (userId, classIds) => {
        return MembershipResource.saveCollection({
          data: classIds.map(classId => ({
            collection: classId,
            user: userId,
          })),
        });
      };

      const assignCoachToClasses = (userId, classIds) => {
        return RoleResource.saveCollection({
          data: classIds.map(classId => ({
            collection: classId,
            user: userId,
            kind: UserKinds.COACH,
          })),
        });
      };

      const createFacilityUser = async () => {
        let passwordValue = password.value;
		// Added by me
        let usernameValue = username.value;
        
        // For learners, set placeholder values for NAS to generate credentials
        if (learnerIsSelected.value) {
          usernameValue = 'GENERATE_CREDENTIALS';
          passwordValue = 'GENERATE_CREDENTIALS';
        } else if (!showPasswordInput.value) {
	    //---------//
          passwordValue = NOT_SPECIFIED;
        }
        
        const facilityUser = await FacilityUserResource.saveModel({
          data: {
            facility: activeFacilityId.value,
            username: usernameValue,
            full_name: fullName.value,
            password: passwordValue,
            id_number: idNumber.value,
            gender: gender.value,
            birth_year: birthYear.value,
            extra_demographics: extraDemographics.value,
          },
        });
		// Added by me
        // Check if credentials were generated by NAS
        if (facilityUser.generated_credentials) {
          generatedCredentials.value = facilityUser.generated_credentials;
        }
	    //---------//
        if (newUserRole.value !== UserKinds.LEARNER) {
          await saveUserRole(facilityUser, newUserRole.value);
        }
        if (selectedClasses.value.length > 0) {
          if (classesAction.value === ClassesActions.ASSIGN_COACH) {
            await assignCoachToClasses(facilityUser.id, selectedClasses.value);
          } else {
            await enrollLearnerInClasses(facilityUser.id, selectedClasses.value);
          }
        }
      };

      const submitForm = async () => {
        formSubmitted.value = true;
        
        // For learners, skip username/password validation
        if (learnerIsSelected.value) {
          usernameValid.value = true;
          passwordValid.value = true;
        } else if (!showPasswordInput.value && !passwordValid.value) {
          passwordValid.value = true;
        }
        
        if (!formIsValid.value) {
          return focusOnInvalidField();
        }
        busy.value = true;

        try {
          await createFacilityUser();
        } catch (error) {
          handleSubmitFailure(error);
          return false;
        }

        handleSubmitSuccess();
        return true;
      };

      const close = () => {
        if (props.backRoute) {
          router.push(props.backRoute);
        } else {
          router.back();
        }
      };

      const saveAndClose = async () => {
        const success = await submitForm();
        if (success) {
          // Reset form to reset the hasUnsavedChanges state and
          // prevent the close confirmation modal from showing
          resetForm();
          await nextTick();
          close();
        }
      };

      const saveAndAddAnother = async () => {
        const success = await submitForm();
        if (success) {
          resetForm();
          await nextTick();
          $refs.fullNameTextbox.focus();
        }
      };

      onBeforeMount(async () => {
        await getFacilityConfig(activeFacilityId.value);
        loading.value = false;
      });

      const { saveAndClose$ } = coreStrings;
      const { saveAndAddAnother$, defaultErrorMessage$ } = bulkUserManagementStrings;
      return {
        classesAction,
        fullName,
        fullNameValid,
        username,
        usernameValid,
        password,
        passwordValid,
        gender,
        birthYear,
        extraDemographics,
        idNumber,
        loading,
        kind,
        hasUnsavedChanges,
        closeConfirmationGuardRef,
        classCoachIsSelected,
        selectedClasses,
        busy,
        formSubmitted,
        caughtErrors,
        showPasswordInput,
        showUsernameInput,		// Added by me
        learnerIsSelected,		// Added by me
        generatedCredentials,	// Added by me
        coachIsSelected,
        userTypeOptions,
        close,
        usernameIsUnique,
        saveAndAddAnother,
        saveAndClose,
        formId,
        facilityConfig,
        saveAndClose$,
        saveAndAddAnother$,
        defaultErrorMessage$,
      };
    },
    props: {
      backRoute: {
        type: Object,
        default: null,
      },
      classes: {
        type: Array,
        default: () => [],
      },
      onChange: {
        type: Function,
        default: () => {},
      },
    },
    beforeRouteLeave(to, from, next) {
      this.$refs.closeConfirmationGuardRef?.beforeRouteLeave(to, from, next);
    },
    $trs: {
      createNewUserHeader: {
        message: 'Create new user',
        context:
          "Refers to the window accessed via the 'New user' button in the Facility > Users section.",
      },
	  // Added by me
      autoGenerateCredentialsInfo: {
        message: 'Username and password will be automatically generated from Active Directory when you save.',
        context: 'Information displayed when creating a learner account.',
      },
      generatedCredentialsTitle: {
        message: 'Generated Credentials',
        context: 'Title for the box displaying auto-generated username and password.',
      },
      username: {
        message: 'Username',
        context: 'Label for username field.',
      },
      password: {
        message: 'Password',
        context: 'Label for password field.',
      },
      saveCredentialsWarning: {
        message: 'Please save these credentials! They will not be shown again.',
        context: 'Warning message to save the generated credentials.',
      },
	  //------------//   
    },
  };

</script>


<style lang="scss" scoped>

  @import '../common';

  .bum-side-panel {
    @include bum-side-panel;
  }

  .coach-selector {
    padding: 0;
    margin: 0;
    margin-bottom: 16px;
    border: 0;
  }

  .select {
    margin: 18px 0 36px;
  }

  .form {
    width: 100%;
  }

  /deep/ .textbox {
    max-width: 100% !important;
  }

  .warning-text {
    margin-bottom: 10px;
    margin-left: 5px;
  }
// Added by me
  .info-text {
    padding: 12px;
    margin: 16px 0;
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
    border-radius: 4px;

    p {
      margin: 0;
      color: #1565c0;
    }
  }

  .credentials-box {
    padding: 16px;
    margin: 16px 0;
    background-color: #f5f5f5;
    border: 2px solid #4caf50;
    border-radius: 8px;

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #2e7d32;
    }

    p {
      margin: 8px 0;
      font-size: 16px;

      strong {
        display: inline-block;
        min-width: 100px;
      }
    }

    .warning-text {
      margin-top: 12px;
      padding: 8px;
      background-color: #fff3cd;
      border-left: 4px solid #ff9800;
      color: #856404;
      font-weight: 600;
    }
  }
//----------------//
</style>
