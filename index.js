/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 **
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Use this project as the starting point for following the 
 * Messenger Platform quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

'use strict';

// Imports dependencies and set up http server
const 
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()),
  handleMessage = require('./src/handle-message'), // creates express http server
 // handlePostback = require('./src/handle-postback'); // creates express http server
  { parse, stringify } = require('flatted/cjs');
require('express-debug')(app);

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // console.log("POST REQUEST RECIEVED: " + stringify(req))
  
  // console.log(stringify(res))

  // Parse the request body from the POST
  let body = req.body;
  const responses = []
  // parse messaging array
  // const webhook_events = req.body.entry[0];
  // if (webhook_events.standby) console.log("******* standby *******")
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = (entry.messaging || entry.standby)[0];   
    
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      const response = handleMessage(sender_psid, webhook_event);        
    
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      /*
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
      */
     if (response) responses.push(response)
      
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  // console.log("GET REQUEST RECIEVED: " + stringify(req))

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});
