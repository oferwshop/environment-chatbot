const _ = require('lodash')

const conversations = {}
const botDisablePeriod = 1000 * 60 * 5
const expirationPeriod = 1000 * 60 * 30

const handleConversationState = (webhook_event) => {
  console.log("*** CONVERSATIONS: " + JSON.stringify(conversations))

  let conversation = getConversation(webhook_event) || initConversation(webhook_event)

  const timeSinceLastUserInput = webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)
  const converstationExpired = timeSinceLastUserInput > expirationPeriod
  if (converstationExpired) conversation = initConversation(webhook_event)

  const userInputHookLately = timeSinceLastUserInput < 8000
  const oldBotDisabledTS = _.get(conversation, 'botDisabledTS')
  const newBotDisabledTS = oldBotDisabledTS && shouldReEnableBot(webhook_event.timestamp, oldBotDisabledTS) ? null: oldBotDisabledTS

  _.set(conversation, 'botDisabledTS', newBotDisabledTS)

  setLastUserInput(webhook_event)
// webhook_event.request_thread_control//
  const isAdmin =  !userInputHookLately && hasMids(webhook_event)
  if (isAdmin){
    console.log("*** IS ADMIN !!!!!!!" + "webhook_event.timestamp - lastUserInputTS - : " + (webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)))
    _.set(conversation, 'botDisabledTS', webhook_event.timestamp)
  }

  const timeSinceLastBotDisabled = webhook_event.timestamp - _.get(conversation, 'botDisabledTS', 0)
  const botDisabledLately = timeSinceLastBotDisabled < 5000
  const adminFalseAlarm = userInputHookLately && botDisabledLately
  if (adminFalseAlarm) _.set(conversation, 'botDisabledTS', null)

}

const isDisabled = webhook_event => _.get(getConversation(webhook_event), 'botDisabledTS')

const getMainScriptStarted = webhook_event => _.get(getConversation(webhook_event), 'mainScriptStarted')

const setMainScriptStarted = (webhook_event, val) => {
    const conversation = getConversation(webhook_event)
    _.set(conversation, 'mainScriptStarted', val)
}

const setEnglish = (webhook_event, val) => {
    const conversation = getConversation(webhook_event)
    _.set(conversation, 'english', val)
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
    setLastUserInput(webhook_event)
    return getConversation(webhook_event)
}

const setLastUserInput = (webhook_event) => {
    const conversation = getConversation(webhook_event)
    let nonUserHooksCount = _.get(conversation, 'nonUserHooksCount', 0)
    let userHooksCount = _.get(conversation, 'userHooksCount', 0)
    const lastUserInputTS = _.get(conversation, 'lastUserInputTS')
    _.set(conversation, 'lastUserInputTS', hasMids(webhook_event) ? lastUserInputTS : webhook_event.timestamp )
    _.set(conversation, 'nonUserHooksCount', hasMids(webhook_event) ? nonUserHooksCount + 1 : 0 )
    _.set(conversation, 'userHooksCount', hasMids(webhook_event) ? userHooksCount : userHooksCount + 1 )
}

const getUserHooksCount = webhook_event => _.get(getConversation(webhook_event), 'userHooksCount', 0)

const hasMids = webhook_event => _.get(webhook_event, 'delivery.mids')

module.exports = { getGender, setGender, getUserHooksCount, hasMids, setEnglish, getEnglish, initConversation, handleConversationState, isDisabled, getMainScriptStarted, setMainScriptStarted  }