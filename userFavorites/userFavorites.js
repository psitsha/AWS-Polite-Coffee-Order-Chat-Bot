"use strict";

const databaseManager = require("../databaseManager");

module.exports = function(userId, drink, size) {
  console.log(userId + " " + drink + " " + size);

  //calls database manager and save to the database
  databaseManager.saveUserToDatabase(userId, drink, size).then(item => {
    console.log(item);
  });
};
