let result = {
  success: false
};

function setResult(data) {
  result = data;
}

function getResult() {
  return result;
}

module.exports = {
  setResult,
  getResult
};
