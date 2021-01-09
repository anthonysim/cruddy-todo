const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
var readFileAsync = Promise.promisify(require('fs').readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, data) => {
    let file = path.join(exports.dataDir, `${data}.txt`);

    fs.writeFile(file, text, (err) => {
      if (err) {
        console.error(err);
      } else {
        callback(null, { id: data, text });
      }
    });
  });
};


exports.readOne = (id, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: data.toString() });
    }
  });
};

// exports.readAll = (callback) => {
//   fs.readdir(exports.dataDir, (err, files) => {
//     if (err) {
//       console.error(err);
//     }

//     let arr = [];
//     files.forEach(function (file) {

//       let data = file.toString().slice(0, 5);
//       arr.push({ id: data, text: data });
//     });
//     callback(null, arr);
//   });
// };

exports.readAll = (callback) => {
  // promise to get all the file names
  let p = new Promise((resolve, reject) => {
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

  p.then(files => {
    let todos = files.map(file => {
      let id = file.toString().slice(0, 5);

      // console.log('id', id);
      return readFileAsync(path.join(exports.dataDir, file))
        .then(data => {
          return {
            id,
            text: data.toString()
          };
        });
    });
    // Promise.all(todos).then(todo => console.log(todo));
    Promise.all(todos).then(todo => callback(null, todo)).catch(err => callback(err));
  });
};




exports.update = (id, text, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err, data) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};


exports.delete = (id, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
