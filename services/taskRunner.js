const { getTaskPage } = require("./taskService");

let store = {
  running: false,
  data: [],
  progress: 0,
};

async function startTaskProcess(cookies) {
  if (store.running) {
    return { success: false, message: "Masih berjalan" };
  }

  store = {
    running: true,
    data: [],
    progress: 0,
  };

  (async () => {
    try {
      let page = 1;

      while (true) {
        const res = await getTaskPage(cookies, page);

        if (!res.success) break;

        const list = res.data?.data || [];

        if (list.length === 0) break;

        store.data = store.data.concat(list);
        store.progress = store.data.length;

        console.log(`Page ${page} → ${list.length}`);

        page++;

        await new Promise(r => setTimeout(r, 800));
      }

      store.running = false;
      console.log("✅ SELESAI AMBIL TASK");

    } catch (e) {
      console.log("ERROR:", e.message);
      store.running = false;
    }
  })();

  return { success: true, message: "Mulai ambil task" };
}

function getStatus() {
  return {
    running: store.running,
    progress: store.progress,
  };
}

function getResult() {
  return {
    success: true,
    total: store.data.length,
    data: store.data,
  };
}

// 🔥 ambil hanya yang valid
function getValidTasks() {
  return store.data
    .map(i => ({
      id: i.id,
      addressId: i.addressBo?.addressId
    }))
    .filter(i => i.id && i.addressId);
}

module.exports = {
  startTaskProcess,
  getStatus,
  getResult,
  getValidTasks,
};
