const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'ילדים (עד גיל 14)'},
    { "payload": 'military-info', "title": 'חיילים בסדיר' },
    { "payload": 'adults-info', "title": 'בוגרים' }
  ]

const kidsInfo = [
  { "payload": 'schedule-free-session', "title": 'לקביעת אימון ניסיון בחינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]
const militaryInfo = [
  { "payload": 'schedule-free-week', "title": 'למימוש המבצע' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]
const adultsInfo = [
  { "payload": 'schedule-free-week', "title": 'למימוש ההטבה: שבוע נסיון' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const scheduleFreeWeek = [
  { "payload": 'tel-aviv', "title": 'תל אביב (מרכז)' },
  { "payload": 'misgav', "title": 'משגב (צפון)' },
 /* { "payload": 'kadima', "title": 'קדימה (השרון)' },
  { "payload": 'kfar-bilu', "title": 'כפר בילו (דרום)' }*/
]

const telAviv = greetingsAge;

const buttonSets = {
  "greetings-age": greetingsAge,
  "kids-info": kidsInfo,
  "military-info": militaryInfo,
  "adults-info": adultsInfo,
  "schedule-free-week": scheduleFreeWeek,
  "tel-aviv": telAviv
}

_.each(buttonSets, set => _.each(set, button => _.set(button, 'type', 'postback')))

module.exports = buttonSets