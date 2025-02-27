<template>

  <div
    v-show="!$isPrint"
    class="report-controls"
  >
    <slot></slot>
    <div class="report-controls-buttons">
      <KRouterLink
        v-if="isMainReport"
        :text="$tr('viewLearners')"
        appearance="basic-link"
        :to="classLearnersListRoute"
      />
      <KIconButton
        v-if="!disablePrint"
        ref="printButton"
        icon="print"
        :aria-label="coachString('printReportAction')"
        @click.prevent="$print()"
      />
      <KTooltip
        reference="printButton"
        :refs="$refs"
      >
        {{ coachString('printReportAction') }}
      </KTooltip>

      <KIconButton
        v-if="!exportDisabled"
        ref="exportButton"
        icon="download"
        :aria-label="coachString('exportCSVAction')"
        @click.prevent="$emit('export')"
      />
      <KTooltip
        reference="exportButton"
        :refs="$refs"
      >
        {{ coachString('exportCSVAction') }}
      </KTooltip>
    </div>
  </div>

</template>


<script>

  import pickBy from 'lodash/pickBy';
  import useUser from 'kolibri/composables/useUser';
  import { mapState, mapActions } from 'vuex';
  import { reactive } from 'vue';
  import commonCoach from '../common';
  import { ClassesPageNames } from '../../../../../learn/assets/src/constants';
  import { LastPages } from '../../constants/lastPagesConstants';
  import { PageNames } from '../../constants';

  export default {
    name: 'ReportsControls',
    mixins: [commonCoach],
    setup() {
      const { isAppContext } = useUser();
      const filteredLearnMap = reactive({ value: {} });
      return {
        isAppContext,
        filteredLearnMap,
      };
    },
    props: {
      disableExport: {
        type: Boolean,
        default: false,
      },
      disablePrint: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState('classSummary', ['learnerMap']),
      exportDisabled() {
        // Always disable in app mode until we add the ability to download files.
        return this.isAppContext || this.disableExport;
      },
      isMainReport() {
        return (
          [
            PageNames.LEARNERS_ROOT,
            PageNames.LESSONS_ROOT,
            PageNames.LESSONS_ROOT_BETTER,
            PageNames.EXAMS_ROOT,
            PageNames.EXAM_SUMMARY,
            PageNames.LESSON_SUMMARY,
          ].includes(this.$route.name) && Object.keys(this.filteredLearnMap.value).length > 0
        );
      },
      classLearnersListRoute() {
        const { query } = this.$route;
        const route = {
          name: ClassesPageNames.CLASS_LEARNERS_LIST_VIEWER,
          params: {
            id: this.classId,
          },
          query: {
            ...query,
            ...pickBy({
              last: LastPages.RESOURCE_LEARNER_LIST_BY_GROUPS,
            }),
          },
        };
        return route;
      },
    },
    mounted() {
      this.isPolling = true;
      this.pollClassListSyncStatuses();
    },
    beforeDestroy() {
      this.isPolling = false;
    },
    methods: {
      ...mapActions(['fetchUserSyncStatus']),
      pollClassListSyncStatuses() {
        this.fetchUserSyncStatus({ member_of: this.$route.params.classId }).then(data => {
          const userSet = new Set(data.map(item => item.user));
          this.filteredLearnMap.value = Object.fromEntries(
            Object.entries(this.learnerMap).filter(([key]) => userSet.has(key)),
          );
        });
        if (this.isPolling) {
          setTimeout(() => {
            this.pollClassListSyncStatuses();
          }, '10000');
        }
      },
    },
    $trs: {
      viewLearners: {
        message: 'View learner devices',
        context:
          "Option in the Reports > Quizzes section which allows coach to view a list of the learners' devices.\n\nLearner devices are ones that have Kolibri features for learners, but not those for coaches and admins.",
      },
    },
  };

</script>


<style lang="scss" scoped>

  .report-controls {
    position: relative;
    min-height: 40px;
    padding-right: 80px;
  }

  .report-controls-buttons {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }

  .learner-device-link {
    margin-right: 10px;
    font-size: 14px;
  }

</style>
