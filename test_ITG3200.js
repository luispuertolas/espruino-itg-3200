I2C1.setup( { scl: B6, sda: B7 } );
var gyro = require('ITG3200').connect( I2C1 );

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
