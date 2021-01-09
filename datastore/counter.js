const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;
var Promise = require('bluebird');
const pfs = Promise.promisifyAll(require('fs'));

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

// const readCounter = (callback) => { // (err, id) => writeCounter(id + 1, callback)
//   fs.readFile(exports.counterFile, (err, fileData) => {
//     if (err) {
//       callback(null, 0); // (err, id) => writeCounter(id + 1, callback)
//     } else {
//       callback(null, Number(fileData)); // (err, id) => writeCounter(id + 1, callback)
//     }
//   });
// };

const readCounter = (callback) => {
  pfs.readFileAsync(exports.counterFile)
    .then((data) => callback(null, Number(data)))
    .catch(() => callback(null, 0));
};

// const writeCounter = (count, callback) => { // exports.create = (text, callback)
//   var counterString = zeroPaddedNumber(count);
//   fs.writeFile(exports.counterFile, counterString, (err) => {
//     if (err) {
//       throw ('error writing counter');
//     } else {
//       callback(null, counterString); // exports.create = (text, callback)
//     }
//   });
// };

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);

  pfs.writeFileAsync(exports.counterFile, counterString)
    .then(() => callback(null, counterString))
    .catch(() => console.error('error writing counter'));
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  readCounter((err, id) => writeCounter(id + 1, callback));
};


// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
