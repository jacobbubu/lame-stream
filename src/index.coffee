{ Duplex, Writable, PassThrough }= require 'stream'
spawn = require('child_process').spawn
fs = require 'fs'
util = require 'util'
isError = util.isError
inherit = util.inherits

Lame = (src) ->
    return new Lame src if not (@ instanceof Lame)
    self = @
    @input = '-'
    @output = '-'
    @args = []

    @spawn = @spawn.bind @
    @onerror = @onerror.bind @

    Duplex.call @

    @in = new PassThrough()
    @out = new PassThrough()
    self = @
    @out.on 'readable', ->
        while (chunk = self.out.read 16384) isnt null
            # if push returns false, stop writing
            if not self.push(chunk)
                break
    @out.on 'end', ->
        self.push null

    @in.on 'drain', ->
        self.emit 'drain'

    @on 'finish', ->
        self.in.end()

    @from src if src

    setImmediate @spawn
    @

inherit Lame, Duplex

Lame.prototype.options = (options) ->
    Object.keys(options).forEach (key) ->
        val = options[key]
        @args.push '--' + key
        @args.push val if val?
    , @
    @

Lame.prototype.from = (path) ->
    read = fs.createReadStream path
    read.on 'error', @onerror
    read.pipe @
    @

Lame.prototype.to = (path) ->
    write = fs.createWriteStream path
    write.on 'error', @onerror
    @pipe write
    @

Lame.prototype.spawn = ->
    # LAME will write status report to `stderr` that causes the exception thrown
    # suppress it using '--silent'
    @args.push '--silent' if not ('--silent' in @args)

    @args.push @output
    @args.unshift @input
    @ended = false

    proc = spawn 'lame', @args

    stdin = proc.stdin
    stdin.on 'error', @onerror
    @in.pipe stdin

    stdout = proc.stdout
    stdout.on 'error', @onerror
    stdout.pipe @out

    stderr = proc.stderr
    stderr.on 'data', @onerror
    stderr.on 'error', @onerror

    @emit 'spawn', proc

Lame.prototype.onerror = (err) ->
    if not isError(err)
        err = err.toString()
        # suppress warning 'hip: Can't step back...'
        return if err.indexOf("hip: Can't step back") >= 0
        err = new Error err
    throw err if not @listeners 'error'
    @emit 'error', err

Lame.prototype._read = (n) ->

Lame.prototype._write = (chunk, enc, cb) ->
    @in.write chunk, enc, cb

module.exports = Lame