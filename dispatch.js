"use strict";
//taking care of the lambda

const orderCoffee = require("./orderCoffee"); //module taking care of CoffeeOrder intent

module.exports = function(intentRequest, callback) {
  console.log(
    `dispatch userId=${intentRequest.userId}, intentName=${
      intentRequest.currentIntent.name
    }`
  );
  const intentName = intentRequest.currentIntent.name;

  if (intentName === "CoffeeOrder") {
    console.log(intentName + " was called");
    return orderCoffee(intentRequest, callback);
  }

  throw new Error(`Intent with name ${intentName} not supported`);
};
