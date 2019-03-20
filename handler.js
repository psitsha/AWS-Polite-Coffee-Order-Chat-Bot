"use strict";

const dispatch = require("./dispatch");
const userFavorites = require("./userFavorites/userFavorites");

module.exports.intents = (event, context, callback) => {
  try {
    console.log(`event.bot.name=${event.bot.name}`);
    dispatch(event).then(response => {
      //dispatch return a promise not a callback
      callback(null, response);
    });
  } catch (err) {
    callback(err);
  }
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.saveUserFavorites = (event, context, callback) => {
  console.log("saveUserFavorites lambda called");

  //getting the item that will come in the event
  console.log(event);
  let item = event.Records[0].dynamodb.NewImage;
  console.log(item);

  //pass item to the favourites
  //item comes with .S coz its image from the stream
  //get the .S coz its a string (thats the exact element like value - part of the attibute of objects)
  userFavorites(item.userId.S, item.drink.S, item.size.S);
  callback(null, null);
};
