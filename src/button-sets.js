const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'ילדים (עד גיל 14)', "titleEn": 'Kids (up to 14)'},
    { "payload": 'military-info', "title": 'חיילים בסדיר', "titleEn": 'Soldiers - active service' },
    { "payload": 'adults-info', "title": 'בוגרים', "titleEn": 'Adults' }
  ]

const kidsInfo = [
  { "payload": 'schedule-free-session', "title": 'לאימון ניסיון בחינם', "titleEn": 'To free trainig session' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים', "titleEn": 'More info' }
]
const militaryInfo = [
  { "payload": 'schedule-free-week', "title": 'למימוש המבצע', "titleEn": 'Get free week of training' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים', "titleEn": 'More info' }
]
const adultsInfo = [
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם', "titleEn": 'Get free week of training' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים', "titleEn": 'More info' }
]

const backToBeginning = [
  { "payload": 'restart', "title": 'חזרה לתפריט התחלה', "titleEn": 'Back to main menu' },
]

const priceInquiry = [
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם', "titleEn": 'Get free week of training' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים', "titleEn": 'More info' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'תל אביב (מרכז)', "titleEn": 'Tel Aviv (center)' },
  { "payload": 'misgav', "title": 'משגב (צפון)' , "titleEn": 'Misgav (north)'},
  { "payload": 'kadima', "title": 'קדימה (השרון)' , "titleEn": 'Kadima (Hasharon)'},
  { "payload": 'kfar-bilu', "title": 'כפר בילו (דרום)', "titleEn": 'Kfar Bilu (south)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3',"title": "לטופס ההרשמה", "titleEn": 'Registration form', "webview_height_ratio": "full" }
]

const registerClass =  [
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc',"title": "להרשמה לאימון", "titleEn": 'Register to class', "webview_height_ratio": "full" }
]
const generalInfo =  [
  { "type": 'web_url', "url": 'https://www.jja.co.il',"title": "על האימונים", "titleEn": 'About', "webview_height_ratio": "full" }
]

const getRegionButton = url => [  { "type": 'web_url', url, "title": "לעמוד הפייסבוק", "titleEn": 'To facebook page', "webview_height_ratio": "full" }]

const kadima = _.concat(getRegionButton('https://www.facebook.com/groups/151885048674207'), signWaiver)
const kfarBilu = _.concat(getRegionButton('https://www.facebook.com/BJJ.in.Israel/'), signWaiver)
const misgav = _.concat(getRegionButton('https://www.facebook.com/groups/671463266251881'), signWaiver)

const schedule =  [
  { "attachment":
      { "type": 'image',
      "payload":
        { "url": 'https://octopusmartialartsfitness.files.wordpress.com/2019/10/luz.jpg',
          "is_reusable": true } } } ]

const buttonSets = {
  "kids-info": kidsInfo,
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
  schedule,
  'back-to-beginning': backToBeginning,
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