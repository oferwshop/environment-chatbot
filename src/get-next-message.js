const _ = require('lodash')
const { isSchedule, isPriceInquiry, getDate,
  isWaiver, getReply, isGeneralInfo, getReplyWithUser,
  getReplyAndEmail } = require('./helpers')


async function getNextMessage(webhook_event, sender_psid) {
    console.log("**** Received webhook:", JSON.stringify(webhook_event))

    const isQuickReply = _.get(webhook_event, 'message.quick_reply.payload')
    const isButtonPostback = _.get(webhook_event, 'postback.payload')
    const isPhoneNumber = _.get(webhook_event, 'message.nlp.entities.phone_number')
    const isEmail = _.get(webhook_event, 'message.nlp.entities.email')
    const isTextMessage = webhook_event.message
    const date = getDate(webhook_event)
    const isASchedule = isSchedule(webhook_event)
    const isAPriceInquiry = isPriceInquiry(webhook_event)
    const isAWaiver = isWaiver(webhook_event)
    const isAGeneralInfo = isGeneralInfo(webhook_event)
    
    const quickReplyPayload = isQuickReply && webhook_event.message.quick_reply.payload
    const postbackPayload = isButtonPostback && webhook_event.postback.payload
    const contactPayload = (isEmail || isPhoneNumber) &&  _.get(webhook_event, 'message.text')
    
    if (isPhoneNumber || isEmail) return await getReplyAndEmail('thank-you', sender_psid, contactPayload)
    if (isAWaiver) return getReply('get-waiver')
    if (isQuickReply) return getReply(quickReplyPayload)
    if (isButtonPostback) return getReplyWithUser(postbackPayload, sender_psid)
     if (isAGeneralInfo) return getReply('general-info')
    if (isASchedule) return getReply('schedule')
    if (date) return getReply(date)
    if (isAPriceInquiry) return getReplyWithUser('price-inquiry', sender_psid)
    if (isTextMessage) return await getReplyWithUser('greetings-location', sender_psid)
}

module.exports = getNextMessage