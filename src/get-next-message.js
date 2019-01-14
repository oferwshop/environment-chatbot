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
    isDate(webhook_event)
    const isASchedule = isSchedule(webhook_event)
    const isAWaiver = isWaiver(webhook_event)
    
    const quickReplyPayload = isQuickReply && webhook_event.message.quick_reply.payload
    const postbackPayload = isButtonPostback && webhook_event.postback.payload
    const contactPayload = (isEmail || isPhoneNumber) &&  _.get(webhook_event, 'message.text')
    
    if (isPhoneNumber || isEmail) return await getReplyAndEmail('thank-you', sender_psid, contactPayload)
    if (isAWaiver) return getReply('get-waiver')
    if (isQuickReply) return getReply(quickReplyPayload)
    if (isButtonPostback) return getReply(postbackPayload)
    if (isASchedule) return getReply('schedule')
    if (isTextMessage) return await getReplyWithUser('greetings-location', sender_psid)
}

const isSchedule = webhook_event => {
    if (_.get(webhook_event, 'message.nlp.entities.datetime')) return true
    let schedule = false
    _.each(['לו\"ז','לוז','מערכת','שעות','מתי','שעה','chedule','שעה','שעה'],
        timeStr => { if (_.get(webhook_event, 'message.text', '').indexOf(timeStr)  > -1) schedule = true }
    )
    return schedule
}

const isDate = webhook_event => {
    const { datetime } = _.get(webhook_event, 'message.nlp.entities')
    console.log("DateCheck*****", JSON.stringify(datetime))
    if (datetime) {
        const val = _.get(datetime, '[0].values[0]')
        const date = newDate(val.from || val.value).getDay() 
        console.log("Date*****", date)
        return date

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

const getReply = (payload, userName) => {
    console.log("*** Getting response for payload:", payload)
    const text = getText(payload).replace('[user_name]', userName)
    const elements = buttonSets[payload]
    const retVal =  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements)
            : ( elements[0].attachment ? { attachment: elements[0].attachment }
                : { buttons: elements })))
    return retVal
}

const getReplyWithUser = async (payload, sender_psid) => {
    const name = await new Promise((resolve, reject) => {
        request({
        url: `${FACEBOOK_GRAPH_API_BASE_URL}${sender_psid}`,
        qs: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "first_name"
        },
        method: "GET"
      }, function(error, response, body) {
        if (error) {
          console.log("Error getting user's name: " +  error);
          reject(error)
        } else {
          var bodyObj = JSON.parse(body);
          const name1 = bodyObj.first_name;
          resolve(name1)
        }
        }
    )})
    return getReply(payload, name)
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