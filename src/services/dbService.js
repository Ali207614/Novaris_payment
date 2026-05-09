exports.executeParam = function (query, param) {
  return new Promise((resolve) => {
    console.log("Mocked dbService.executeParam called");
    resolve([]);
  });
};

exports.execute = function (query) {
  return new Promise((resolve) => {
    console.log("Mocked dbService.execute called");
    resolve([]);
  });
};

exports.executeBatch = function (query, data) {
  return new Promise((resolve) => {
    console.log("Mocked dbService.executeBatch called");
    resolve([]);
  });
};

exports.setAutocommit = function (value) {
  console.log("Mocked dbService.setAutocommit called");
  return true;
};

exports.rollback = function () {
  return new Promise((resolve) => {
    console.log("Mocked dbService.rollback called");
    resolve(null);
  });
};

exports.commit = function () {
  return new Promise((resolve) => {
    console.log("Mocked dbService.commit called");
    resolve(null);
  });
};