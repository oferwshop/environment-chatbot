const _ = require('lodash')

const conversations = {}
const botDisablePeriod =  1000 * 60 * 30
const expirationPeriod = 1000 * 60 * 30

const shouldReEnableBot = (timestamp, botDisabledTS) => timestamp - botDisabledTS > botDisablePeriod

const getConversation = webhook_event => conversations[webhook_event.recipient.id]

const initConversation = webhook_event => {
    _.set(conversations, webhook_event.recipient.id, {} )
    setLastUserInput(webhook_event)
    return getConversation(webhook_event)
}

const setLastUserInput = webhook_event =>
  _.set(getConversation(webhook_event), 'lastUserInputTS', hasMids ? _.get(conversation, 'lastUserInputTS'): webhook_event.timestamp )

const handleConversationState = (webhook_event) => {
  console.log("*** CONVERSATIONS: " + JSON.stringify(conversations))

  let conversation = getConversation(webhook_event) || initConversation(webhook_event)

  const timeSinceLastUserInput = webhook_event.timestamp - lastUserInputTS
  const converstationExpired = timeSinceLastUserInput > expirationPeriod
  if (converstationExpired) conversation = initConversation(webhook_event)

  const hasMids = _.get(webhook_event, 'delivery.mids')
  const userInputHookLately = timeSinceLastUserInput < 5000
  const oldBotDisabledTS = _.get(conversation, 'botDisabledTS')
  const newBotDisabledTS = oldBotDisabledTS && shouldReEnableBot(webhook_event.timestamp, oldBotDisabledTS) ? null: oldBotDisabledTS

  _.set(conversation, 'botDisabledTS', newBotDisabledTS)

  setLastUserInput(webhook_event)

  const isAdmin = !userInputHookLately && hasMids
  if (isAdmin){
    console.log("*** IS ADMIN !!!!!!!" + "webhook_event.timestamp - lastUserInputTS - : " + (webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)))
    _.set(conversation, 'botDisabledTS', webhook_event.timestamp)
  }

}

const isDisabled = webhook_event => _.get(getConversation(webhook_event), 'botDisabledTS')

const getMainScriptStarted = webhook_event => _.get(getConversation(webhook_event), 'mainScriptStarted')

const setMainScriptStarted = (webhook_event, val) => {
    const conversation = getConversation(webhook_event)
    _.set(conversation, 'mainScriptStarted', val)
}

module.exports = { initConversation, handleConversationState, isDisabled, getMainScriptStarted, setMainScriptStarted  }