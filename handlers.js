// This is where we'll have all our handlers, the things which do actual specialized work
const helpers = require('./helpers.js')
const lookupCardByMessage = require('./card-lookups').lookupCardByMessage
const cardLookupBySetNumber = require('./card-lookups').cardLookupBySetNumber
const lookupPackOfCardsBySet = require('./card-lookups').lookupPackOfCardsBySet
const renderListOfCards = require('./renderers').renderListOfCards
const CARD_PATTERN = new RegExp('^![0-9a-zA-Z]+')
const RULE_PATTERN = new RegExp('^![0-9]{3}(\.[0-9]{2}){0,1}$')

const handlers = {
  verifyUrl: function (body) {
    if (body.token === process.env.VERIFICATION_TOKEN) {
      return body.challenge
    }
    return 'error: token doesnt match'
  },

  handleEventCallback: function (body) {
    // This is gonna be kinda small for now!
    const evt = body.event
    const text = evt.text || ''

    const sendToChannel = helpers.makeChannelSender(evt.channel)

    console.log(text)

    if (text === '!test') {
      console.log('doing things')
      sendToChannel('This was a test!')
      return 'success'
    } else if (text.startsWith('[card]')) {
      console.log('Query based search')
      sendToChannel('Soon search by card characteristics like set or mana cost.')
    } else if (text.startsWith('!pack of')) {
      console.log('Matches pack generation')

      const command = text.split(' ')
      const set = command[command.length - 1]

      lookupPackOfCardsBySet(set)
        .then(renderListOfCards)
        .then(sendToChannel)
    } else if (RULE_PATTERN.test(text)) {
      console.log('Matches the rules')
      helpers.lookupRule(text)
    } else if (CARD_PATTERN.test(text)) {
      console.log('Matched card lookup')

      lookupCardByMessage(text)
        .then(renderListOfCards)
        .then(sendToChannel)
    }

    return ''
  }
}

module.exports = handlers