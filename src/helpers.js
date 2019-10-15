
const fs = require('fs');
const path = require("path");
var nodemailer = require('nodemailer');
const _ = require('lodash')
const buttonSets = require('./button-sets')


const hasLongText = webhook_event => _.get(webhook_event, 'message.text', '').length > 25

const hasDateTime = webhook_event => _.get(webhook_event, 'message.nlp.entities.datetime')

const textContains = (webhook_event, strArray) => _.reduce( strArray, (hasStr, str) => hasStr || _.get(webhook_event, 'message.text', '').indexOf(str) > -1, false )

const scheduleWords = ['לו"ז','לוז','מערכת','שעות',' מתי','שעה','chedule','שעה','שבוע']

const priceWords = ['price','cost','pay','מחיר','עלות','מנוי','תשלום','לשלם','עולה','כסף']

const waiverWords = ['רשם','טופס','בריאות','להירשם','רשמ','הצהרת','מסמך']

const getWeekDay = (datetime) => {
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

const getQuickReplies = elements => ({
    quick_replies: _.map(elements, element => ({
        "content_type":"text",
        "title": element.title,
        "payload": element.payload
    }))
})

const getFileText = payload => fs.readFileSync(path.resolve(__dirname, `./messages/${payload}.txt`)).toString()

const handleGender = text => text.replace('מתעניין/ת', gender === "male" ? "מתעניין" : "מתעניינת")
    .replace('ברוך/ה', gender === "male" ? "ברוך" : "ברוכה")
    .replace('הבא/ה', gender === "male" ? "הבא" : "הבאה")
    .replace('את/ה', gender === "male" ? "אתה" : "את")
    .replace('מחפש/ת', gender === "male" ? "מחפש" : "מחפשת")
    .replace('מקצועני/ת', gender === "male" ? "מקצועני" : "מקצוענית")

const createResponse = (text) => {
    const elements = buttonSets[payload]
    return  _.assign({ text },
        !elements ? null : (elements.length > 3 ? getQuickReplies(elements)
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
}

module.exports = { createResponse, handleGender, getFileText, hasLongText, hasDateTime, textContains, scheduleWords, priceWords, getWeekDay, waiverWords, getQuickReplies }
 