<template>

  <div class="onboarding-tooltip">
    <div class="onboarding-tooltip-header">
      <div class="onboarding-tooltip-progress">
        <span
          v-for="(step, index) in steps"
          :key="index"
          :class="['dot', { active: index === currentStepIndex }]"
        ></span>
      </div>
      <button
        class="close-btn"
        aria-label="Close"
        @click="$emit('close')"
      >
        ✖
      </button>
    </div>
    <div class="onboarding-tooltip-body">
      <p>{{ steps[currentStepIndex].content }}</p>
    </div>
    <div class="onboarding-tooltip-footer">
      <KButton
        v-if="currentStepIndex > 0"
        :primary="false"
        appearance="flat-button"
        class="back-btn"
        @click="$emit('back')"
      >
        Back
      </KButton>
      <KButton
        secondary
        @click="$emit('next')"
      >
        {{ currentStepIndex === steps.length - 1 ? 'Finish' : 'Continue' }}
      </KButton>
    </div>
  </div>

</template>


<script>

  export default {
    name: 'TooltipContent',
    props: {
      steps: Array,
      currentStepIndex: Number,
    },
  };

</script>
