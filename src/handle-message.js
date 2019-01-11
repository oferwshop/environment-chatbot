const callSendAPI = require('./call-send-api')
const getNextMessage = require('./get-next-message')
 
// Handles messages events
async function handleMessage(sender_psid, webhook_event) {

    const nextMessage = await getNextMessage(webhook_event, sender_psid)
    console.log(`*** TO SEND : ****: ${JSON.stringify(webhook_event)}`)

    const response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": nextMessage ? nextMessage.text : null,//`אהלן ${name}, מתי מתאים לך לבוא להתאמן \u23F3 ?`,
          "buttons": nextMessage ? nextMessage.buttons: null
        }
      }
    }

     
  // Send the response message
  callSendAPI(sender_psid, response);   
  }

  module.exports = handleMessage