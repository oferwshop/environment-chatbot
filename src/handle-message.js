const request = require('request');
const fs = require('fs');
const path = require("path");
const callSendAPI = require('./call-send-api')

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';
 
const helloTxt = fs.readFileSync(path.resolve(__dirname, './messages/hello.txt')).toString()

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;
    // Checks if the message contains text
    if (received_message.text) {    
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
  
      var name = "";
  
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
        } else {
          var bodyObj = JSON.parse(body);
          name = bodyObj.first_name;
        }
       
  
      response = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": helloTxt.replace('[user_name]', name),//`אהלן ${name}, מתי מתאים לך לבוא להתאמן \u23F3 ?`,
            "buttons":[
              {
                "type":"postback",
                "payload": 'AU_LOC_PROVIDED',
                "title": 'בוקר'
              },
              {
                "type":"postback",
                "payload": 'AUSTRA44LIA_YE',
                "title": 'ערב'
              }
            ]
          }
        }
      }
  
       
    // Send the response message
    callSendAPI(sender_psid, response);    
  
    })
    
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
       
    // Send the response message
    callSendAPI(sender_psid, response);    
    } 
   
  }

  module.exports = handleMessage