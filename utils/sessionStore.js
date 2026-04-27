const sessions = {};

function createSession(cookies) {
  const token = Date.now() + "_" + Math.random();

  sessions[token] = {
    cookies,
    createdAt: Date.now()
  };

  return token;
}

function getSession(token) {
  return sessions[token];
}

module.exports = {
  createSession,
  getSession
};
