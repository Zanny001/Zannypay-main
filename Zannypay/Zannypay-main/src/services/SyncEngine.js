import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@zannypay_sync_queue';

export const SyncEngine = {
  // Add a failed action to the queue
  enqueue: async (actionType, payload) => {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      
      queue.push({
        id: Date.now().toString(),
        type: actionType,
        payload,
        timestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log(`[SyncEngine] Queued action: ${actionType}`);
    } catch (e) {
      console.error('[SyncEngine] Failed to enqueue action', e);
    }
  },

  // Process the queue when connection is restored. Pass a `retryHandler`
  // (e.g. one that re-fires the original apiPost call) to actually replay
  // queued requests; items that fail again stay queued for next time.
  processQueue: async (retryHandler) => {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_KEY);
      if (!existingQueue) return;

      const queue = JSON.parse(existingQueue);
      if (queue.length === 0) return;

      console.log(`[SyncEngine] Processing ${queue.length} queued items...`);

      if (!retryHandler) {
        // No handler provided — nothing to safely retry, leave the queue intact.
        return;
      }

      const remaining = [];
      for (const item of queue) {
        try {
          await retryHandler(item);
        } catch (e) {
          console.log(`[SyncEngine] Retry failed for ${item.type}, keeping queued:`, e.message);
          remaining.push(item);
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      console.log(`[SyncEngine] Queue processed. ${remaining.length} item(s) still pending.`);
    } catch (e) {
      console.error('[SyncEngine] Failed to process queue', e);
    }
  }
};
