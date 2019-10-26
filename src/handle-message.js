const _ = require('lodash')
const callSendAPI = require('./call-send-api')
const getChatbotResponse = require('./chatbot-response')
 

const sendSingleResponse = async (chatbotResponse, sender_psid) => {
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
        : _.assign({ text }, quick_replies ? { quick_replies } : null)
      )
  console.log("**** RESPONDING WITH: ", JSON.stringify(response))

  // Send the response message
  return await callSendAPI(sender_psid, response);   
}

async function handleMessage(sender_psid, webhook_event) {

    const chatbotResponse = await getChatbotResponse(webhook_event, sender_psid)
    if (!chatbotResponse) return
    const responseArray = [].concat(chatbotResponse)
    for (let index = 0; index < responseArray.length; index++) {
      setTimeout(() => sendSingleResponse(responseArray[index], sender_psid), index * 2000)
  }
}

  module.exports = handleMessage