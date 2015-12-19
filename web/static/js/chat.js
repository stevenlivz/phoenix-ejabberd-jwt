//var BOSH_SERVICE = 'http://xmpp.alchemy.local:5280/http-bind'
var BOSH_SERVICE = 'ws://xmpp.alchemy.local:5280/websocket';
var XMPP_DOMAIN = "alchemy.local";

var connection = null;

function log(msg)
{
  $('#log').prepend('<div></div>').prepend(document.createTextNode(msg));
}

function getMessage(stanza) {
  log(stanza);
}

function rawInput(data)
{
  log('RECV: ' + data);
}

function rawOutput(data)
{
  log('SENT: ' + data);
}

function onConnect(status)
{
  if (status == Strophe.Status.CONNECTING) {
    log('Strophe is connecting.');
  } else if (status == Strophe.Status.CONNFAIL) {
    log('Strophe failed to connect.');
    $('#connect').get(0).value = 'connect';
  } else if (status == Strophe.Status.DISCONNECTING) {
    log('Strophe is disconnecting.');
  } else if (status == Strophe.Status.DISCONNECTED) {
    log('Strophe is disconnected.');
    $('#connect').get(0).value = 'connect';
  } else if (status == Strophe.Status.CONNECTED) {
    log('Strophe is connected.');

    // initialise presence
    connection.send($pres());
  }
}
function sendMessage() {
  var message = $('#message').get(0).value;
  var to = $('#to').get(0).value;
  connection.send($msg({to: to + '@'+ XMPP_DOMAIN, from: USER, type: 'normal'}).c("body").t(message));
}


$(document).ready(function () {
  connection = new Strophe.Connection(BOSH_SERVICE);
  connection.rawInput = rawInput;
  connection.rawOutput = rawOutput;

  // connect using jwt token

  connection.connect(USER, JWT, onConnect);

  /*$('#connect').bind('click', function () {
   var button = $('#connect').get(0);
   if (button.value == 'connect') {
   button.value = 'disconnect';

   connection.connect($('#jid').get(0).value,
   $('#pass').get(0).value,
   onConnect);
   } else {
   button.value = 'connect';
   connection.disconnect();
   }
   });*/
});