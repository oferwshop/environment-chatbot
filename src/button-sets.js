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
  { "payload": 'schedule-free-week', "title": 'לשבוע נסיון חינם' },
  { "payload": 'more-info', "title": 'לקבלת פרטים נוספים' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'תל אביב (מרכז)' },
  { "payload": 'misgav', "title": 'משגב (צפון)' },
  { "payload": 'kadima', "title": 'קדימה (השרון)' },
  { "payload": 'kfar-bilu', "title": 'כפר בילו (דרום)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3',"title": "לטופס ההרשמה", "webview_height_ratio": "full" }
]

const registerClass =  [
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc',"title": "Book", "webview_height_ratio": "full" }
]


const getRegionButton = url => [  { "type": 'web_url', url, "title": "לעמוד הפייסבוק", "webview_height_ratio": "full" }]

const kadima = _.concat(getRegionButton('https://www.facebook.com/groups/151885048674207'), signWaiver)
const kfarBilu = _.concat(getRegionButton('https://www.facebook.com/BJJ.in.Israel/'), signWaiver)
const misgav = _.concat(getRegionButton('https://www.facebook.com/groups/671463266251881'), signWaiver)

const schedule =  [
  { "attachment":
      { "type": 'image',
      "payload":
        { "url": 'https://scontent.fsdv3-1.fna.fbcdn.net/v/t1.0-9/49582259_466669327194872_3268003713167392768_n.jpg?_nc_cat=108&_nc_ht=scontent.fsdv3-1.fna&oh=5b09572dd7267b5826b69078dee9494e&oe=5CC35B97',
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