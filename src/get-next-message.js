const request = require('request');
const fs = require('fs');
const path = require("path");
const _ = require('lodash')
var nodemailer = require('nodemailer');
const buttonSets = require('./button-sets')

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
    const isAWaiver = isWaiver(webhook_event)
    
    const quickReplyPayload = isQuickReply && webhook_event.message.quick_reply.payload
    const postbackPayload = isButtonPostback && webhook_event.postback.payload
    const contactPayload = (isEmail || isPhoneNumber) &&  _.get(webhook_event, 'message.text')
    
    if (isPhoneNumber || isEmail) return await getReplyAndEmail('thank-you', sender_psid, contactPayload)
    if (isAWaiver) return getReply('get-waiver')
    if (isQuickReply) return getReply(quickReplyPayload)
    if (isButtonPostback) return getReply(postbackPayload)
    if (date) return getReply(date)
    if (isASchedule) return getReply('schedule')
    if (isTextMessage) return await getReplyWithUser('greetings-location', sender_psid)
}

const isSchedule = webhook_event => {
    if (_.get(webhook_event, 'message.nlp.entities.datetime')) return true
    let schedule = false
    _.each(['לו"ז','לוז','מערכת','שעות',' מתי','שעה','chedule','שעה','שבוע'],
        timeStr => { if (_.get(webhook_event, 'message.text', '').indexOf(timeStr)  > -1) schedule = true }
    )
    return schedule
}

const getDate = webhook_event => {
    let today = false
    _.each(['לו"ז','לוז'],
        timeStr => { if (_.get(webhook_event, 'message.text', '').indexOf(timeStr)  > -1) today = true }
    )
    const datetime = _.get(webhook_event, 'message.nlp.entities.datetime')
    if (datetime || today) {
        const val = _.get(datetime, '[0].values[0]')
        const date = (!datetime ? new Date() : new Date(_.get(val, 'from.value') || val.value)).getDay() 
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
    return false
}

const isWaiver = webhook_event => {
    let waiver = false
    _.each(['רשם','טופס','בריאות','להירשם','רשמ','הצהרת','מסמך'],
        waiverStr => { if (_.get(webhook_event, 'message.text', '').indexOf(waiverStr)  > -1) waiver = true }
    )
    return waiver
}


const getQuickReplies = elements => ({
    quick_replies: _.map(elements, element => ({
        "content_type":"text",
        "title": element.title,
        "payload": element.payload
    }))
})

const getText = payload => fs.readFileSync(path.resolve(__dirname, `./messages/${payload}.txt`)).toString()

const getReply = (payload, userName, gender) => {
    console.log("*** Getting response for payload:", payload)
    let text = getText(payload)
    text = text.replace('[user_name]', userName ? userName : '')
    if (gender) text = text.replace('מתעניין/ת', gender === "male" ? "מתעניין" : "מתעניינת")
    const elements = buttonSets[payload]
    const retVal =  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements)
            : ( elements[0].attachment ? { attachment: elements[0].attachment }
                : { buttons: elements })))
    return retVal
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


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  
  var mailOptions = {
    from: 'saulmma@gmail.com',
    to: 'saulmma@gmail.com',
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

    return getReply(payload)
}



module.exports = getNextMessage