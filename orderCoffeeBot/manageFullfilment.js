"use strict";

const lexResponses = require("../lexResponses");
const databaseManager = require("../databaseManager");

//return of an object that will return fullfilment state and message
function buildFulfilmentResult(fullfilmentState, messageContent) {
  return {
    fullfilmentState,
    message: { contentType: "PlainText", content: messageContent }
  };
}

function fullfilOrder(userId, coffeeType, coffeeSize) {
  return databaseManager
    .saveOrderToDatabase(userId, coffeeType, coffeeSize)
    .then(item => {
      return buildFulfilmentResult(
        "Fulfilled",
        `Thanks, your orderid ${
          item.orderId
        } has been placed and will be ready for pickup in the bar`
      );
    });
}

module.exports = function(intentRequest) {
  let coffeeType = intentRequest.currentIntent.slots.coffee;
  let coffeeSize = intentRequest.currentIntent.slots.size;
  let userId = intentRequest.userId;

  return fullfilOrder(userId, coffeeType, coffeeSize).then(fullfiledOrder => {
    return lexResponses.close(
      intentRequest.sessionAttributes,
      fullfiledOrder.fullfilmentState,
      fullfiledOrder.message
    );
  });
};
