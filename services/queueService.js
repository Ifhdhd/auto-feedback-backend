const queues = {};

function add(userId, job) {
  if (!queues[userId]) queues[userId] = [];

  queues[userId].push(job);

  if (queues[userId].length === 1) run(userId);
}

async function run(userId) {
  const queue = queues[userId];

  while (queue.length) {
    const job = queue[0];
    await job();
    queue.shift();
  }
}

module.exports = { add };
