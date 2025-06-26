<template>

  <FacilityAppBarPage>
    <KPageContainer>
      <p>
        <KRouterLink
          v-if="userIsMultiFacilityAdmin"
          :to="{
            name: facilityPageLinks.AllFacilitiesPage.name,
            params: { subtopicName: 'ManageClassPage' },
          }"
          icon="back"
          :text="coreString('changeLearningFacility')"
        />
      </p>
      <KGrid>
        <KGridItem
          :layout8="{ span: 6 }"
          :layout12="{ span: 9 }"
        >
          <h1>{{ coreString('classesLabel') }}</h1>
          <p>{{ $tr('adminClassPageSubheader') }}</p>
        </KGridItem>
        <KGridItem
          :layout="{ alignment: 'right' }"
          :layout8="{ span: 2 }"
          :layout12="{ span: 3 }"
        >
          <KButton
            :text="$tr('addNew')"
            :primary="true"
            class="move-down"
            @click="displayModal(Modals.CREATE_CLASS)"
          />
        </KGridItem>
      </KGrid>

      <KTable
        :headers="tableHeaders"
        :rows="tableRows"
        :caption="$tr('tableCaption')"
        :emptyMessage="$tr('noClassesExist')"
        :dataLoading="dataLoading"
        sortable
      >
        <template #header="{ header, colIndex }">
          <span :class="{ visuallyhidden: colIndex === 3 }">{{ header.label }}</span>
        </template>
        <template #cell="{ content, colIndex, row }">
          <span v-if="colIndex === 0">
            <KRouterLink
              :text="content"
              :to="$store.getters.facilityPageLinks.ClassEditPage(row[3].id)"
              icon="classes"
            />
          </span>
          <span v-else-if="colIndex === 1">
            <KOptionalText :text="coachNames(row[3]).length ? formattedCoachNames(row[3]) : ''" />
            <KTooltip
              v-if="formattedCoachNamesTooltip(row[3])"
              :reference="`coachNames${row[3].id}`"
              :refs="$refs"
            >
              {{ formattedCoachNamesTooltip(row[3]) }}
            </KTooltip>
          </span>
          <span v-else-if="colIndex === 2">
            {{ content }}
          </span>
          <span
            v-else-if="colIndex === 3"
            class="core-table-button-col"
          >
            <KIconButton icon="optionsVertical">
              <template #menu>
                <KDropdownMenu
                  :primary="false"
                  :disabled="false"
                  :hasIcons="true"
                  :options="dropDownOptions"
                  @select="handleOptionSelection($event, row[3])"
                />
              </template>
            </KIconButton>
          </span>
        </template>
      </KTable>

      <ClassDeleteModal
        v-if="Boolean(classToDelete)"
        :classToDelete="classToDelete"
        @cancel="clearClassToDelete"
        @success="handleDeleteSuccess()"
      />
      <ClassCreateModal
        v-if="modalShown === Modals.CREATE_CLASS"
        :classes="classes"
        @cancel="closeModal"
        @success="handleCreateSuccess()"
      />

      <ClassRenameModal
        v-if="modalShown === Modals.EDIT_CLASS_NAME"
        :classname="classDetails.name"
        :classid="classDetails.id"
        :classes="classes"
        @cancel="closeModal"
      />
      <SidePanelModal
        v-if="openCopyClassPanel"
        ref="resourcePanel"
        alignment="right"
        sidePanelWidth="700px"
        closeButtonIconType="close"
        @closePanel="openCopyClassPanel = false"
      >
        <template #header>
          <h1 class="side-panel-title">{{ copyClasslabel$() }}</h1>
        </template>
        <template #default>
          <div>
            <KTextbox
              v-model="classDetails.name"
              type="text"
              :label="classTitleLabel$()"
              :autofocus="true"
              :maxlength="120"
            />

            <p class="side-panel-subtitle">{{ coachesAssignedToClassLabel$() }}</p>
            <SelectableList
              :value="classCoachesIds"
              :options="classCoaches"
              :ariaLabelledby="coachesAssignedToClassLabel$()"
              :selectAllLabel="selectAllLabel$()"
              :searchLabel="coreString('searchLabel')"
            />
          </div>
        </template>

        <template #bottomNavigation>
          <div class="bottom-nav">
            <div>{{ numCoachesSelected$({ n: 3 }) }}</div>
            <div>
              <KButton
                :text="coreString('cancelAction')"
                appearance="raised-button"
                class="cancel-copy-class-button"
                @click="openCopyClassPanel = false"
              />
              <KButton
                :text="copyClasslabel$()"
                :primary="true"
              />
            </div>
          </div>
        </template>
      </SidePanelModal>
    </KPageContainer>
  </FacilityAppBarPage>

