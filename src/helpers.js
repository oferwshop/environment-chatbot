
const request = require('request');
const fs = require('fs');
const path = require("path");
var nodemailer = require('nodemailer');
const _ = require('lodash')
const buttonSets = require('./button-sets')
const buttonSetsEng = require('./button-sets-eng')
const { getEnglish, setGender, getGender } = require('./app-state')


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN_PROTOTYPE
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

const hasLongText = webhook_event => _.get(webhook_event, 'message.text', '').length > 180

const isShortMessage = webhook_event => _.get(webhook_event, 'message.text', '').length < 30

const isVeryShortMessage = webhook_event => _.get(webhook_event, 'message.text', '').length < 6

const hasDateTime = webhook_event => _.get(webhook_event, 'message.nlp.entities.datetime')

const textContains = (webhook_event, strArray) =>{
  return _.reduce( strArray, (hasStr, str) => hasStr || _.toLower(_.get(webhook_event, 'message.text', '')).indexOf(str) > -1, false )
}

const textEquals = (webhook_event, strArray) =>{
  return _.reduce( strArray, (hasStr, str) => hasStr || _.toLower(_.get(webhook_event, 'message.text', '')) === str, false )
}

const scheduleWords = ['לו"ז','לוז','מערכת','לבוא','להגיע','come','שעות',
'מתי ','שעה','chedule', "time",'שעה','שבוע','בוקר','ערב','צהריים', " free ", " train",
"morning", "noon", "evening", "when", "זמן", "time", "today", "יום", "drop by", "attend"
, "לקפוץ", "נסיון", "ניסיון", "drop in", "שעור", "שיעור", "class"]

const priceWords = ['price','cost','pay','fee','discount','how much',' subscr','מחיר','עלות','מנוי','תשלום','לשלם','עולה','כסף','כרטיס','עלויות','הנח','עולים']

const greetingWords = ['hi','hi,','hello','hello','hey','hey,','הי','שלום','הי,','שלום,']

const waiverWords = ['הרשמה','טופס','בריאות','להירשם','נרש','הצהרת','מסמך',' form','regist',' sign']

const generalInfoWords = ['מה זה', "hat is", "seminar", "סמינר"]

const addressWords = ['כתובת','היכן','ממוק','מיקום', "location", "address", "where"]

const giNoGiWords = ['הבדל',"נו גי","השניים", "סוגי", "no gi", "the difference", "שני סוגי", "kinds of", "types of"]

const possibleEndWords = ['תודה', 'ok', 'אוקי', 'סבבה', 'מגניב', 'hank', 'bye']

const activeDutyWords = ['חייל', 'חילת ', ' בסדיר', ' חיל ', 'idf', ' military', 'soldier', ' duty']

const kidsWords = ['kids', 'ילדים', ' לילד', ' child', 'ילד ']

const parkingWords = ['park', 'חניה', 'לחנות', 'חנייה']

const muayThaiWords = [' muay', 'תאילנדי', ' מוי']

const englishWeekdays = ["sunday", "monday", "tuesday", "wendsday", "thursday", "friday", "saturday"]

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
    try{
     return readFile(payload, false)
    }catch(e){
      return ''
    }
  }
}
const handleGender = (text, gender) => text.replace('מתעניין/ת', gender === "male" ? "מתעניין" : "מתעניינת")
    .replace('ברוך/ה', gender === "male" ? "ברוך" : "ברוכה")
    .replace('הבא/ה', gender === "male" ? "הבא" : "הבאה")
    .replace('את/ה', gender === "male" ? "אתה" : "את")
    .replace('מחפש/ת', gender === "male" ? "מחפש" : "מחפשת")
    .replace('מקצועני/ת', gender === "male" ? "מקצועני" : "מקצוענית")
    .replace('ספורטאי/ת', gender === "male" ? "ספורטאי" : "ספורטאית")
    .replace('מוזמנ/ת', gender === "male" ? "מוזמן" : "מוזמנת")
    .replace('מלא/י', gender === "male" ? "מלא" : "מלאי")
    .replace('השאר/י', gender === "male" ? "השאר" : "השאירי")

const createResponse = (text, payload, webhook_event) => {
    const elements = getEnglish(webhook_event) ? buttonSetsEng[payload]:  buttonSets[payload]
    console.log("*** Creating response for: " + JSON.stringify(payload) + " ELEMENTS: " + JSON.stringify(elements))

    return  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements, webhook_event)
            : ( elements[0].attachment ? { attachment: elements[0].attachment }
                : { buttons: elements })))
    }

