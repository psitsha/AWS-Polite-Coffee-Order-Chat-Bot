"use strict";

const lexResponses = require("./lexResponses");

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
    //Latte and cappuccino can be normal/regular or large
    if (
      (coffeeType.toLowerCase() === "cappuccino" ||
        coffeeType.toLowerCase() === "latte") &&
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

    //Americano is always normal/regular
    if (
      coffeeType.toLowerCase() === "americano" &&
      coffeeSize.toLowerCase() !== "normal" &&
      coffeeSize.toLowerCase() !== "regular"
    ) {
      return buildValidationResult(
        false,
        "size",
        `We do not have ${coffeeType} in that size. Normal is the available sizes for that drink.`
      );
    }
  }

  return buildValidationResult(true, null, null);
}

module.exports = function(intentRequest, callback) {
  let coffeeType = intentRequest.currentIntent.slots.coffee;
  let coffeeSize = intentRequest.currentIntent.slots.size;
  console.log(coffeeSize + " " + coffeeType);

  const source = intentRequest.invocationSource;

  //dialogCodeHook for validation of input not fullfillment
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
          validationResult.violatedSlot
        )
      );
    }

    callback(
      lexResponses.delegate(
        intentRequest.sessionAttributes,
        intentRequest.currentIntent.slots
      )
    );
    return;
  }
};
