const _ = require('lodash')

const conversations = {}
const botDisablePeriod = 1000 * 60 * 60 * 3
const allDisabledPeriod = 1000 * 60 * 15
const expirationPeriod = 1000 * 60 * 60 * 5
let allDisabledTS = null

const handleConversationState = (webhook_event) => {
  console.log("*** CONVERSATIONS: " + JSON.stringify(conversations))
  const isButtonPostback = _.get(webhook_event, 'postback.payload')

  const timeSinceLastAllDisabled = webhook_event.timestamp - allDisabledTS || 0
  const allDisabledLately = timeSinceLastAllDisabled < allDisabledPeriod
  
  // get conversation
  let conversation = getConversation(webhook_event) || initConversation(webhook_event)

  _.set(conversation, 'allDisabled', allDisabledLately)

  // Handle conversation expired
  const timeSinceLastUserInput = webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)
  const converstationExpired = timeSinceLastUserInput > expirationPeriod
  if (converstationExpired) conversation = initConversation(webhook_event)

  // handle admin hijack
  const userInputHookLately = timeSinceLastUserInput < 15000
  let oldBotDisabledTS = _.get(conversation, 'botDisabledTS')
  let newBotDisabledTS =  oldBotDisabledTS && shouldReEnableBot(webhook_event.timestamp, oldBotDisabledTS) ? null: oldBotDisabledTS

  // Handle disable all
  const messageText = _.get(webhook_event, 'message.text')
  if ( messageText === 'stop bot') allDisabledTS = webhook_event.timestamp
  if ( messageText === 'start bot' || isButtonPostback) {
      allDisabledTS = null
      newBotDisabledTS = null
  }

  _.set(conversation, 'botDisabledTS', newBotDisabledTS)

  setLastUserInput(webhook_event)
// webhook_event.request_thread_control//
  if (isButtonPostback) _.set(conversation, 'botDisabledTS', null)
 
  const isAdmin =  !isButtonPostback && !userInputHookLately && hasMids(webhook_event)
  if (isAdmin){
    console.log("*** IS ADMIN !!!!!!!" + "webhook_event.timestamp - lastUserInputTS - : " + (webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)))
    _.set(conversation, 'botDisabledTS', webhook_event.timestamp)
  }

  const timeSinceLastBotDisabled = webhook_event.timestamp - _.get(conversation, 'botDisabledTS', 0)
  const botDisabledLately = timeSinceLastBotDisabled < 5000
  const adminFalseAlarm = userInputHookLately && botDisabledLately
  if (adminFalseAlarm) {
      console.log("***  ADMIN CANCELLED !!!!!!! timeSinceLastBotDisabled:" + timeSinceLastBotDisabled + " timeSinceLastUserInput: "+ timeSinceLastUserInput)
      _.set(conversation, 'botDisabledTS', null)
  }

}

const isDisabled = webhook_event => _.get(getConversation(webhook_event), 'botDisabledTS') || _.get(getConversation(webhook_event), 'allDisabled')

const getMainScriptStarted = webhook_event => _.get(getConversation(webhook_event), 'mainScriptStarted')

const setMainScriptStarted = (webhook_event, val) => {
    const conversation = getConversation(webhook_event)
    _.set(conversation, 'mainScriptStarted', val)
}

const setLanguage = (webhook_event, lang) => {
    const conversation = getConversation(webhook_event)
    let value
    switch (lang) {
        case 'English':
            value = true
            break;
        case 'Hebrew':
            value = false
            break;
        default:
            value = conversation.english
            break;
    }
    _.set(conversation, 'english', value)
}

const setGender = (webhook_event, val) => {
    const conversation = getConversation(webhook_event)
    _.set(conversation, 'gender', val)
}
const getEnglish = webhook_event => {
    return _.get(getConversation(webhook_event), 'english')
}

const getGender = webhook_event => {
    return _.get(getConversation(webhook_event), 'gender')
}

const shouldReEnableBot = (timestamp, botDisabledTS) => timestamp - botDisabledTS > botDisablePeriod

const getConversation = webhook_event => conversations[webhook_event.sender.id]

const initConversation = webhook_event => {
    _.set(conversations, webhook_event.sender.id, {} )
    allDisabledTS = null
    setLastUserInput(webhook_event)
    return getConversation(webhook_event)
}

const setLastUserInput = (webhook_event) => {
    const conversation = getConversation(webhook_event)
    let nonUserHooksCount = _.get(conversation, 'nonUserHooksCount', 0)
    let userHooksCount = _.get(conversation, 'userHooksCount', 0)
    const lastUserInputTS = _.get(conversation, 'lastUserInputTS')
    const isButtonPostback = _.get(webhook_event, 'postback.payload')
    _.set(conversation, 'lastUserInputTS', hasMids(webhook_event) && !isButtonPostback ? lastUserInputTS : webhook_event.timestamp )
    _.set(conversation, 'nonUserHooksCount', hasMids(webhook_event) ? nonUserHooksCount + 1 : 0 )
    _.set(conversation, 'userHooksCount', hasMids(webhook_event) ? userHooksCount : userHooksCount + 1 )
}

const getUserHooksCount = webhook_event => _.get(getConversation(webhook_event), 'userHooksCount', 0)

const hasMids = webhook_event => _.get(webhook_event, 'delivery.mids')

module.exports = { getGender, setGender, getUserHooksCount, hasMids, setLanguage, getEnglish, initConversation, handleConversationState, isDisabled, getMainScriptStarted, setMainScriptStarted  }