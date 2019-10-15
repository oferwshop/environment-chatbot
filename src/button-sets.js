const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'ילדים (עד גיל 14)'},
    { "payload": 'military-info', "title": 'חיילים בסדיר' },
    { "payload": 'adults-info', "title": 'בוגרים' }
  ]


  const greetingsAgeEnglish = [
    { "payload": 'kids-info-english', "title": 'Kids - up to 14'},
    { "payload": 'military-info-english', "title": 'Soldiers(active service)' },
    { "payload": 'adults-info-english', "title": 'Adults' }
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
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const priceInquiry = [
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'תל אביב (מרכז)' },
  { "payload": 'misgav', "title": 'משגב (צפון)' },
  { "payload": 'kadima', "title": 'קדימה (השרון)' },
  { "payload": 'kfar-bilu', "title": 'כפר בילו (דרום)' }
]

const greetingsLocationEnglish = [
  { "payload": 'tel-aviv-english', "title": 'Tel Aviv (center)' },
  { "payload": 'misgav-english', "title": 'Misgav (north)' },
  { "payload": 'kadima-english', "title": 'Kadima (hasharon)' },
  { "payload": 'kfar-bilu-english', "title": 'Kfar Bilu (south)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3',"title": "לטופס ההרשמה", "webview_height_ratio": "full" }
]

const registerClass =  [
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc',"title": "להרשמה לאימון", "webview_height_ratio": "full" }
]
const generalInfo =  [
  { "type": 'web_url', "url": 'https://www.jja.co.il',"title": "תוכנית האימונים", "webview_height_ratio": "full" }
]

const getRegionButton = url => [  { "type": 'web_url', url, "title": "לעמוד הפייסבוק", "webview_height_ratio": "full" }]

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
  "military-info": militaryInfo,
  "adults-info": adultsInfo,
  "adults-info-english": adultsInfo,
  "schedule-free-session": signWaiver,
  "schedule-free-week": signWaiver,
  "greetings-location": greetingsLocation,
  "tel-aviv": greetingsAge,
  "tel-aviv-english": greetingsAgeEnglish,
  kadima,
  misgav,
  "kfar-bilu": kfarBilu,
  "get-waiver": signWaiver,
  schedule,
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