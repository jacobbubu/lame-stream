var Duplex, Lame, PassThrough, Writable, fs, inherit, isError, spawn, util, _ref,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = require('stream'), Duplex = _ref.Duplex, Writable = _ref.Writable, PassThrough = _ref.PassThrough;

spawn = require('child_process').spawn;

fs = require('fs');

util = require('util');

isError = util.isError;

inherit = util.inherits;

Lame = function(src) {
  var self;
  if (!(this instanceof Lame)) {
    return new Lame(src);
  }
  self = this;
  this.input = '-';
  this.output = '-';
  this.args = [];
  this.spawn = this.spawn.bind(this);
  this.onerror = this.onerror.bind(this);
  Duplex.call(this);
  this["in"] = new PassThrough();
  this.out = new PassThrough();
  self = this;
  this.out.on('readable', function() {
    var chunk, _results;
    _results = [];
    while ((chunk = self.out.read(16384)) !== null) {
      if (!self.push(chunk)) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
  this.out.on('end', function() {
    return self.push(null);
  });
  this["in"].on('drain', function() {
    return self.emit('drain');
  });
  this.on('finish', function() {
    return self["in"].end();
  });
  if (src) {
    this.from(src);
  }
  setImmediate(this.spawn);
  return this;
};

inherit(Lame, Duplex);

Lame.prototype.options = function(options) {
  Object.keys(options).forEach(function(key) {
    var val;
    val = options[key];
    this.args.push('--' + key);
    if (val != null) {
      return this.args.push(val);
    }
  }, this);
  return this;
};

Lame.prototype.from = function(path) {
  var read;
  read = fs.createReadStream(path);
  read.on('error', this.onerror);
  read.pipe(this);
  return this;
};

Lame.prototype.to = function(path) {
  var write;
  write = fs.createWriteStream(path);
  write.on('error', this.onerror);
  this.pipe(write);
  return this;
};

Lame.prototype.spawn = function() {
  var proc, stderr, stdin, stdout;
  if (!(__indexOf.call(this.args, '--silent') >= 0)) {
    this.args.push('--silent');
  }
  this.args.push(this.output);
  this.args.unshift(this.input);
  this.ended = false;
  proc = spawn('lame', this.args);
  stdin = proc.stdin;
  stdin.on('error', this.onerror);
  this["in"].pipe(stdin);
  stdout = proc.stdout;
  stdout.on('error', this.onerror);
  stdout.pipe(this.out);
  stderr = proc.stderr;
  stderr.on('data', this.onerror);
  stderr.on('error', this.onerror);
  return this.emit('spawn', proc);
};

Lame.prototype.onerror = function(err) {
  if (!isError(err)) {
    err = err.toString();
    if (err.indexOf("hip: Can't step back") >= 0) {
      return;
    }
    err = new Error(err);
  }
  if (!this.listeners('error')) {
    throw err;
  }
  return this.emit('error', err);
};

Lame.prototype._read = function(n) {};

Lame.prototype._write = function(chunk, enc, cb) {
  return this["in"].write(chunk, enc, cb);
};

module.exports = Lame;
