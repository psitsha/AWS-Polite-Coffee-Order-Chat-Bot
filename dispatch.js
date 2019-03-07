"use strict";
//taking care of the lambda

const orderCoffee = require("./orderCoffeeBot/orderCoffee"); //module taking care of CoffeeOrder intent

module.exports = function(intentRequest) {
  //inputing an event and not a callback anymore
  console.log(
    `dispatch userId=${intentRequest.userId}, intentName=${
      intentRequest.currentIntent.name
    }`
  );
  const intentName = intentRequest.currentIntent.name;

  if (intentName === "CoffeeOrder") {
    console.log(intentName + " was called");
    return orderCoffee(intentRequest); //Now all our drink need to return a promise
  }

  throw new Error(`Intent with name ${intentName} not supported`);
};
