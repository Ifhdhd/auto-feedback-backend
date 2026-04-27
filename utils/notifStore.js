let notifications = [];

function addNotif(notif) {
  notifications.unshift(notif);
}

function getNotif() {
  return notifications;
}

module.exports = {
  addNotif,
  getNotif
};
