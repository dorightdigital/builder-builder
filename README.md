# builder-builder
A runtime builder generator for use in node, io or the browser.

## Installation & Compatibility

Builder Builder can be used on the serverside with Node.JS and IO.JS or in the browser.
No libraries, helpers or frameworks are needed - it's designed to be lightweight and portable.
Currently the following installation options are available - if more are desirable please raise an issue in Github.

#### NPM
````shell
npm install --save builder-builder
````

#### Bower
````shell
bower install --save builder-builder
````

#### Basic/Hacking/Old School
The source is available in [src/builderBuilder.js](src/builderBuilder.js), this is intentionally free of dependencies - all you need is that one file.

## Usage Examples

There are many uses for the builder pattern.  One pretty standard example is to build up a value object over a few lines:

 ````javascript
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
````

By using Builder Builder there's also support for things like cloning your builder to create new builders - this can
be really useful in tests.  In the example below we have set up an understanding of a default test user,
then each test clones it, updates the state and expects the function 'getGreeting' to represent the user described.

````javascript
describe('testing variations of user state', function () {
  function getGreeting(user) {
    return 'Hello ' + (user.alias || user.realName || user.username);
  }

  var userBuilder = builderBuilder({
      required: 'username',
      optional: ['alias', 'realName']
    }),
    generateDefaultUser = userBuilder()
     .withUsername('iamawesome')
     .withRealName('Fred Smith')
     .withAlias('Awesomeness')
     .clone;

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
````

You can also set a `postBuildHook` - this can be used for any processing of the output.
You could set new values, remove old ones or you can use it to map a problem domain - for example URLs.
The example below builds a URL string from the pieces provided:

````javascript
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
 ````

There are many more usage examples in the [tests](specs).  If you think there's something missing please raise a
 Pull Request.  It would be ideal to describe your desired use-case in a new test (or updating the expectation of an
 existing test), then if you're confident to solve the problem yourself then go ahead but if not feel free to start the
 discussion and see if someone else is willing to build the feature for you.

## Revision History
 * **1.0.1** - Adding support for cloning, removing values, assuming defaults should be overridable
   (even when they're not in optional or required).  Allowing lazy optional & required strings alongside arrays
 * **1.0.0** - Initial release, all core features in place and reliable.

## Compatibility

This library is designed to be usable in Node.JS, IO.JS and all browsers in-the-wild.  It's self-contained and dependency free.

Happy Building,

From Mat Carey - the Builder Builder Builder.
