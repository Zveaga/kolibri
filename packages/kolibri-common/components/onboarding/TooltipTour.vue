<template>
  <div>
    <div v-if="showOverlay" class="spotlight-overlay" :style="overlayStyle"></div>
    <slot></slot>
  </div>
</template>
<script>
import tippy from "tippy.js";
export default {
  name: 'TooltipTour',
  props: {
    steps: { type: Array, required: true },
    elements: { type: Array, required: true },
  },
  data() {
    return {
      currentStepIndex: 0,
      tippyInstance: null,
      showOverlay: false,
      overlayStyle: {},
    };
  },
  methods: {
    showTooltip() {
      if (this.tippyInstance) this.tippyInstance.destroy();
      this.$nextTick(() => {
        const currentStep = this.steps[this.currentStepIndex];
        if (!currentStep) {
          console.warn(
            `No step found at index ${this.currentStepIndex} in steps:`,
            this.steps
          );
          return;
        }
        const target = this.elements.find(
          (el) => el.key === currentStep.key
        )?.el;


        if (!target) {
          console.warn(`Element for step "${currentStep.key}" not found`);
          return;
        }
        target.scrollIntoView({ behavior: "smooth", block: "center" });

        const rect = target.getBoundingClientRect();
        const offsetTop = 0;
        const heightFromTop = rect.top + rect.height;

        this.overlayStyle = {
          position: "fixed",
          left: `${rect.left}px`,
          top: `${offsetTop}px`,
          width: `${rect.width}px`,
          height: `${heightFromTop}px`,
          borderRadius: "4px",
          boxShadow:
            "0 0 0 10000px rgba(0, 0, 0, 0.5), 0px 0px 0px 0px rgba(0,0,0,0.3) inset",
          zIndex: 998,
          pointerEvents: "none",
        };
        this.showOverlay = true;
        this.tippyInstance = tippy(target, {
          content: this.getTooltipContent(),
          allowHTML: true,
          placement: "right-start",
          interactive: true,
          trigger: "manual",
          appendTo: document.body,
          arrow: false,
          theme: "onboarding",
          animateFill: true,
          popperOptions: {
            modifiers: {
              offset: {
                offset: "50, 0",
              },
            },
          },
          onShow: () => {
            setTimeout(() => {
              document
                .querySelector(".continue-btn")
                ?.addEventListener("click", this.nextStep);
              document
                .querySelector(".close-btn")
                ?.addEventListener("click", this.endTour);
            }, 10);
          },
        });


        this.tippyInstance.show();
      });
    },
    getTooltipContent() {
      return `
        <div class="onboarding-tooltip">
          <div class="onboarding-tooltip-header">
            <div class="onboarding-tooltip-progress">
              ${this.steps
          .map(
            (_, i) =>
              `<span class="dot ${i === this.currentStepIndex ? "active" : ""
              }"></span>`
          )
          .join("")}
            </div>
            <button class="close-btn" aria-label="Close">✖</button>
          </div>
          <div class="onboarding-tooltip-body">
            <p>${this.steps[this.currentStepIndex].content}</p>
          </div>
          <div class="onboarding-tooltip-footer">
            ${this.currentStepIndex > 0
          ? `<button class="back-btn">Back</button>`
          : ""
        }

            <button class="continue-btn">${this.currentStepIndex === this.steps.length - 1
          ? "Finish"
          : "Continue"
        }</button>
          </div>
        </div>
      `;
    },
    nextStep() {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.showTooltip();
      } else {
        this.endTour();
      }
    },
    endTour() {
      this.$emit("tourEnded");
      if (this.tippyInstance) this.tippyInstance.destroy();
      this.currentStepIndex = 0;
      this.showOverlay = false;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.showTooltip();
    });


  },
};
</script>
<style>
.spotlight-overlay {
  transition: all 0.3s ease;
}



.tippy-tooltip.onboarding-theme {
  width: 328px;
  gap: 16px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  color: #333;
  font-family: "Roboto", sans-serif;
  z-index: 999;
}


.onboarding-tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.onboarding-tooltip-progress {
  display: flex;
  gap: 6px;
}


.dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
}


.dot.active {
  background: #4368f5;
}


.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #000000;
}


.onboarding-tooltip-body {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.5;
}


.tippy-tooltip.onboarding-theme[data-animatefill] {
  background-color: transparent;
}

.tippy-tooltip.onboarding-theme .tippy-backdrop {
  background-color: white;
}

.onboarding-tooltip-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 10px;
  align-items: center;
}


.continue-btn {
  background: #eeeeee;
  border: none;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  gap: 10px;
  color: #212121;
  text-transform: uppercase;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
}


.continue-btn:hover {
  background: #e0e0e0;
}


.back-btn {
  background: none;
  border: none;
  padding: 15px 16px;
  border-radius: 2px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  color: #212121;
  text-transform: uppercase;
}
</style>