"use strict";

const lexResponses = require("./lexResponses");

module.exports = function(intentRequest, callback) {
  let coffeeType = intentRequest.currentIntent.slots.coffee;
  let coffeeSize = intentRequest.currentIntent.slots.size;
  console.log(coffeeSize + " " + coffeeType);

  const source = intentRequest.invocationSource;
  if (source === "DialogCodeHook") {
    callback(
      lexResponses.delegate(
        intentRequest.sessionAttributes,
        intentRequest.currentIntent.slots
      )
    );
    return;
  }
};
