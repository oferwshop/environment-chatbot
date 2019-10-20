const _ = require('lodash')
const { isTextInput, isHebrew, getDate, getReply, getResponseType, getReplyWithUser, getReplyAndEmail } = require('./helpers')

const { hasMids, setEnglish, handleConversationState, isDisabled, getMainScriptStarted, setMainScriptStarted, initConversation } = require('./app-state')

function getChatbotResponse(webhook_event, sender_psid) {
    console.log("**** Received webhook:", JSON.stringify(webhook_event))

    handleConversationState(webhook_event)

    if (isDisabled(webhook_event)) return console.log("*** BOT DISABLED ") 
    
    const initialType = getResponseType(webhook_event)

    if (isTextInput(initialType) && !hasMids(webhook_event)) setEnglish(webhook_event, !isHebrew(webhook_event))

    const type = getActualType(initialType, webhook_event)
    console.log("**** Response Initial and Actual Type: " + initialType + "," + type)

    return type === 'thank-you' && getReplyAndEmail(webhook_event, 'thank-you', sender_psid, _.get(webhook_event, 'message.text'))
      || type === 'get-waiver' && getReply(webhook_event, 'get-waiver')
      || type === 'quick-reply' && getReply(webhook_event, webhook_event.message.quick_reply.payload)
      || type === 'button-postback' && getReplyWithUser(webhook_event, webhook_event.postback.payload, sender_psid)
      || type === 'general-info' && getReply(webhook_event, 'general-info')
      || type === 'schedule' && getReply(webhook_event, 'schedule')
      || type === 'date' && getReply(webhook_event, getDate(webhook_event))
      || type === 'price-inquiry' && getReplyWithUser(webhook_event, 'price-inquiry', sender_psid)
      || type === 'greetings-location' && getReplyWithUser(webhook_event, 'greetings-location', sender_psid)
      || type === 'back-to-beginning' && getReplyWithUser(webhook_event, 'back-to-beginning', sender_psid)
    }


const getActualType = (type, webhook_event) => {
  if (type === 'greetings-location'){
    if (getMainScriptStarted(webhook_event)) return 'back-to-beginning'
    setMainScriptStarted(webhook_event, true)
  }
  if (type === 'button-postback' && _.get(webhook_event, 'postback.payload') === 'restart'){
    initConversation(webhook_event)
    setMainScriptStarted(webhook_event, true)
    return 'greetings-location'
  }
  return type
}

module.exports = getChatbotResponse