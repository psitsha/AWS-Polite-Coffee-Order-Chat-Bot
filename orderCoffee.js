"use strict";

const lexResponses = require("./lexResponses");
const databaseManager = require("./databaseManager");

const types = [
  "latte",
  "americano",
  "cappuccino",
  "expresso",
  "mocha",
  "macchiato",
  "black"
];
const sizes = ["single", "double", "normal", "regular", "large"];

//whenever the validation fails then the validation result constructor returns size or type that hs failed

function buildValidationResult(isValid, violatedSlot, messageContent) {
  if (messageContent == null) {
    return {
      isValid,
      violatedSlot
    };
  }
  return {
    isValid,
    violatedSlot,
    message: { contentType: "PlainText", content: messageContent }
  };
}

function validateCoffeeOrder(coffeeType, coffeeSize) {
  //checking if coffeeType and coffeesize exist in a list
  if (coffeeType && types.indexOf(coffeeType.toLowerCase()) === -1) {
    return buildValidationResult(
      false,
      "coffee",
      `We do not have ${coffeeType}, would you like a different coffee? Our most popular coffee is americano.`
    );
  }

  if (coffeeSize && sizes.indexOf(coffeeSize.toLowerCase()) === -1) {
    return buildValidationResult(
      false,
      "size",
      `We do not have ${coffeeSize}, would you like a different size of coffee? Our most popular size is regular.`
    );
  }

  if (coffeeType && coffeeSize) {
    //Latte, cappuccino, mocha and macchiato can be normal/regular or large
    if (
      (coffeeType.toLowerCase() === "cappuccino" ||
        coffeeType.toLowerCase() === "latte" ||
        coffeeType.toLowerCase() === "mocha" ||
        coffeeType.toLowerCase() === "macchiato") &&
      !(
        coffeeSize.toLowerCase() === "normal" ||
        coffeeSize.toLowerCase() === "regular" ||
        coffeeSize.toLowerCase() === "large"
      )
    ) {
      return buildValidationResult(
        false,
        "size",
        `We do not have ${coffeeType} in that size. Normal/Regular or large are the available sizes for that drink.`
      );
    }

    //Expresso can be single or double
    if (
      coffeeType.toLowerCase() === "expresso" &&
      !(
        coffeeSize.toLowerCase() === "single" ||
        coffeeSize.toLowerCase() === "double"
      )
    ) {
      return buildValidationResult(
        false,
        "size",
        `We do not have ${coffeeType} in that size. Single or double are the available sizes for that drink.`
      );
    }

    //Americano and black is always normal/regular
    if (
      coffeeType.toLowerCase() === "americano" &&
      !(
        coffeeSize.toLowerCase() === "normal" ||
        coffeeSize.toLowerCase() === "regular"
      )
    ) {
      return buildValidationResult(
        false,
        "size",
        `We do not have ${coffeeType} in that size. ${coffeeType} is only available in Normal/Regular sizes.`
      );
    }

    if (
      coffeeType.toLowerCase() === "black" &&
      !(
        coffeeSize.toLowerCase() === "normal" ||
        coffeeSize.toLowerCase() === "regular"
      )
    ) {
      return buildValidationResult(
        false,
        "size",
        `We do not have ${coffeeType} in that size. ${coffeeType} is only available in Normal/Regular sizes.`
      );
    }
  }

  return buildValidationResult(true, null, null);
}

//return of an object that will return fullfilment state and message
function buildFulfilmentResult(fullfilmentState, messageContent) {
  return {
    fullfilmentState,
    message: { contentType: "PlainText", content: messageContent }
  };
}

function fullfilOrder(coffeeType, coffeeSize) {
  console.log("fulfilOrder " + coffeeSize + " " + coffeeType);

  return databaseManager
    .saveOrderToDatabase(coffeeType, coffeeSize)
    .then(item => {
      console.log(item.orderId);

      return buildFulfilmentResult(
        "Fulfilled",
        `Thank you! Your orderid ${
          item.orderId
        } has been placedand will be ready for pickup in the bar`
      );
    });
}

module.exports = function(intentRequest, callback) {
  let coffeeType = intentRequest.currentIntent.slots.coffee;
  let coffeeSize = intentRequest.currentIntent.slots.size;
  console.log(coffeeSize + " " + coffeeType);

  const source = intentRequest.invocationSource;

  //DialogCodeHook for validation of input not fullfillment
  if (source === "DialogCodeHook") {
    const slots = intentRequest.currentIntent.slots;
    const validationResult = validateCoffeeOrder(coffeeType, coffeeSize);

    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      callback(
        lexResponses.elicitSlot(
          intentRequest.sessionAttributes,
          intentRequest.currentIntent.name,
          slots,
          validationResult.violatedSlot,
          validationResult.message
        )
      );
    }

    //If size is not defined then set it as regular
    if (coffeeSize == null) {
      intentRequest.currentIntent.slots.size = "regular";
    }

    callback(
      lexResponses.delegate(
        intentRequest.sessionAttributes,
        intentRequest.currentIntent.slots
      )
    );
    return;
  }

  //FulfilmentCodeHook fulfills the order on user confirmation
  if (source === "FulfillmentCodeHook") {
    console.log("FulfillmentCodeHook");

    return fullfilOrder(coffeeType, coffeeSize).then(fullfiledOrder => {
      callback(
        lexResponses.close(
          intentRequest.sessionAttributes,
          fullfiledOrder.fullfilmentState,
          fullfiledOrder.message
        )
      );
      return;
    });

    callback(
      lexResponses.close(intentRequest.sessionAttributes, "Fulfilled", {
        contentType: "PlainText",
        content: "Order was placed"
      })
    );
  }
};
