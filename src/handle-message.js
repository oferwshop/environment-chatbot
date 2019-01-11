const _ = require('lodash')
const callSendAPI = require('./call-send-api')
const getNextMessage = require('./get-next-message')
 
// Handles messages events
async function handleMessage(sender_psid, webhook_event) {

    const nextMessage = await getNextMessage(webhook_event, sender_psid)
    if (!nextMessage) return
    const { buttons, quick_replies, text } = nextMessage
    const response = nextMessage.buttons ? {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": nextMessage.text,
          buttons
        }
      }
    }
      : _.assign({ text }, quick_replies ? { quick_replies } : null)

     
  // Send the response message
  callSendAPI(sender_psid, response);   
  }

  module.exports = handleMessage