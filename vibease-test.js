const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const colourPicker = document.getElementById('colourPicker');
const colourButton = document.getElementById('colourButton');
const connect = document.getElementById('connect');
const deviceHeartbeat = document.getElementById('deviceHeartbeat');

var my_device;
var cmd_rx_characteristic;
var cmd_tx_characteristic;

function handleCmdRx(event) {

}

function onDisconnect(event) {
    const device = event.target;
    if (cmd_rx_characteristic) {
          cmd_rx_characteristic.removeEventListener('characteristicvaluechanged',
            handleCmdRx);
          console.log("Device disconnected!");
      }
}

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
  }


//Find the device and rx/tx characterstics...

connectButton.onclick = async () => {
  navigator.bluetooth.requestDevice({ filters: [{ services: ['DE3A0001-7100-57EF-9190-F1BE84232730'.toLowerCase()] }] })
  .then(device => {
      my_device = device;
      device.addEventListener('gattserverdisconnected', onDisconnect);
      return device.gatt.connect();
  })
  .then(server => server.getPrimaryService('DE3A0001-7100-57EF-9190-F1BE84232730'.toLowerCase()))
  .then(service => service.getCharacteristics('803C3B1F-D300-1120-0530-33A62B7838C9'.toLowerCase()))
  .then(characteristics => {
      console.log(characteristics.length + ' characteristics');
      characteristics.forEach(characteristic => {
        console.log(characteristic.uuid + ': ' + getSupportedProperties(characteristic));
          if(characteristic.uuid == '803C3B1F-D300-1120-0530-33A62B7838C9'.toLowerCase()) {
              if(characteristic.properties.read) {
                  console.log('Found cmd_rx characteristic');
                  cmd_rx_characteristic = characteristic;
                  characteristic.startNotifications();
                  characteristic.addEventListener('characteristicvaluechanged',
                      handleCmdRx);
                  console.log('Notifications started.');
              } else if(characteristic.properties.writeWithoutResponse) {
                  console.log('Found cmd_tx characteristic');
                  cmd_tx_characteristic = characteristic;
              }
          }
      });
  })
  .catch(error => {
    console.error(error.message);
  });
}
