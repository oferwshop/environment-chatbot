const request = require('request');

const _ = require('lodash')
const { sendEmail, createResponse, handleGender, getFileText
  , hasLongText, hasDateTime, textContains, scheduleWords
  , priceWords, getWeekDay, waiverWords, generalInfoWords} = require('./helpers')
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN_PROTOTYPE
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

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
const isSchedule = webhook_event =>
  !hasLongText(webhook_event)
  && (hasDateTime(webhook_event) || textContains(webhook_event, scheduleWords))

const isPriceInquiry = webhook_event => textContains(webhook_event, priceWords)

const getDate = webhook_event => {
    let today = false
    let datetime = _.get(webhook_event, 'message.nlp.entities.datetime')
    if (textContains(webhook_event, ['לו"ז','לוז'] )) { today = true; datetime = true }
    if (textContains(webhook_event, ['צהריים','בוקר', 'ערב']) || hasLongText(webhook_event)) {  datetime = false }

    if (datetime || today) return getWeekDay(datetime)
    return false
}

const isWaiver = webhook_event => textContains(webhook_event, waiverWords)

const isGeneralInfo = webhook_event => textContains(webhook_event, generalInfoWords)

const getReply = (payload, userName, gender) => {
    console.log("*** Getting response for payload:", JSON.stringify(payload))
    let text = getFileText(payload)
    text = text.replace('[user_name]', userName ? userName : '')
    if (gender) text = handleGender(text, gender)
    return createResponse(text, payload)
}

const getReplyWithUser = async (payload, sender_psid) => {
    const info = await new Promise((resolve, reject) => {
        request({
        url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
        qs: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "first_name,gender"
        },
        method: "GET"
      }, function(error, response, body) {
        if (error) {
          console.log("Error getting user's name: " +  error);
          reject(error)
        } else {
          var bodyObj = JSON.parse(body);
          const name = bodyObj.first_name;
          const gender = bodyObj.gender
          resolve( { name,gender })
        }
        }
    )})
    return getReply(payload, info.name, info.gender)
}


const getReplyAndEmail = async (payload, sender_psid, contactPayload) => {
    const info = await new Promise((resolve, reject) => {
        request({
        url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
        qs: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "name,id"
        },
        method: "GET"
      }, function(error, response, body) {
        if (error) {
          console.log("Error getting user's name: " +  error);
          reject(error)
        } else {
          var bodyObj = JSON.parse(body);
          resolve({ name: bodyObj.name, id: bodyObj.id })
        }
        }
    )})

    sendEmail(info)

    return getReply(payload)
}



module.exports = getNextMessage