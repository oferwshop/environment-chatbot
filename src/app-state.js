const _ = require('lodash')

const conversations = {}
const botDisablePeriod =  1000 * 15// * 60 * 5

const shouldReEnableBot = (timestamp, botDisabledTS) => timestamp - botDisabledTS > botDisablePeriod

const getConversation = webhook_event => conversations[webhook_event.recipient.id]
const handleConversationState = (webhook_event) => {
  console.log("*** CONVERSATIONS: " + JSON.stringify(conversations))

  const conversation = getConversation(webhook_event)
  const hasMids = _.get(webhook_event, 'delivery.mids')
  const lastUserInputTS = _.get(conversation, 'lastUserInputTS')
  const timeSinceLastUserInput = webhook_event.timestamp - lastUserInputTS
  const userInputHookLately = timeSinceLastUserInput < 5000
  const oldBotDisabledTS = _.get(conversation, 'botDisabledTS')
  const newBotDisabledTS = oldBotDisabledTS && shouldReEnableBot(webhook_event.timestamp, oldBotDisabledTS) ? null: oldBotDisabledTS

  _.set(conversation, 'botDisabledTS', newBotDisabledTS)

  _.set(conversation, 'lastUserInputTS', hasMids ? lastUserInputTS: webhook_event.timestamp )
  
  const isAdmin = !userInputHookLately && hasMids
  if (isAdmin){
    console.log("*** IS ADMIN !!!!!!!" + "webhook_event.timestamp - lastUserInputTS - : " + (webhook_event.timestamp - _.get(conversation, 'lastUserInputTS', 0)))
    _.set(conversation, 'botDisabledTS', webhook_event.timestamp)
  }

}

const isDisabled = webhook_event => _.get(getConversation(webhook_event), 'botDisabledTS')

module.exports = { handleConversationState, isDisabled }