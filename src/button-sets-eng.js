const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'Kids (up to 14)'},
    { "payload": 'military-info', "title": 'Soldiers - active service' },
    { "payload": 'adults-info', "title": 'Adults' }
  ]

const kidsInfo = [
  { "payload": 'schedule-free-session', "title": 'To free trainig session' },
  { "payload": 'more-info', "title": 'More info' }
]
const militaryInfo = [
  { "payload": 'schedule-free-week', "title": 'Get free week of training' },
  { "payload": 'more-info', "title": 'More info' }
]
const adultsInfo = [
  { "payload": 'schedule-free-week', "title": 'Get free week of training' },
  { "payload": 'more-info', "title": 'More info' }
]

const backToBeginning = [
  { "payload": 'restart', "title": 'Back to main menu' },
]

const priceInquiry = [
  { "payload": 'schedule-free-week', "title": 'Get free week of training' },
  { "payload": 'more-info', "title": 'More info' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'Tel Aviv (center)' },
  { "payload": 'misgav', "title": 'Misgav (north)'},
  { "payload": 'kadima' , "title": 'Kadima (Hasharon)'},
  { "payload": 'kfar-bilu', "title": 'Kfar Bilu (south)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3', "title": 'Registration form', "webview_height_ratio": "full" }
]

const registerClass =  [
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc', "title": 'Register to class', "webview_height_ratio": "full" }
]
const generalInfo =  [
  { "type": 'web_url', "url": 'https://www.jja.co.il', "title": 'About', "webview_height_ratio": "full" }
]

const getRegionButton = url => [  { "type": 'web_url', url, "title": 'To facebook page', "webview_height_ratio": "full" }]

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