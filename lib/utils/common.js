var error = require('./error');

exports.flattenShallow = function(array) {
  if (!array || !array.reduce) {
    return array;
  }

  return array.reduce(function(a, b) {
    var aIsArray = Array.isArray(a);
    var bIsArray = Array.isArray(b);

    if (aIsArray && bIsArray ) {
      return a.concat(b);
    }
    if (aIsArray) {
      a.push(b);

      return a;
    }
    if (bIsArray) {
      return [a].concat(b);
    }

    return [a, b];
  });
};

exports.isFlat = function(array) {
  if (!array) {
    return false;
  }

  for (var i = 0; i < array.length; ++i) {
    if (Array.isArray(array[i])) {
      return false;
    }
  }

  return true;
};

exports.flatten = function() {
  var result = exports.argsToArray.apply(null, arguments);

  while (!exports.isFlat(result)) {
    result = exports.flattenShallow(result);
  }

  return result;
};

exports.argsToArray = function(args) {
  var result = [];

  exports.arrayEach(args, function(value) {
    result.push(value);
  });

  return result;
};

exports.numbers = function() {
  var possibleNumbers = this.flatten.apply(null, arguments);
  return possibleNumbers.filter(function(el) {
    return typeof el === 'number';
  });
};

exports.cleanFloat = function(number) {
  var power = 1e14;
  return Math.round(number * power) / power;
};

exports.parseBool = function(bool) {
  if (typeof bool === 'boolean') {
    return bool;
  }

  if (bool instanceof Error) {
    return bool;
  }

  if (typeof bool === 'number') {
    return bool !== 0;
  }

  if (typeof bool === 'string') {
    var up = bool.toUpperCase();
    if (up === 'TRUE') {
      return true;
    }

    if (up === 'FALSE') {
      return false;
    }
  }

  if (bool instanceof Date && !isNaN(bool)) {
    return true;
  }

  return error.value;
};

exports.parseNumber = function(string) {
  if (string instanceof Error) {
    return string;
  }
  if (string === undefined || string === null || string === '') {
    return 0;
  }
  if (!isNaN(string)) {
    return parseFloat(string);
  }

  return error.value;
};

exports.parseString = function(string) {
  if (string instanceof Error) {
    return string;
  }
  if (string === undefined || string === null) {
    return '';
  }

  return string.toString();
};

exports.parseNumberArray = function(arr) {
  var len;

  if (!arr || (len = arr.length) === 0) {
    return error.value;
  }

  var parsed;

  while (len--) {
    if (arr[len] instanceof Error) {
      return arr[len];
    }
    parsed = exports.parseNumber(arr[len]);
    if (parsed instanceof Error) {
      return parsed;
    }
    arr[len] = parsed;
  }

  return arr;
};

exports.parseMatrix = function(matrix) {
  var n;

  if (!matrix || (n = matrix.length) === 0) {
    return error.value;
  }
  var pnarr;

  for (var i = 0; i < matrix.length; i++) {
    pnarr = exports.parseNumberArray(matrix[i]);
    matrix[i] = pnarr;

    if (pnarr instanceof Error) {
      return pnarr;
    }
  }

  return matrix;
};

var d1900 = new Date(Date.UTC(1900, 0, 1));
exports.parseDate = function(date) {
  if (!isNaN(date)) {
    if (date instanceof Date) {
      return new Date(date);
    }
    var d = parseInt(date, 10);
    if (d < 0) {
      return error.num;
    }
    if (d <= 60) {
      return new Date(d1900.getTime() + (d - 1) * 86400000);
    }
    return new Date(d1900.getTime() + (d - 2) * 86400000);
  }
  if (typeof date === 'string') {
    date = new Date(date);
    if (!isNaN(date)) {
      return date;
    }
  }
  return error.value;
};

exports.parseDateArray = function(arr) {
  var len = arr.length;
  var parsed;
  while (len--) {
    parsed = this.parseDate(arr[len]);
    if (parsed === error.value) {
      return parsed;
    }
    arr[len] = parsed;
  }
  return arr;
};

exports.anyError = function() {
  for (var n = 0; n < arguments.length; n++) {
    if (arguments[n] instanceof Error) {
      return arguments[n];
    }
  }
  return undefined;
};

exports.anyIsError = function() {
  var n = arguments.length;
  while (n--) {
    if (arguments[n] instanceof Error) {
      return true;
    }
  }
  return false;
};

exports.anyIsString = function() {
  var n = arguments.length;
  while (n--) {
    if (typeof arguments[n] === 'string') {
      return true;
    }
  }
  return false;
};

exports.arrayValuesToNumbers = function(arr) {
  var n = arr.length;
  var el;
  while (n--) {
    el = arr[n];
    if (typeof el === 'number') {
      continue;
    }
    if (el === true) {
      arr[n] = 1;
      continue;
    }
    if (el === false) {
      arr[n] = 0;
      continue;
    }
    if (typeof el === 'string') {
      var number = this.parseNumber(el);
      if (number instanceof Error) {
        arr[n] = 0;
      } else {
        arr[n] = number;
      }
    }
  }
  return arr;
};

exports.rest = function(array, idx) {
  idx = idx || 1;
  if (!array || typeof array.slice !== 'function') {
    return array;
  }
  return array.slice(idx);
};

exports.initial = function(array, idx) {
  idx = idx || 1;
  if (!array || typeof array.slice !== 'function') {
    return array;
  }
  return array.slice(0, array.length - idx);
};

exports.arrayEach = function(array, iteratee) {
  var index = -1, length = array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }

  return array;
};

exports.transpose = function(matrix) {
  if(!matrix) {
    return error.value;
  }

  return matrix[0].map(function(col, i) {
    return matrix.map(function(row) {
      return row[i];
    });
  });
};
