describe('Usage Examples', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    this.exampleBuilder = builderBuilder({
      required: ['anExample', 'url'],
      optional: ['anotherExample', 'optional']
    });
  });

  describe('Example For README', function () {
    it('should give a complete example', function () {
      var someBuilder = builderBuilder({
          required: ['abc', 'def'],
          optional: ['ghi', 'jkl']
        }),
        output = someBuilder().withAbc('XYZ')
          .withDef('WXY').withGhi('UVW').build();

      expect(output).toEqual({
        abc: 'XYZ',
        def: 'WXY',
        ghi: 'UVW'
      });
    });
    it('should give an example of mapping a complex domain model', function () {
      var urlBuilder = builderBuilder({
          required: 'host',
          optional: ['port', 'queryParams'],
          defaults: {protocol: 'http', path: '/'},
          postBuildHook: function (input) {
            var out = [], params = input.queryParams || {}, paramName, queryString = '';
            out.push(input.protocol);
            out.push('://');
            out.push(input.host);
            if (input.port) {
              out.push(':' + input.port);
            }
            if (input.path.charAt(0) !== '/') {
              throw new Error('Paths have to begin with forward slash.  Path provdied was: ' + input.path);
            }
            out.push(input.path);
            for (paramName in params) {
              if (params.hasOwnProperty(paramName)) {
                queryString += queryString.length === 0 ? '?' : '&';
                queryString += encodeURIComponent(paramName);
                queryString += '=';
                queryString += encodeURIComponent(params[paramName]);
              }
            }
            out.push(queryString);
            return out.join('');
          }
        }),
        defaultUrlBuilder = urlBuilder().withHost('example.com').withProtocol('https'),
        specificUrlBuilder = defaultUrlBuilder.clone().withPath('/my-path');

      expect(defaultUrlBuilder.build()).toBe('https://example.com/');
      expect(specificUrlBuilder.build()).toBe('https://example.com/my-path');
      expect(urlBuilder().withHost('example.com').withPath('/abc/def').build()).toBe('http://example.com/abc/def');
      expect(urlBuilder()
        .withHost('lmgtfy.com')
        .withQueryParams({q: 'Builder Builder By DoRightDigital', abc: 'def'})
        .build()).toBe('http://lmgtfy.com/?q=Builder%20Builder%20By%20DoRightDigital&abc=def');
    });
    it('should contain a simple use case', function () {
      var builder = builderBuilder({
        required: 'username',
        optional: 'password'
      });
      expect(builder().withUsername('superman').withPassword('letmein').build()).toEqual({
        username: 'superman',
        password: 'letmein'
      });
      expect(builder().withUsername('admin').build()).toEqual({
        username: 'admin'
      });
    });
    describe('testing variations of user state', function () {
      function getGreeting(user) {
        return 'Hello ' + (user.alias || user.realName || user.username);
      }

      var userBuilder = builderBuilder({
          required: 'username',
          optional: ['alias', 'realName']
        }),
        generateDefaultUser = userBuilder().withUsername('iamawesome').withRealName('Fred Smith').withAlias('Awesomeness').clone;

      it("should greet users by their alias when available", function () {
        var user = generateDefaultUser().build();
        expect(getGreeting(user)).toBe('Hello Awesomeness');
      });
      it("should greet users by their alias when available", function () {
        var user = generateDefaultUser().withoutAlias().build();
        expect(getGreeting(user)).toBe('Hello Fred Smith');
      });
      it("should greet users by their real name when alias unavailable", function () {
        var user = generateDefaultUser().withoutAlias().withoutRealName().build();
        expect(getGreeting(user)).toBe('Hello iamawesome');
      });
      it("should greet users by their username when all else fails", function () {
        var user = generateDefaultUser().withoutAlias().withoutRealName().build();
        expect(getGreeting(user)).toBe('Hello iamawesome');
      });
      it("should make sure that username is read from user object", function () {
        var user = generateDefaultUser().withoutAlias().withoutRealName().withUsername('superman').build();
        expect(getGreeting(user)).toBe('Hello superman');
      });
    });
  });

  describe('Setter function behaviours', function () {
    beforeEach(function () {
      this.instance = this.exampleBuilder();
    });

    it('should create named "with" functions for required values', function () {
      expect(typeof this.instance.withAnExample).toBe('function');
      expect(typeof this.instance.withUrl).toBe('function');
    });

    it('should create named "with" functions for optional values', function () {
      expect(typeof this.instance.withAnotherExample).toBe('function');
      expect(typeof this.instance.withOptional).toBe('function');
    });

    it('should create have a catch-all with for those who would rather not use runtime generated functions', function () {
      expect(typeof this.instance.with).toBe('function');
    });

    it('should allow chaining', function () {
      expect(this.instance.with('optional', 'abc')).toBe(this.instance);
      expect(this.instance.withUrl('abc')).toBe(this.instance);
    });
  });
  describe('Building the setters', function () {
    it('should set required fields with generated functions', function () {
      var builder = this.exampleBuilder();
      builder.withAnExample('ABC')
        .withUrl('http://www.google.com/');

      expect(builder.build()).toEqual({
        anExample: 'ABC',
        url: 'http://www.google.com/'
      });
    });
    it('should set optional field with generated function', function () {
      var builder = this.exampleBuilder();
      builder.withAnExample('ABC')
        .withUrl('http://www.google.com/')
        .withOptional('optional value set');

      expect(builder.build()).toEqual({
        anExample: 'ABC',
        url: 'http://www.google.com/',
        optional: 'optional value set'
      });
    });
    describe('Generic "with" setter', function () {
      var builder, expected;
      beforeEach(function () {
        spyOn(console, 'warn');
        builder = this.exampleBuilder();
        builder.with('anExample', 'ABC')
          .with('url', 'http://www.google.com/')
          .with('optional', 'optional value set');
        expected = {
          anExample: 'ABC',
          url: 'http://www.google.com/',
          optional: 'optional value set'
        };
      });
      it('should set optional or required fields with the ', function () {

        expect(builder.build()).toEqual(expected);
        expect(console.warn).not.toHaveBeenCalled();
      });

      it('should warn but not blow up when using "with" setter for a value which doesn\'t exist', function () {
        builder.with('anUnknownKey', 'a value which will never make it to the output object');

        expect(builder.build()).toEqual(expected);
        expect(console.warn).toHaveBeenCalledWith('Key ', 'anUnknownKey', ' ignored as it wasn\'t defined in builder configuration');
      });

      it('should not blow up if warn is not available', function () {
        console.warn = undefined;
        expect(function () {
          builder.with('anUnknownKey', 'a value which will never make it to the output object');
        }).not.toThrow();
      });

      it('should allow chaining and set the values which are available', function () {
        builder
          .with('anUnknownKey', 'a value which will never make it to the output object')
          .with('anotherExample', 'this was defiend, therefore this will be set')
          .with('anotherUnknownKey', 'again, this won\'t appear');


        expected.anotherExample = 'this was defiend, therefore this will be set';
        expect(builder.build()).toEqual(expected);
        expect(console.warn).toHaveBeenCalledWith('Key ', 'anUnknownKey', ' ignored as it wasn\'t defined in builder configuration');
        expect(console.warn).toHaveBeenCalledWith('Key ', 'anotherUnknownKey', ' ignored as it wasn\'t defined in builder configuration');
      });
    });
  });
  it('should throw if no configuration provided', function () {
    expect(builderBuilder).toThrow(new Error('Missing required params argument in builderBuilder.  This can contain required, optional and defaults'));
  });
});
