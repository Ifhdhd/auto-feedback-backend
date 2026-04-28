const queues = new Map(); // userId => queue
const running = new Map(); // userId => boolean

function addJob(userId, job) {
  if (!queues.has(userId)) {
    queues.set(userId, []);
  }

  queues.get(userId).push(job);

  processQueue(userId);
}

async function processQueue(userId) {
  if (running.get(userId)) return; // 🔥 anti bentrok

  running.set(userId, true);

  const queue = queues.get(userId);

  while (queue.length > 0) {
    const job = queue.shift();

    try {
      await job();
    } catch (err) {
      console.log("❌ JOB ERROR:", err.message);
    }
  }

  running.set(userId, false);
}

function isRunning(userId) {
  return running.get(userId) || false;
}

module.exports = {
  addJob,
  isRunning
};
