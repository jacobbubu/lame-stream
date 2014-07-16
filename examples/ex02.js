var fs = require('fs')
var Lame = require('../lib/index')

var lame = new Lame()
lame.options({
    mp1input: null,
    mp2input: null,
    mp3input: null
})

src = fs.createReadStream('./tone.mp3')
dest = fs.createWriteStream('./tone-out.mp3')

src.pipe(lame).pipe(dest)