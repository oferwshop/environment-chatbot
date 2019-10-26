const _ = require('lodash')
const callSendAPI = require('./call-send-api')
const getChatbotResponse = require('./chatbot-response')
 
// Handles messages events
async function handleMessage(sender_psid, webhook_event) {

    const chatbotResponse = await getChatbotResponse(webhook_event, sender_psid)
    if (!chatbotResponse) return

    const { buttons, quick_replies, text, attachment } = chatbotResponse

    const response = buttons ? {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text": text,
          buttons
        }
      }
    }
      : ( attachment ? { attachment }
        : _.assign({ text,
          "attachment":{"type":"image",
          "payload":{"url":"https://octopusmartialartsfitness.files.wordpress.com/2019/10/luz.jpg",
          "is_reusable":true}} }, quick_replies ? { quick_replies } : null)
      )
  console.log("**** RESPONDING WITH: ", JSON.stringify(response))

  // Send the response message
  callSendAPI(sender_psid, response);   
  }

  module.exports = handleMessage