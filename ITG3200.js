function ITG3200(i2c, options) {
  this.i2c = i2c;
  this.address = (options && options.address) || ITG3200.DEFAULT_ADDRESS;

  this.xOffset = 0;
  this.yOffset = 0;
  this.zOffset = 0;

  // init
  this.write8(ITG3200.PWR_MGM, 0x00);
  this.write8(ITG3200.SMPLRT_DIV, 0x07);
  this.write8(ITG3200.DLPF_FS, 0x1E);  // FS_SEL = 3, DLPF_CFG = 6
  this.write8(ITG3200.INT_CFG, 0x00);  // TODO modify to enable interrup on new data
}

// FIXME : it could be far better to use interrupt to get new data
ITG3200.prototype.calibrateOffset = function () {
  var d = this.getRawAnglesValues();
  this.xOffset = (this.xOffset + d.x)
  this.yOffset = (this.yOffset + d.y)
  this.zOffset = (this.zOffset + d.z)
  for (var i = 0; i < 200; i++) {
    var d = this.getRawAnglesValues();
    this.xOffset = (this.xOffset + d.x) / 2;
    this.yOffset = (this.yOffset + d.y) / 2;
    this.zOffset = (this.zOffset + d.z) / 2;
    if (i % 50 === 0) {
      console.log("i : " + i);
      console.log("xOffset : " + this.xOffset);
      console.log("yOffset : " + this.yOffset);
      console.log("zOffset : " + this.zOffset);
      console.log(" ");
    }
  }
};

// debug function
ITG3200.prototype.r = function () {
  console.log(this.read8(ITG3200.SMPLRT_DIV));
  console.log(this.read8(ITG3200.PWR_MGM));
  console.log(this.read8(ITG3200.INT_CFG));
  console.log(this.read8(ITG3200.DLPF_FS));
};

// raw angles data without offset substraction
ITG3200.prototype.getRawAnglesValues = function () {
  this.i2c.writeTo(this.address, ITG3200.X_MSB_BUF);
  var d = this.i2c.readFrom(this.address, ITG3200.ANGLES_BIT_NUM);
  return {
    x:    ITG3200.fromTwoComplement(d[0], d[1]),
    y:    ITG3200.fromTwoComplement(d[2], d[3]),
    z:    ITG3200.fromTwoComplement(d[4], d[5]),
  };
};

// angles in °/s
ITG3200.prototype.read = function () {
  this.i2c.writeTo(this.address, ITG3200.TEMPERATURE_MSB_BUF);
  var d = this.i2c.readFrom(this.address, ITG3200.ALL_DATA_BIT_NUM);
  return {
    x:    (ITG3200.fromTwoComplement(d[2], d[3]) - this.xOffset) / ITG3200.SENSITIVITY,
    y:    (ITG3200.fromTwoComplement(d[4], d[5]) - this.yOffset) / ITG3200.SENSITIVITY,
    z:    (ITG3200.fromTwoComplement(d[6], d[7]) - this.zOffset) / ITG3200.SENSITIVITY,
    temp: 35 + (ITG3200.fromTwoComplement(d[0], d[1])+ 13200) / 280
  };
  console.log(This.x);
  console.log(" ");
};

// Internal API: Read one byte from register reg
ITG3200.prototype.read8 = function (reg) {
  this.i2c.writeTo(this.address, reg);
  var d = this.i2c.readFrom(this.address, 1);
  return d[0];
};

// Internal API: Write one byte value to register reg
ITG3200.prototype.write8 = function (reg, value) {
  this.i2c.writeTo(this.address, [reg, value]);
};

// Internal API: convert from two 8-bit 2's complement
ITG3200.fromTwoComplement = function (msb, lsb) {
    var t = msb << 8 | lsb;  // msb << 8 + lsb
    // t >= 32768 (= 0x8000) ? t - 65536 (= 0x10000) : t
    // is t negative ? (= first bit set to 1) if true, apply 1's complement, else return it
    // see https://en.wikipedia.org/wiki/Two's_complement
    return t & 0x8000 ? t - 0x10000 : t; // correct 2's complement
};

ITG3200.DEFAULT_ADDRESS = 0x68;
ITG3200.PWR_MGM = 0x3E;
ITG3200.SMPLRT_DIV = 0x15;
ITG3200.DLPF_FS = 0x16;
ITG3200.INT_CFG = 0x17;
ITG3200.X_MSB_BUF = 0x1D;
ITG3200.TEMPERATURE_MSB_BUF = 0x1B;
ITG3200.ANGLES_BIT_NUM = 6;
ITG3200.ALL_DATA_BIT_NUM = 8;
ITG3200.SENSITIVITY = 14.375;  // sensitivity  of 14.375 LSBs per °/sec

exports.connect = function (i2c, options) { return new ITG3200(i2c, options); };
