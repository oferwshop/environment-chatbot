const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN_PROTOTYPE

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  const responseArray = new Array()
  if (response.first) { responseArray.concat(response.first, response.second) }
    else { responseArray.push(response)}

    responseArray.forEach( (response) => {

      let request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      }
    
      // Send the HTTP request to the Messenger Platform
      request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('message sent!')
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    })
}

  module.exports = callSendAPI