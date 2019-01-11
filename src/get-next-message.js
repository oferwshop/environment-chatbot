const request = require('request');
const fs = require('fs');
const path = require("path");
const _ = require('lodash')
const buttonSets = require('./button-sets')

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

async function getNextMessage(webhook_event, sender_psid) {
    console.log("*** Getting next message ***")
    console.log("Received webhook:")
    console.log(JSON.stringify(webhook_event))
    if (webhook_event.message) return {
        text: await getMessageResponse(webhook_event.message.text, sender_psid),
        buttons: buttonSets["greetings-age"]
    }
    if (_.get(webhook_event, 'postback.payload')) return getPostbackResponse(webhook_event.postback.payload)
}

async function getMessageResponse(message, sender_psid){
    const name = await new Promise((resolve, reject) => {
        request({
        url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
        qs: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "first_name"
        },
        method: "GET"
      }, function(error, response, body) {
        if (error) {
          console.log("Error getting user's name: " +  error);
          reject(error)
        } else {
          var bodyObj = JSON.parse(body);
          const name1 = bodyObj.first_name;
          resolve(name1)
        }
        }
    )})

    const helloAgeTxt = fs.readFileSync(path.resolve(__dirname, './messages/greetings-age.txt')).toString()

    return helloAgeTxt.replace('[user_name]', name)
}

const getPostbackResponse = (payload) => {
    const text = fs.readFileSync(path.resolve(__dirname, `./messages/${payload}.txt`)).toString()
    return _.assign({ text }, buttonSets[payload] || null )
}

module.exports = getNextMessage