</template>


<script>

  import { ref } from 'vue';
  import { mapState, mapActions, mapGetters } from 'vuex';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import { Modals } from '../../constants';
  import FacilityAppBarPage from '../FacilityAppBarPage';
  import ClassRenameModal from '../ClassEditPage/ClassRenameModal.vue';
  import ClassCreateModal from './ClassCreateModal';
  import ClassDeleteModal from './ClassDeleteModal';
  import useDeleteClass from './useDeleteClass';
  import SelectableList from './SelectableList.vue';

  export default {
    name: 'ManageClassPage',
    metaInfo() {
      return {
        title: this.coreString('classesLabel'),
      };
    },
    components: {
      FacilityAppBarPage,
      ClassCreateModal,
      ClassDeleteModal,
      ClassRenameModal,
      SidePanelModal,
      SelectableList,
    },
    mixins: [commonCoreStrings],
    setup() {
      const classDetails = ref({});
      const openCopyClassPanel = ref(false);
      const { classToDelete, selectClassToDelete, clearClassToDelete } = useDeleteClass();
      const { getFacilities, userIsMultiFacilityAdmin } = useFacilities();
      const {
        copyClasslabel$,
        renameClassLabel$,
        coachesAssignedToClassLabel$,
        classTitleLabel$,
        selectAllLabel$,
        numCoachesSelected$,
      } = bulkUserManagementStrings;

      return {
        classToDelete,
        selectClassToDelete,
        clearClassToDelete,
        userIsMultiFacilityAdmin,
        getFacilities,
        copyClasslabel$,
        renameClassLabel$,
        classDetails,
        openCopyClassPanel,
        coachesAssignedToClassLabel$,
        classTitleLabel$,
        selectAllLabel$,
        numCoachesSelected$,
      };
    },
    computed: {
      ...mapState('classManagement', ['modalShown', 'classes', 'dataLoading']),
      ...mapGetters(['facilityPageLinks']),

      Modals: () => Modals,
      tableHeaders() {
        return [
          {
            label: this.coreString('classNameLabel'),
            dataType: 'string',
            minWidth: '150px',
            width: '20%',
            columnId: 'classname',
          },
          {
            label: this.coreString('coachesLabel'),
            dataType: 'undefined',
            minWidth: '150px',
            width: '30%',
            columnId: 'coaches',
          },
          {
            label: this.coreString('learnersLabel'),
            dataType: 'number',
            minWidth: '150px',
            width: '20%',
            columnId: 'learners',
          },
          {
            label: this.coreString('userActionsColumnHeader'),
            dataType: 'undefined',
            minWidth: '150px',
            width: '30%',
            columnId: 'userActions',
          },
        ];
      },
      tableRows() {
        return this.classes.map(classroom => [
          classroom.name,
          this.formattedCoachNames(classroom),
          this.$formatNumber(classroom.learner_count),
          classroom,
        ]);
      },
      dropDownOptions() {
        return [
          {
            label: this.copyClasslabel$(),
            value: 'COPY_CLASS',
            id: 'copy',
          },
          {
            label: this.renameClassLabel$(),
            value: 'EDIT_CLASS_NAME',
            id: 'rename',
          },
          {
            label: this.$tr('deleteClass'),
            value: 'DELETE_CLASS',
            id: 'delete',
          },
        ];
      },
      classCoaches() {
        return this.classDetails.coaches.map(coach => ({
          id: coach.id,
          username: coach.username,
          full_name: coach.full_name,
          label: coach.full_name,
        }));
      },
      classCoachesIds() {
        return this.classCoaches.map(coach => coach.id).filter(id => id !== undefined);
      },
    },
    methods: {
      ...mapActions('classManagement', ['displayModal']),
      closeModal() {
        this.displayModal(false);
      },
      handleCreateSuccess() {
        this.closeModal();
        this.refreshCoreFacilities();
      },
      handleDeleteSuccess() {
        this.clearClassToDelete();
        this.refreshCoreFacilities();
      },
      refreshCoreFacilities() {
        if (this.userIsMultiFacilityAdmin) {
          // Update the core facilities object to update classroom number
          this.getFacilities();
        }
      },
      // Duplicated in class-list-page
      coachNames(classes) {
        const { coaches } = classes;
        return coaches.map(({ full_name }) => full_name);
      },
      formattedCoachNames(classroom) {
        const coach_names = this.coachNames(classroom);

        if (coach_names.length === 1) {
          return coach_names[0];
        }
        if (coach_names.length === 2) {
          return this.$tr('twoCoachNames', {
            name1: coach_names[0],
            name2: coach_names[1],
          });
        }
        return this.$tr('manyCoachNames', {
          name1: coach_names[0],
          name2: coach_names[1],
          numRemaining: coach_names.length - 2,
        });
      },
      formattedCoachNamesTooltip(classroom) {
        const coach_names = this.coachNames(classroom);
        if (coach_names.length > 2) {
          return coach_names.join('\n');
        }
        return null;
      },
      handleOptionSelection(selection, row) {
        this.classDetails = row;
        if (selection.value === Modals.DELETE_CLASS) {
          this.selectClassToDelete(row);
          return;
        }

        if (selection.value === Modals.EDIT_CLASS_NAME) {
          this.displayModal(Modals.EDIT_CLASS_NAME);
          return;
        }

        if (selection.value === Modals.COPY_CLASS) {
          this.openCopyClassPanel = true;
          return;
        }
      },
    },
    $trs: {
      adminClassPageSubheader: {
        message: 'View and manage your classes',
        context: 'Description on Facility > Classes page.',
      },
      addNew: {
        message: 'New class',
        context: 'Button used to create a new class.',
      },
      deleteClass: {
        message: 'Delete class',
        context: 'Option to delete a class.',
      },
      tableCaption: {
        message: 'List of classes',
        context: 'Caption for the table containing the list of classes.',
      },
      twoCoachNames: {
        message: '{name1}, {name2}',
        context: 'DO NOT TRANSLATE\nCopy the source string.',
      },
      manyCoachNames: {
        message: '{name1}, {name2}… (+{numRemaining, number})',
        context: 'DO NOT TRANSLATE\nCopy the source string.',
      },
      noClassesExist: {
        message: 'No classes exist',
        context:
          'Message that displays when there are no classes created in the Facility > Classes section.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .move-down {
    position: relative;
    margin-top: 24px;
  }

  .side-panel-title {
    margin-left: 15px;
    font-size: 18px;
    font-weight: 600;
  }

  .side-panel-subtitle {
    font-size: 16px;
    font-weight: bold;
  }

  /deep/ .textbox {
    max-width: 100% !important;
  }

  .description-ktextbox-style /deep/ .ui-textbox-label {
    width: 100%;
  }

  .bottom-nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .cancel-copy-class-button {
    margin-right: 1em;
  }

</style>
