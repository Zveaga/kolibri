import { ref } from 'vue';

const steps = ref([]);
const tourActive = ref(false);

function registerStep({ key, content, stepIndex }) {
  if (!key) {
    console.warn(`Missing key for step:`, { content, stepIndex });
    return;
  }
  steps.value.push({ key, content, stepIndex });
}

function startTour() {
  steps.value.sort((a, b) => a.stepIndex - b.stepIndex);
  tourActive.value = true;
}

function endTour() {
  tourActive.value = false;
}

export default function useTour() {
  return {
    steps,
    tourActive,
    registerStep,
    startTour,
    endTour,
  };
}
