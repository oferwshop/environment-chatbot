const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'ילדים (עד גיל 14)'},
    { "payload": 'military-info', "title": 'חיילים בסדיר' },
    { "payload": 'adults-info', "title": 'בוגרים' }
  ]

const learnMore = [
  { "payload": 'schedule-free-session', "title": 'לקביעת אימון ניסיון בחינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const learnMoreAdults = [
  { "payload": 'schedule-free-week', "title": 'למימוש ההטבה: שבוע נסיון' },
  { "type":"postback", "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]
const kidsInfo = learnMore
const militaryInfo = learnMore
const adultsInfo = learnMoreAdults

const buttonSets = {
  "greetings-age": greetingsAge,
  "kids-info": kidsInfo,
  "military-info": militaryInfo,
  "adults-info": adultsInfo,
}

_.each(buttonSets, set => _.each(set, button => _.set(button, 'type', 'postback')))

module.exports = buttonSets