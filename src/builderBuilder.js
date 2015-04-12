function builderBuilder(params) {
  'use strict';
  if (!params) {
    throw new Error('Missing required params argument in builderBuilder.  This can contain required, optional and defaults');
  }

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

  function asArray(strOrArray) {
    return typeof strOrArray === 'object' ? strOrArray : [strOrArray];
  }

  function shallowClone(original) {
    var clone = {};
    loop(original, function (value, key) {
      clone[key] = value;
    });
    return clone;
  }

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }

  return function (getterOrObj) {
    var self = {},
      state = {},
      required = asArray(params.required || []),
      optional = asArray(params.optional || []),
      names = required.concat(optional);

    if (params.defaults) {
      loop(params.defaults, function (val, paramName) {
        state[paramName] = val;
        if (names.indexOf(paramName) === -1) {
          names.push(paramName);
        }
      });
    }

    function setter(name, value) {
      state[name] = value;
      return self;
    }

    loop(names, function (name) {
      var fnName = ('with' + capitalize(name));
      self[fnName] = setter.bind(null, name);
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
        if (state[name] === undefined) {
          missing.push(name);
        }
      });
      return missing;
    };
    self.readFromObject = function (obj) {
      return self.readFromGetterFunction(function (name) {
        return obj[name];
      });
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
      var built = shallowClone(state);
      if (params.postBuildHook) {
        built = params.postBuildHook(built);
      }
      return built;
    };
    self.build = function () {
      if (!self.validate()) {
        throw new Error('Could not build as builder didn\'t validate: missing ' + self.listMissingFields().join(', '));
      }
      return self.buildWithoutValidating();
    };
    if (getterOrObj) {
      if (typeof getterOrObj === 'function') {
        self.readFromGetterFunction(getterOrObj);
      } else {
        self.readFromObject(getterOrObj);
      }
    }
    return self;
  };
}

if (typeof module === 'object') {
  module.exports = builderBuilder;
}