const sendEmail = (info, contactPayload) => {
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

const isSchedule = webhook_event => hasDateTime(webhook_event) || textContains(webhook_event, scheduleWords)

const isActiveDuty = webhook_event => textContains(webhook_event, activeDutyWords)

const isKids = webhook_event => textContains(webhook_event, kidsWords)

const isGreeting = webhook_event => textEquals(webhook_event, greetingWords)

const isParking = webhook_event => textContains(webhook_event, parkingWords)

const isMuayThai = webhook_event => textContains(webhook_event, muayThaiWords)

const isPriceInquiry = webhook_event => textContains(webhook_event, priceWords)

const getHebrewWeekday = (webhook_event) => {
  const text = _.toLower(_.get(webhook_event, 'message.text', ''))
  for(var i=0; i<englishWeekdays.length; i++){
     if (text.indexOf(englishWeekdays[i]) > -1) return 'weekday/' + englishWeekdays[i]
  }
  return false
}
const greetings = ['צהריים','בוקר', 'ערב']
const getDate = webhook_event => {
    if (hasLongText(webhook_event)) return false
    let today = false
    let datetime = _.get(webhook_event, 'message.nlp.entities.datetime')
    let withoutGreeting = _.get(webhook_event, 'message.text', '')
    greetings.forEach( greet => withoutGreeting = withoutGreeting.replace(greet, ''))
    if (textContains(webhook_event, ['לו"ז','לוז'] )) { today = true; datetime = true }
    if (textContains({ message: { text: withoutGreeting }}, scheduleWords)) {  datetime = false }
    if (textContains(webhook_event, englishWeekdays)) return getHebrewWeekday(webhook_event)
    if (datetime || today) return getWeekDay(datetime)
    return false
}

const isWaiver = webhook_event => textContains(webhook_event, waiverWords)

const isGeneralInfo = webhook_event => textContains(webhook_event, generalInfoWords)
const isGiNoGi = webhook_event => textContains(webhook_event, giNoGiWords)
const isAnAddressQuery = webhook_event => textContains(webhook_event, addressWords)

const getReply = (webhook_event, payload, userName, gender) => {
  const english = getEnglish(webhook_event)
  const buttonSet = english ? buttonSetsEng:  buttonSets
  const theGender = getGender(webhook_event) || gender

  const responses = _.get(buttonSet[payload], 'first') ? [buttonSet[payload].first, _.get(buttonSet[payload], 'next')] : [payload]
  return _.map(responses, response => {
    console.log("**** Getting text file. Payload, Response, Webhook, Gender: "+ JSON.stringify(payload) + " ** " + JSON.stringify(response) +" ** " + JSON.stringify(webhook_event) + "** "+ gender)
    let text = getFileText(response, english)
    text = text.replace('[user_name]', userName ? userName : '')
    if (theGender) text = handleGender(handleGender(text, theGender), theGender)
    return createResponse(text, response, webhook_event)
  }  )
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
          if (gender) setGender(webhook_event, gender)
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

    sendEmail(info, contactPayload)

    return getReply(webhook_event, payload)
}


const getResponseType = (webhook_event, info) => {
    
  const isQuickReply = _.get(webhook_event, 'message.quick_reply.payload')
  const isSticker = _.get(webhook_event, 'message.sticker_id')
  const isButtonPostback = _.get(webhook_event, 'postback.payload')
  const isPhoneNumber = _.get(webhook_event, 'message.nlp.entities.phone_number')
  const isEmail = _.get(webhook_event, 'message.nlp.entities.email')
  const isTextMessage = webhook_event.message
  const date = getDate(webhook_event)
  const isASchedule = isSchedule(webhook_event)
  const isAnActiveDuty = isActiveDuty(webhook_event)
  const isAKidsQuery = isKids(webhook_event)
  const isAGreeting = isGreeting(webhook_event)
  const isAParkingQuery = isParking(webhook_event)
  const isAMuayThaiQuery = isMuayThai(webhook_event)
  const isAPriceInquiry = isPriceInquiry(webhook_event)
  const isAWaiver = isWaiver(webhook_event)
  const isAGeneralInfo = isGeneralInfo(webhook_event)
  const isAGiNoGi = isGiNoGi(webhook_event)
  const isAddressQuery = isAnAddressQuery(webhook_event)
  const isAVeryShortMessage = _.get(webhook_event, 'message.text', null) &&  isVeryShortMessage(webhook_event)
  const isEndConversation = (isAVeryShortMessage && !isASchedule) || textContains(webhook_event, possibleEndWords) && isShortMessage(webhook_event)
  const isInitialGreeting = isAVeryShortMessage && info.isFirstMessage

  return (isInitialGreeting || isAGreeting) && 'initial-greeting'
    || (isEndConversation) && 'end-conversation'
    || (isSticker) && 'sticker'
    || (isPhoneNumber || isEmail) && 'contact-details-left' 
    || (isAWaiver && 'get-waiver')
    || (isAnActiveDuty && 'military-info')
    || (isAKidsQuery && 'kids-info')
    || (isAParkingQuery && 'parking-info')
    || (isAMuayThaiQuery && 'muay-thai-info')
    || (isQuickReply && 'quick-reply')
    || (isButtonPostback && 'button-postback')
    || (isAGiNoGi && !date && !isASchedule && 'gi-no-gi')
    || (date && 'date')
    || (isAPriceInquiry && isASchedule && 'schedule-price')
    || (isAPriceInquiry && 'price-inquiry')
    || (isASchedule && 'schedule')
    || (isAddressQuery && 'restart')
    || (isAGeneralInfo && 'general-info')
    || (isTextMessage && 'greetings-location')
}

const isTextInput = type => (type === 'greetings-location'
  || type === 'date'
  || type === 'restart'
  || type === 'initial-greeting'
  || type === 'schedule'
  || type === 'price-inquiry'
  || type === 'military-info'
  || type === 'kids-info'
  || type === 'get-waiver'
  || type === 'parking-info'
  || type === 'muay-thai-info'
  || type === 'end-conversation'
  || type === 'schedule-price'
  || type === 'general-info'
  || type === 'back-to-beginning')

const isHebrew = (webhook_event) =>{
  HebrewChars = new RegExp("[\u0590-\u05FF]");
  const msg = _.get(webhook_event, 'message.text', 'English')
  return HebrewChars.test(msg)
}
module.exports = { isTextInput, isHebrew, getResponseType, getDate, isWaiver, getReply, isGeneralInfo, getReplyWithUser, getReplyAndEmail, isPriceInquiry, isSchedule, generalInfoWords, createResponse, handleGender, getFileText, hasLongText, hasDateTime, textContains, scheduleWords, priceWords, getWeekDay, waiverWords, getQuickReplies }
 