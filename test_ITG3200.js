var I2C1 = new I2C();
I2C1.setup( { scl: B6, sda: B7 } );
var gyro = require('https://github.com/polhomarkho/espruino-itg-3200/blob/master/ITG3200.js').connect( I2C1 );

console.log("Calibrating offset...");

gyro.calibrateOffset();

console.log("Getting values...");

setInterval( function () {
  d = gyro.read();
  console.log("temp : " + d.temp);
  console.log("x : " + d.x);
  console.log("y : " + d.y);
  console.log("z : " + d.z);
  console.log(" ");
}, 1000);
