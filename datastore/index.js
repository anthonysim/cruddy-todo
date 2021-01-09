const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');

// you can promisify individual node methods
// var readFileAsync = Promise.promisify(require('fs').readFile);
// var readdirAsync = Promise.promisify(require('fs').readdir);

// https://sodocumentation.net/bluebird/topic/5655/converting-a-callback-api-to-promises-
// this automatically adds `Async` postfixed methods to `fs`.
const pfs = Promise.promisifyAll(require('fs'));


var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

// exports.create = (text, callback) => {
//   counter.getNextUniqueId((err, data) => {
//     let file = path.join(exports.dataDir, `${data}.txt`);

//     fs.writeFile(file, text, (err) => {
//       if (err) {
//         console.error(err);
//       } else {
//         callback(null, { id: data, text });
//       }
//     });
//   });
// };


exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    let file = path.join(exports.dataDir, `${id}.txt`);

    pfs.writeFileAsync(file, text)
      .then(() => callback(null, { id, text }))
      .catch(() => callback(err));
  });
};



// exports.readOne = (id, callback) => {
//   let filePath = path.join(exports.dataDir, `${id}.txt`);

//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       callback(new Error(`No item with id: ${id}`));
//     } else {
//       callback(null, { id, text: data.toString() });
//     }
//   });
// };

exports.readOne = (id, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  pfs.readFileAsync(filePath)
    .then((data) => callback(null, { id, text: data.toString() }))
    .catch(() => callback(new Error(`No item with id: ${id}`)));
};

// Version 1
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

// Version 2 - Refactored
exports.readAll = (callback) => {
  return pfs.readdirAsync(exports.dataDir)
    .then(files => {
      let todos = files.map(file => {

        return pfs.readFileAsync(path.join(exports.dataDir, file))
          .then(data => {
            return {
              id: file.toString().slice(0, 5),
              text: data.toString()
            };
          });
      });
      // Promise.all(todos).then(todo => console.log(todo));
      Promise.all(todos)
        .then(todo => callback(null, todo))
        .catch(err => callback(err));
    });
};


// exports.update = (id, text, callback) => {
//   let filePath = path.join(exports.dataDir, `${id}.txt`);

//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       callback(new Error(`No item with id: ${id}`));
//     } else {
//       fs.writeFile(filePath, text, (err, data) => {
//         if (err) {
//           callback(new Error(`No item with id: ${id}`));
//         } else {
//           callback(null, { id, text });
//         }
//       });
//     }
//   });
// };

exports.update = (id, text, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      pfs.writeFileAsync(filePath, text)
        .then(() => callback(null, { id: id, text }))
        .catch(() => callback(new Error(`No item with id: ${id}`)));
    }
  });
};




// exports.delete = (id, callback) => {
//   let filePath = path.join(exports.dataDir, `${id}.txt`);

//   fs.unlink(filePath, (err) => {
//     if (err) {
//       callback(new Error(`No item with id: ${id}`));
//     } else {
//       callback();
//     }
//   });
// };

exports.delete = (id, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  pfs.unlinkAsync(filePath)
    .then(() => callback())
    .catch(() => callback(new Error(`No item with id: ${id}`)));
};


// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
