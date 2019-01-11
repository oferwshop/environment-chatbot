
const greetingsAge = [
    {
      "type":"postback",
      "payload": 'kids-info',
      "title": 'ילדים(עד גיל 14)'
    },
    {
      "type":"postback",
      "payload": 'military-info',
      "title": 'חיילים בסדיר'
    },
    {
      "type":"postback",
      "payload": 'adults-info',
      "title": 'בוגרים'
    }
  ]

const learnMore = [
  {
    "type":"postback",
    "payload": 'schedule-free-session',
    "title": 'לקביעת אימון ניסיון בחינם'
  },
  {
    "type":"postback",
    "payload": 'more-info',
    "title": 'לקבלת פרטים נוספים'
  }
]


const kidsInfo = learnMore

const buttonSets = {}

buttonSets["greetins-age"] = greetingsAge
buttonSets["kids-info"] = kidsInfo

module.exports = buttonSets