const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'ילדים (עד גיל 14)'},
    { "payload": 'military-info', "title": 'חיילים בסדיר' },
    { "payload": 'adults-info', "title": 'בוגרים' }
  ]

const kidsInfo = [
  { "payload": 'schedule-free-session', "title": 'לאימון ניסיון בחינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]
const militaryInfo = [
  { "payload": 'schedule-free-week', "title": 'למימוש המבצע' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]
const adultsInfo = [
  { "payload": 'schedule-free-week', "title": 'למימוש המבצע' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const parkingInfo = [
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const backToBeginning = [
  { "payload": 'restart', "title": 'לתפריט ראשי' },
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' }
]
const endConversation = [
  { "payload": 'restart', "title": 'לתפריט ראשי' }
]

const priceInquiry = [
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' },
  { "payload": 'military-info', "title": 'חיילים בסדיר' },
  { "payload": 'adults-info', "title": 'בוגרים' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'תל אביב (מרכז)' },
  { "payload": 'hertzlia', "title": 'הרצליה (השרון)' },
  { "payload": 'misgav', "title": 'משגב (צפון)' },
  { "payload": 'kadima', "title": 'קדימה (השרון)' },
  { "payload": 'kfar-bilu', "title": 'כפר בילו (דרום)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3',"title": "לטופס ההרשמה", "webview_height_ratio": "full" },
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc',"title": "להורדת האפליקציה", "webview_height_ratio": "full" }
]

const registerClass =  [
  { "payload": 'restart', "title": 'לתפריט ראשי' }
]
const generalInfo =  [
  { "type": 'web_url', "url": 'https://www.jja.co.il',"title": "על האימונים", "webview_height_ratio": "full" }
]

const getRegionButton = url => [  { "type": 'web_url', url, "title": "לעמוד הפייסבוק", "webview_height_ratio": "full" }]

const kadima = _.concat(getRegionButton('https://www.facebook.com/groups/151885048674207'), signWaiver)
const kfarBilu = _.concat(getRegionButton('https://www.facebook.com/BJJ.in.Israel/'), signWaiver)
const misgav = _.concat(getRegionButton('https://www.facebook.com/groups/671463266251881'), signWaiver)

const schedule =  [
  { "attachment":
      { "type": 'image',
      "payload":
        { "url": 'https://octopusmartialartsfitness.files.wordpress.com/2022/03/screen-shot-2022-03-06-at-14.19.41-1.png',
          "is_reusable": true } } } ]

const buttonSets = {
  "kids-info": kidsInfo,
  "parking-info": parkingInfo,
  "muay-thai-info": adultsInfo,
  "military-info": militaryInfo,
  "adults-info": adultsInfo,
  "schedule-free-session": signWaiver,
  "schedule-free-week": signWaiver,
  "greetings-location": greetingsLocation,
  "tel-aviv": greetingsAge,
  kadima,
  misgav,
  "kfar-bilu": kfarBilu,
  "get-waiver": signWaiver,
  "end-conversation": endConversation,
  schedule,
  'schedule-combined': { first: 'schedule', next: 'weekly-schedule' },
  'schedule-price-combined': { first: 'schedule', next: 'schedule-price' },
  "weekly-schedule": backToBeginning,
  "gi-no-gi": backToBeginning,
  'back-to-beginning': backToBeginning,
  'schedule-price': backToBeginning,
  'general-info': generalInfo,
  "price-inquiry": priceInquiry,
  "weekday/sunday": registerClass,
  "weekday/monday": registerClass,
  "weekday/tuesday": registerClass,
  "weekday/wednsday": registerClass,
  "weekday/thursday": registerClass,
  "weekday/friday": registerClass,
  "weekday/saturday": registerClass
}

_.each(buttonSets, set => _.each(set, button => !button.type && _.set(button, 'type', 'postback')))

module.exports = buttonSets
