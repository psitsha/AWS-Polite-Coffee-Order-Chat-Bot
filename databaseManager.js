"use strict";

//creating an item that we will store in the databse
const uuidV1 = require('uuid/v1');
const AWS = require('aws-sdk');
const promisify = require('es6-promisify');
const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.saveOrderToDatabase() = function(coffeeType, coffeeSize){
    console.log('saveOrderToDatabase')

    //unique id to this order
    //putting drink and the size to the item
    const item = {};
    item.orderId = uuidV1();
    item.drink = coffeeType;
    item.size =  coffeeSize;

    //save to coffee-order-table
    const params = {
        TableName: 'coffee-order-table',
        Item: item
    };


    const putAsync = promisify(dynamo.put, dynamo);

    return putAsync(params).then(()=>{
        console.log(`Saving order ${JSON.stringify(item)}`);
        return item;  //if all goes fine, we return the whole item just created
    }).catch((error) => {
        Promise.reject(error);  //if not, return an error
    });
}