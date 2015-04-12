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

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }

  var constructor = function (getterOrObj) {
    var self = {},
      state = {},
      defaults = {},
      required = asArray(params.required || []),
      optional = asArray(params.optional || []),
      names = required.concat(optional);

    if (params.defaults) {
      loop(params.defaults, function (val, paramName) {
        defaults[paramName] = val;
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
      var casedName = capitalize(name);
      self['with' + casedName] = setter.bind(null, name);
      self['without' + casedName] = function () {
        delete state[name];
        return self;
      };
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
        if (state[name] === undefined && defaults[name] === undefined) {
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
      var built = {};
      loop(names, function (name) {
        if (state.hasOwnProperty(name)) {
          built[name] = state[name];
        } else if (defaults.hasOwnProperty(name)) {
          built[name] = defaults[name];
        }
      });
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
    self.clone = function () {
      var newBuilder = constructor();
      loop(state, function (val, key) {
        newBuilder.with(key, val);
      });
      return newBuilder;
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

  return constructor;
}

if (typeof module === 'object') {
  module.exports = builderBuilder;
}
