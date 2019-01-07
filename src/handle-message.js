const request = require('request');
const fs = require('fs');
const path = require("path");
const callSendAPI = require('./call-send-api')
const getNextMessage = require('./get-next-message')
 
// Handles messages events
async function handleMessage(sender_psid, webhook_event) {

    const nextMessage = await getNextMessage(webhook_event)

    const response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": nextMessage.text,//`אהלן ${name}, מתי מתאים לך לבוא להתאמן \u23F3 ?`,
          "buttons": nextMessage.buttons
        }
      }
    }

     
  // Send the response message
  callSendAPI(sender_psid, response);   
  }

  module.exports = handleMessage