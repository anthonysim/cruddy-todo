const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.error(err);
    }

    let arr = [];
    files.forEach(function (file) {

      let data = file.toString().slice(0, 5);
      arr.push({ id: data, text: data });
    });
    callback(null, arr);
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

// var text = items[id];
//  if (!text) {
//   callback(new Error(`No item with id: ${id}`));
// } else {
//   callback(null, { id, text });
// }


exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
