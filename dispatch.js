"use strict";
//taking care of the lambda

const orderCoffee = require("./orderCoffeeBot/orderCoffee"); //module taking care of CoffeeOrder intent
const greetUser = require("./greetUser");

module.exports = function(intentRequest) {
  //inputing an event and not a callback anymore
  console.log(
    `dispatch userId=${intentRequest.userId}, intentName=${
      intentRequest.currentIntent.name
    }`
  );
  const intentName = intentRequest.currentIntent.name;

  console.log(intentName + " was called");
  if (intentName === "CoffeeOrder") {
    return orderCoffee(intentRequest); //Now all our drink need to return a promise
  }

  if (intentName === "GreetingIntent") {
    return greetUser(intentRequest);
  }

  throw new Error(`Intent with name ${intentName} not supported`);
};
