const _ = require('lodash')
const { isTextInput, getLang , getDate, getReply, getResponseType, getReplyWithUser, getReplyAndEmail } = require('./helpers')

const { getUserHooksCount, hasMids, setLanguage, getEnglish, handleConversationState, isDisabled, getMainScriptStarted, setMainScriptStarted, initConversation } = require('./app-state')

function getChatbotResponse(webhook_event, sender_psid) {
    const isFirstMessage = getUserHooksCount(webhook_event) === 0
    
    handleConversationState(webhook_event)

    if (isDisabled(webhook_event)) return console.log("*** BOT DISABLED ") 
    
    const initialType = getResponseType(webhook_event, { isFirstMessage })

    const messageText = _.get(webhook_event, 'message.text', _.get(webhook_event, 'postback.title'))
    if (messageText && !hasMids(webhook_event)) setLanguage(webhook_event, getLang(messageText))

    const isEcho = isTextInput(initialType, webhook_event) && !webhook_event.message

    const type = getActualType(initialType, webhook_event)
    console.log("**** Response Initial and Actual Type: " + initialType + "," + type)

    if (isEcho) return

    return type === 'bot-command' && getReply(webhook_event, 'bot-command')
      || type === 'thank-you' && getReplyAndEmail(webhook_event, 'thank-you', sender_psid, _.get(webhook_event, 'message.text'))
      || type === 'get-waiver' && getReplyWithUser(webhook_event, 'get-waiver', sender_psid )
      || type === 'contact-details-left' && getReply(webhook_event, 'contact-details-left')
      || type === 'quick-reply' && getReply(webhook_event, webhook_event.message.quick_reply.payload)
      || type === 'button-postback' && getReplyWithUser(webhook_event, webhook_event.postback.payload, sender_psid)
      || type === 'tel-aviv' && getReply(webhook_event, 'tel-aviv')
      || type === 'hertzlia' && getReply(webhook_event, 'hertzlia')
      || type === 'kadima' && getReply(webhook_event, 'kadima')
      || type === 'kfar-bilu' && getReply(webhook_event, 'kfar-bilu')
      || type === 'misgav' && getReply(webhook_event, 'misgav')
      || type === 'general-info' && getReply(webhook_event, 'general-info')
      || type === 'military-info' && getReply(webhook_event, 'military-info')
      || type === 'kids-info' && getReply(webhook_event, 'kids-info')
      || type === 'parking-info' && getReply(webhook_event, 'parking-info')
      || type === 'muay-thai-info' && getReplyWithUser(webhook_event, 'muay-thai-info', sender_psid)
      || type === 'end-conversation' && getReply(webhook_event, 'end-conversation')
      || type === 'sticker' && getReply(webhook_event, 'end-conversation')
      || type === 'schedule' && getReplyWithUser(webhook_event, 'schedule-combined', sender_psid)
      || type === 'schedule-price' && getReplyWithUser(webhook_event, 'schedule-price-combined', sender_psid)
      || type === 'date' && getReply(webhook_event, getDate(webhook_event))
      || type === 'price-inquiry' && getReplyWithUser(webhook_event, 'price-inquiry', sender_psid)
      || type === 'greetings-location' && getReplyWithUser(webhook_event, 'greetings-location', sender_psid)
      || type === 'back-to-beginning' && getReplyWithUser(webhook_event, 'back-to-beginning', sender_psid)
      || getReplyWithUser(webhook_event, type, sender_psid)
    }


const getActualType = (type, webhook_event) => {
  if (type === 'greetings-location'){
    if (getMainScriptStarted(webhook_event)) return 'back-to-beginning'
    setMainScriptStarted(webhook_event, true)
  }
  if (type === 'button-postback' && _.get(webhook_event, 'postback.payload') === 'restart' || type === 'restart'){
    const english = getEnglish(webhook_event)
    initConversation(webhook_event)
    setLanguage(webhook_event, english)
    setMainScriptStarted(webhook_event, true)
    return 'greetings-location'
  }
  return type
}

module.exports = getChatbotResponse