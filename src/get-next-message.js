const request = require('request');
const fs = require('fs');
const path = require("path");
const _ = require('lodash')
const buttonSets = require('./button-sets')

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v2.6/';

async function getNextMessage(webhook_event, sender_psid) {
    console.log("**** Received webhook:")
    console.log(JSON.stringify(webhook_event))

    const isQuickReply = _.get(webhook_event, 'message.quick_reply.payload')
    const isButtonPostback = _.get(webhook_event, 'postback.payload')
    const isPhoneNumber = _.get(webhook_event, 'message.nlp.entities.phone_number')
    const isTextMessage = webhook_event.message
    
    if (isPhoneNumber) return getPostbackResponse('thank-you')
    if (isQuickReply) return getPostbackResponse(webhook_event.message.quick_reply.payload)
    if (isButtonPostback) return getPostbackResponse(webhook_event.postback.payload)
    if (isSchedule(webhook_event)) return getPostbackResponse('schedule')

    if (isTextMessage) return {
        text: await getMessageResponse(webhook_event.message.text, sender_psid),
        buttons: buttonSets["greetings-age"]
    }
}

const isSchedule = webhook_event => {
    if (_.get(webhook_event, 'message.nlp.entities.datetime')) return true
    let schedule = false
    ['לו\"ז','לוז','מערכת','שעות','מתי','אימו','שעה','chedule','שעה','שעה'].each(
        timeStr => { if (_.get(webhook_event, 'message.text', '').indexOf(timeStr)  > -1) schedule = true }
    )
    return schedule
}


async function getMessageResponse(message, sender_psid){
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

    const helloAgeTxt = fs.readFileSync(path.resolve(__dirname, './messages/greetings-age.txt')).toString()

    return helloAgeTxt.replace('[user_name]', name)
}

const getQuickReplies = elements => ({
    quick_replies: _.map(elements, element => ({
        "content_type":"text",
        "title": element.title,
        "payload": element.payload
    }))
})

const getText = payload => fs.readFileSync(path.resolve(__dirname, `./messages/${payload}.txt`)).toString()

const getPostbackResponse = (payload) => {
    const text = getText(payload)
    console.log("*** EXTRACTED TEXT: ", text)
    const elements = buttonSets[payload]
    const retVal =  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements)
            : ( elements[0].attachment ? { attachment: elements[0].attachment }
                : { buttons: elements })))

    console.log("*** RETURNING: ", JSON.stringify(retVal))

    return retVal
}

module.exports = getNextMessage