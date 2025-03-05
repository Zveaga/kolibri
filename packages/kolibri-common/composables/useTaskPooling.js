import { ref, onMounted, onUnmounted } from 'vue';
import { useTimeoutPoll } from '@vueuse/core';

const taskPollers = new Map();

export function useTaskPooling(queueName, fetchTaskFunction, interval = 5000){
   if(!taskPollers.has(queueName)){
    const consumers = ref(0);
    const tasks = ref([]);

    const {pause, resume, isActive} = useTimeoutPoll(async () => {
         try{
            tasks.value = await fetchTaskFunction();
         }
          catch(e){
              console.error(e);
          }
    }, interval, { immediate: true });

    //TO DECIDE if the key should be uniquely
    // identified by the queueName,
    // queueName + fetchTaskFunction or queueName + fetchTaskFunction + interval
    taskPollers.set(queueName, { consumers, tasks, pause, resume, isActive });

  }

  const poller = taskPollers.get(queueName);
  poller.consumers.value++;

  onMounted(() => {
    if (!poller.isActive) {
      poller.resume();
    }
  });

  onUnmounted(() => {
    poller.consumers.value--;
    if (poller.consumers.value === 0) {
      poller.pause();
      taskPollers.delete(queueName);
    }
  });

   return { tasks: poller.tasks };

}





