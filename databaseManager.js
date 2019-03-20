"use strict";

//creating an item that we will store in the databse
const uuidV1 = require("uuid/v1");
const AWS = require("aws-sdk");
const promisify = require("es6-promisify");
const _ = require("lodash");
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.saveOrderToDatabase = function(userId, coffeeType, coffeeSize) {
  console.log("saveOrderToDatabase");

  //unique id to this order
  //putting drink and the size to the item
  const item = {};
  item.orderId = uuidV1();
  item.drink = coffeeType;
  item.size = coffeeSize;
  item.userId = userId;

  return saveItemToTable("coffee-order-table", item);
};

module.exports.saveUserToDatabase = function(userId, coffeeType, coffeeSize) {
  console.log("saveUserToDatabase");

  const item = {};
  item.drink = coffeeType;
  item.size = coffeeSize;
  item.userId = userId;

  return saveItemToTable("coffee-user-table", item);
};

module.exports.findUserFavorite = function(userId) {
  const params = {
    TableName: "coffee-user-table",
    Key: {
      userId
    }
  };

  const getAsync = promisify(dynamo.get, dynamo);

  return getAsync(params).then(response => {
    if (_.isEmpty(response)) {
      console.log(`User with userId:${userId} not found`);
      return Promise.reject(new Error(`User with userId:${userId} not found`));
    }
    return response.Item;
  });
};

function saveItemToTable(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item
  };

  const putAsync = promisify(dynamo.put, dynamo);

  return putAsync(params)
    .then(() => {
      console.log(`Saving item ${JSON.stringify(item)}`);
      return item; //if all goes fine, we return the whole item just created
    })
    .catch(error => {
      Promise.reject(error); //if not, return an error
    });
}
