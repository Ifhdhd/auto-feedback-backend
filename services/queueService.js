const queues = new Map();

function add(userId, job) {
  if (!queues.has(userId)) {
    queues.set(userId, []);
  }

  const queue = queues.get(userId);
  queue.push(job);

  if (queue.length === 1) run(userId);
}

async function run(userId) {
  const queue = queues.get(userId);

  if (!queue || queue.length === 0) return;

  const job = queue[0];

  try {
    await job();
  } catch (e) {
    console.log("QUEUE ERROR:", e.message);
  }

  queue.shift();

  if (queue.length > 0) {
    run(userId);
  }
}

module.exports = { add };
