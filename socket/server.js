var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var storage = require("./amoungirl-d1e48-firebase-adminsdk-kalho-b90460b1af.json")
const axios = require('axios').default;
var io = require('socket.io-client')

const socket = io("http://10.57.29.158:3000")
require('dotenv').config()

socket.connect()
socket.on('connection', function () {
  console.log('connected');
});

const SERIAL_PORT = process.env.SERIAL_PORT;


let time = 8
let intervalId = null;

let gameValues;


var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});
socket.emit('initGame')

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);


serialport.on("open", function () {

  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };

  xbeeAPI.builder.write(frame_obj);


});

// All frames parsed by the XBee will be emitted here

// storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))

xbeeAPI.parser.on("data", function (frame) {

  //on new device is joined, register it

  //on packet received, dispatch event

  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);
  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION");
    storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {

    console.log("ZIGBEE_IO_DATA_SAMPLE_RX")
    console.log(frame.digitalSamples.DIO0)

    let buttonUp = frame.digitalSamples.DIO0 === 1
    let buttonDown = frame.digitalSamples.DIO0 === 0

    let puceIsPlayer = gameValues.players.some((player) => player.mac === frame.remote64)
    let puceIsTask = gameValues.rooms.some((room) => room.mac === frame.remote64)
    let puceIsBuzzer = gameValues.buzzer.mac === frame.remote64

    if (puceIsPlayer && buttonUp) {
      socket.emit("deathPlayer", {"mac": frame.remote64})

    } else if (puceIsBuzzer && buttonUp && !gameValues.buzzer.isActive) {
      socket.emit('buzzer', {"mac": frame.remote64})
    }

    //todo condition 15sec
    else if (puceIsTask) {
      let currentTask = gameValues.rooms.find((room) => room.mac === frame.remote64)
      if (!currentTask.task) {
        if (buttonDown) {
          let varName = function () {
            if (time > 0) {
              time--;
            } else {
              socket.emit('task', {"mac": frame.remote64, "status": true})
              clearInterval(intervalId);
              time = 10
            }
            console.log(' Time : ', time)
          };

          intervalId = setInterval(function () {
            varName(frame.remote64)
          }, 1000);

        } else {
          clearInterval(intervalId);
          time = 10
        }
      } else {
        if(buttonDown) socket.emit('task', {"mac": frame.remote64, "status": false})
      }
    }


    // storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE")
  } else {
    // console.debug("frame ", frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    // console.log("dataReceived", dataReceived);
  }


});


socket.on('initGame', (args) => {
  gameValues = args
})

socket.on('deathPlayer', (args) => {
  let player = gameValues.players.find((player) => player.mac === args.mac)
  player.isAlive = args.isAlive

  if (!args.isAlive) {
    let frame_obj = { // AT Request to be sent
      type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
      remoteCommandOptions: 0x02,
      destination64: args.mac,
      command: "D2",
      commandParameter: [0x00],
    };

    xbeeAPI.builder.write(frame_obj);
  }
})

socket.on('task', (args) => {
  let task = gameValues.rooms.find((room) => room.mac === args.mac)
  task.task = args.task
})

socket.on('buzzer', (args) => {
  gameValues.buzzer.isActive = args.status
})

socket.on('meeting', (args) => {
  if(args.countDown === 0 && !args.status){
    gameValues.buzzer.isActive = args.status
  }
})
