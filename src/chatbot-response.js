const _ = require('lodash')
const { getDate, getReply, getResponseType, getReplyWithUser, getReplyAndEmail } = require('./helpers')

const { handleConversationState, isDisabled } = require('./app-state')

function getChatbotResponse(webhook_event, sender_psid) {
    console.log("**** Received webhook:", JSON.stringify(webhook_event))

    handleConversationState(webhook_event)

    if (isDisabled(webhook_event)) return console.log("*** BOT DISABLED ") 
    
    const type = getResponseType(webhook_event)
    console.log("**** Response Type: " + type)

    return type === 'thank-you' && getReplyAndEmail('thank-you', sender_psid, _.get(webhook_event, 'message.text'))
      || type === 'get-waiver' && getReply('get-waiver')
      || type === 'quick-reply' && getReply(webhook_event.message.quick_reply.payload)
      || type === 'button-postback' && getReplyWithUser(webhook_event.postback.payload, sender_psid)
      || type === 'general-info' && getReply('general-info')
      || type === 'schedule' && getReply('schedule')
      || type === 'date' && getReply(getDate(webhook_event))
      || type === 'price-inquiry' && getReplyWithUser('price-inquiry', sender_psid)
      || type === 'greetings-location' && getReplyWithUser('greetings-location', sender_psid)
    }

module.exports = getChatbotResponse