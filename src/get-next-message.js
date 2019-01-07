const request = require('request');
const fs = require('fs');
const path = require("path");
const { ageButtons } = require('./button-sets')

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

async function getNextMessage(webhook_event, sender_psid) {

    if (webhook_event.message) return {
        text: await getMessageResponse(webhook_event.message.text),
        buttons: ageButtons
    }
    return {
        text: webhook_event.postback.title,
        buttons: ageButtons
    }
      
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
          name = bodyObj.first_name;
          resolve(name)
        }
        }
    )})

    const helloAgeTxt = fs.readFileSync(path.resolve(__dirname, './messages/hello-age.txt')).toString()

    return helloAgeTxt.replace('[user_name]', name)
}

module.exports = getNextMessage