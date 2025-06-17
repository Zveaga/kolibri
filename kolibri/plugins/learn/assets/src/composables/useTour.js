import { ref } from "vue";


const steps = ref([]);
const elements = ref([]);
const tourActive = ref(false);


function registerStep({ key, el, content, stepIndex }) {
  if (!el) {
    console.warn(`Element for key "${key}" is null. Skipping this step.`);
    return;
  }
  steps.value.push({ key, content, stepIndex });
  elements.value.push({ key, el, stepIndex });
}


function startTour() {
  steps.value.sort((a, b) => a.stepIndex - b.stepIndex);
  elements.value.sort((a, b) => a.stepIndex - b.stepIndex);
  tourActive.value = true;
}


function endTour() {
  tourActive.value = false;
}


export default function useTour() {
  return {
    steps,
    elements,
    tourActive,
    registerStep,
    startTour,
    endTour,
  };
}
