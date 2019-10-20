
const request = require('request');
const fs = require('fs');
const path = require("path");
var nodemailer = require('nodemailer');
const _ = require('lodash')
const buttonSets = require('./button-sets')
const buttonSetsEng = require('./button-sets-eng')
const { getEnglish } = require('./app-state')


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN_PROTOTYPE
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

const hasLongText = webhook_event => _.get(webhook_event, 'message.text', '').length > 40

const hasDateTime = webhook_event => _.get(webhook_event, 'message.nlp.entities.datetime')

const textContains = (webhook_event, strArray) => _.reduce( strArray, (hasStr, str) => hasStr || _.get(webhook_event, 'message.text', '').indexOf(str) > -1, false )

const scheduleWords = ['לו"ז','לוז','מערכת','שעות',' מתי','שעה','chedule','שעה','שבוע','בוקר','ערב','צהריים', "morning", "noon", "evening"]

const priceWords = ['price','cost','pay','מחיר','עלות','מנוי','תשלום','לשלם','עולה','כסף']

const waiverWords = ['רשם','טופס','בריאות','להירשם','רשמ','הצהרת','מסמך']

const generalInfoWords = ['מה זה']

const getWeekDay = (datetime) => {
    const val = _.get(datetime, '[0].values[0]')
    const date = (!datetime ? new Date() : new Date(_.get(val, 'from.value') || _.get(val, 'value'))).getDay() 
    switch (date){
        case 0:
            return "weekday/sunday"
        case 1:
            return "weekday/monday"
        case 2:
            return "weekday/tuesday"
        case 3:
            return "weekday/wednsday"
        case 4:
            return "weekday/thursday"
        case 5:
            return "weekday/friday"
        case 6:
            return "weekday/saturday"
        default:
            return false
    }
}

const getQuickReplies = (elements, webhook_event) => ({
    quick_replies: _.map(elements, element => ({
        "content_type":"text",
        "title": element.title,
        "payload": element.payload
    }))
})
const readFile = (payload, english) => fs.readFileSync(path.resolve(__dirname, `./messages${english ? '-eng': ''}/${payload}.txt`)).toString()

const getFileText = (payload, english) => {
  try{
    return readFile(payload, english)
  }catch(e){
    return readFile(payload, false)
  }
}
const handleGender = (text, gender) => text.replace('מתעניין/ת', gender === "male" ? "מתעניין" : "מתעניינת")
    .replace('ברוך/ה', gender === "male" ? "ברוך" : "ברוכה")
    .replace('הבא/ה', gender === "male" ? "הבא" : "הבאה")
    .replace('את/ה', gender === "male" ? "אתה" : "את")
    .replace('מחפש/ת', gender === "male" ? "מחפש" : "מחפשת")
    .replace('מקצועני/ת', gender === "male" ? "מקצועני" : "מקצוענית")
    .replace('ספורטאי/ת', gender === "male" ? "ספורטאי" : "ספורטאית")

const createResponse = (text, payload, webhook_event) => {
    const elements = getEnglish(webhook_event) ? buttonSetsEng[payload]:  buttonSets[payload]
    return  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements, webhook_event)
            : ( elements[0].attachment ? { attachment: elements[0].attachment }
                : { buttons: elements })))
    }

const sendEmail = (info) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
      
      var mailOptions = {
        from: 'saulmma@gmail.com',
        to: process.env.EMAIL_TO,
        subject: 'Contact details accepted !',
        text: `Hi, ${info.name} (#id ${info.id}) sent contact details! The details are: ${contactPayload} `
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log('Email text: ' + mailOptions.text)
        }
      }); 
}

const isSchedule = webhook_event =>
  !hasLongText(webhook_event)
  && (hasDateTime(webhook_event) || textContains(webhook_event, scheduleWords))


const isPriceInquiry = webhook_event => textContains(webhook_event, priceWords)

const getDate = webhook_event => {
    let today = false
    let datetime = _.get(webhook_event, 'message.nlp.entities.datetime')
    if (textContains(webhook_event, ['לו"ז','לוז'] )) { today = true; datetime = true }
    if (textContains(webhook_event, ['צהריים','בוקר', 'ערב']) || hasLongText(webhook_event) || textContains(webhook_event, scheduleWords)) {  datetime = false }

    if (datetime || today) return getWeekDay(datetime)
    return false
}

const isWaiver = webhook_event => textContains(webhook_event, waiverWords)

const isGeneralInfo = webhook_event => textContains(webhook_event, generalInfoWords)

const getReply = (webhook_event, payload, userName, gender) => {
  console.log("**** Getting text file. Payload, Webhook, Conversations: "+ payload +"," + JSON.stringify(webhook_event))

    let text = getFileText(payload, getEnglish(webhook_event))
    text = text.replace('[user_name]', userName ? userName : '')
    if (gender) text = handleGender(handleGender(text, gender), gender)
    return createResponse(text, payload, webhook_event)
}

const getReplyWithUser = async (webhook_event, payload, sender_psid) => {
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
    return getReply(webhook_event, payload, info.name, info.gender)
}


const getReplyAndEmail = async (webhook_event, payload, sender_psid, contactPayload) => {
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

    return getReply(webhook_event, payload)
}


const getResponseType = (webhook_event) => {
  
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

  return (isPhoneNumber || isEmail) && 'thank-you' 
    || (isAWaiver && 'get-waiver')
    || (isQuickReply && 'quick-reply')
    || (isButtonPostback && 'button-postback')
    || (isAGeneralInfo && 'general-info')
    || (date && 'date')
    || (isASchedule && 'schedule')
    || (isAPriceInquiry && 'price-inquiry')
    || (isTextMessage && 'greetings-location')
}

const isTextInput = type => (type === 'greetings-location'
  || type === 'date'
  || type === 'price-inquiry'
  || type === 'back-to-beginning')

const isHebrew = (webhook_event) =>{
  HebrewChars = new RegExp("[\u0590-\u05FF]");
  const msg = _.get(webhook_event, 'message.text', 'English')
  return HebrewChars.test(msg)
}
module.exports = { isTextInput, isHebrew, getResponseType, getDate, isWaiver, getReply, isGeneralInfo, getReplyWithUser, getReplyAndEmail, isPriceInquiry, isSchedule, generalInfoWords, createResponse, handleGender, getFileText, hasLongText, hasDateTime, textContains, scheduleWords, priceWords, getWeekDay, waiverWords, getQuickReplies }
 