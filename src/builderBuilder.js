/*globals console*/

function builderBuilder(params) {
  'use strict';

  function warn() {
    if (console && console.warn) {
      console.warn.apply(console, arguments);
    }
  }

  function loop(arr, callback) {
    var key, returnVal;
    for (key in arr) {
      if (arr.hasOwnProperty(key)) {
        returnVal = callback(arr[key], key);
        if (returnVal === false) {
          return;
        }
      }
    }
  }

  function isObject(obj) {
    return typeof obj === 'object' && obj.length === undefined;
  }

  function clone(original) {
    var newObj = {};
    if (!isObject(original) || original === undefined) {
      return original;
    }
    loop(original, function (val, key) {
      newObj[key] = val;
    });
    return newObj;
  }

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }

  return function () {
    if (!params) {
      throw 'Missing required params argument in builderBuilder.  This can contain required, optional and defaults';
    }
    var state = clone(params.defaults || {}),
      self = {},
      required = params.required || [],
      optional = params.optional || [],
      names = required.concat(optional);

    function setter(name, value) {
      state[name] = value;
      return self;
    }

    loop(names, function (name) {
      self['with' + capitalize(name)] = setter.bind(null, name);
    });

    self.with = function (name, value) {
      if (names.indexOf(name) > -1) {
        setter(name, value);
      } else {
        warn('Key ', name, ' ignored as it wasn\'t defined in builder configuration');
      }
      return self;
    };
    self.listMissingFields = function () {
      var missing = [];
      loop(required, function (name) {
        if (!state[name]) {
          missing.push(name);
        }
      });
      return missing;
    };
    self.readFromGetterFunction = function (getter) {
      loop(names, function (name) {
        var value = getter(name);
        if (value !== undefined) {
          setter(name, value);
        }
      });
      return self;
    };
    self.validate = function () {
      return self.listMissingFields().length === 0;
    };
    self.buildWithoutValidating = function () {
      var built = clone(state);
      if (params.postBuildHook) {
        built = params.postBuildHook(built);
      }
      return built;
    };
    self.build = function () {
      if (self.validate()) {
        return self.buildWithoutValidating();
      }
      throw new Error('Could not build as builder didn\'t validate: missing ' + self.listMissingFields().join(', '));
    };
    return self;
  };
}

if (typeof module === 'object') {
  module.exports = builderBuilder;
}
