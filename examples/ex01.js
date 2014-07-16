var Lame = require('../lib/index')

var lame = new Lame()
lame.options({
    // accept mp1~3 file as input to stdin
    mp1input: null,
    mp2input: null,
    mp3input: null
})
.from('./recit.mp3')
.to('./recit-out.mp3')