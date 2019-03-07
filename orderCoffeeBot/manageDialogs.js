"use strict";

const lexResponses = require("../lexResponses");
const databaseManager = require("../databaseManager");

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

function buildUserFavoriteResult(coffee, size, messageContent) {
  return {
    coffee,
    size,
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

function findUserFavorite(userId) {
  return databaseManager.findUserFavorite(userId).then(item => {
    return buildUserFavoriteResult(
      item.drink,
      item.size,
      `Would you like to order a ${item.size} ${item.drink}?`
    );
  });
}

module.exports = function(intentRequest) {
  let coffeeType = intentRequest.currentIntent.slots.coffee;
  let coffeeSize = intentRequest.currentIntent.slots.size;
  let userId = intentRequest.userId;
  const slots = intentRequest.currentIntent.slots;

  if (coffeeType === null && coffeeSize === null) {
    return findUserFavorite(userId)
      .then(item => {
        slots.size = item.size;
        slots.coffee = item.coffee;
        //Ask the user if he will like to order this item
        return lexResponses.confirmIntent(
          intentRequest.sessionAttributes,
          intentRequest.currentIntent.name,
          slots,
          item.message
        );
      })
      .catch(error => {
        //Need to ask the user what they want coffee they want?
        return lexResponses.delegate(
          intentRequest.sessionAttributes,
          intentRequest.currentIntent.slots
        );
      });
  } else {
    const validationResult = validateCoffeeOrder(coffeeType, coffeeSize);

    if (!validationResult.isValid) {
      slots[`${validationResult.violatedSlot}`] = null;
      return Promise.resolve(
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
    return Promise.resolve(
      lexResponses.delegate(
        intentRequest.sessionAttributes,
        intentRequest.currentIntent.slots
      )
    );
  }
};
