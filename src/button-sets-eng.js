const _ = require('lodash')

const greetingsAge = [
    { "payload": 'kids-info', "title": 'Kids (up to 14)'},
    { "payload": 'military-info', "title": 'Soldiers (Active)' },
    { "payload": 'adults-info', "title": 'Adults' }
  ]

  const kidsInfo = [
    { "payload": 'schedule-free-session', "title": 'Get Free Class' },
    { "payload": 'more-info', "title": 'More info' }
  ]
const parkingInfo = [
  { "payload": 'schedule-free-week', "title": 'Get Free Week' },
  { "payload": 'more-info', "title": 'More info' }
]
const militaryInfo = [
  { "payload": 'schedule-free-week', "title": 'Get Free Week' },
  { "payload": 'more-info', "title": 'More info' }
]
const adultsInfo = [
  { "payload": 'schedule-free-week', "title": 'Get Free Week' },
  { "payload": 'more-info', "title": 'More info' }
]

const backToBeginning = [
  { "payload": 'restart', "title": 'To Main Menu' },
  { "payload": 'schedule-free-week', "title": 'Get Free Week' }
]

const endConversation = [
  { "payload": 'restart', "title": 'To Main Menu' }
]

const priceInquiry = [
  { "payload": 'schedule-free-week', "title": 'Get Free Week' },
  { "payload": 'military-info', "title": 'Soldiers (Active)' },
  { "payload": 'adults-info', "title": 'Adults' }
]

const greetingsLocation = [
  { "payload": 'tel-aviv', "title": 'Tel Aviv (Center)' },
  { "payload": 'hertzlia', "title": 'Herzlia (Hasharon)' },
  { "payload": 'misgav', "title": 'Misgav (North)'},
  { "payload": 'kadima' , "title": 'Kadima (Hasharon)'},
  { "payload": 'kfar-bilu', "title": 'Kfar Bilu (South)' }
]

const signWaiver =  [
  { "type": 'web_url', "url": 'https://goo.gl/forms/AnFOlYfTakeZQ7NG3', "title": 'Registration form', "webview_height_ratio": "full" },
  { "type": 'web_url', "url": 'http://wix.to/hcDaAuc',"title": "Download App", "webview_height_ratio": "full" }
]

const registerClass =  [
  { "payload": 'restart', "title": 'To Main Menu' }
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
  schedule,
  'schedule-combined': { first: 'schedule', next: 'weekly-schedule' },
  'schedule-price-combined': { first: 'schedule', next: 'schedule-price' },
  "weekly-schedule": backToBeginning,
  "gi-no-gi": backToBeginning,
  "end-conversation": endConversation,
  'back-to-beginning': backToBeginning,
  'general-info': generalInfo,
  "price-inquiry": priceInquiry,
  'schedule-price': backToBeginning,
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
