lame-stream
==============

### Use ###

```
$ npm install lame-stream
```

``` js
var Lame = require('lame-stream')

var lame = new Lame()
lame.options({
    // accept mp1~3 file as input to stdin
    mp1input: null,
    mp2input: null,
    mp3input: null
})
.from('./recit.mp3')
.to('./recit-out.mp3')
```

or

``` js
var fs = require('fs')
var Lame = require('lame-stream')

var lame = new Lame()
lame.options({
    mp1input: null,
    mp2input: null,
    mp3input: null
})

src = fs.createReadStream('./tone.mp3')
dest = fs.createWriteStream('./tone-out.mp3')

src.pipe(lame).pipe(dest)
```

Lookup up './examples' for running examples.

### License ###

MIT