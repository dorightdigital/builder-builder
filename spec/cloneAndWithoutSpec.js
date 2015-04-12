describe('Usage Examples', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    this.createUrlBuilder = builderBuilder({
      required: 'host',
      optional: ['port', 'queryString'],
      defaults: {protocol: 'http', path: '/'},
      postBuildHook: function (input) {
        var out = [];
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
        if (input.queryString) {
          out.push('?');
          out.push(input.queryString);
        }
        return out.join('');
      }
    });
    this.urlBuilder = this.createUrlBuilder({
      protocol: 'https',
      host: 'example.com',
      port: '8080',
      path: '/abcdefg'
    });
  });

  afterEach(function () {
    expect(this.urlBuilder.build()).toBe('https://example.com:8080/abcdefg');
  });
  it('should be able to change values without affecting original', function () {
    var myUrlBuilder = this.urlBuilder.clone();

    myUrlBuilder.withPort('3000').withProtocol('http');

    expect(myUrlBuilder.build()).toBe('http://example.com:3000/abcdefg');
  });
  it('should be able to remove values without affecting original', function () {
    var myUrlBuilder = this.urlBuilder.clone();

    myUrlBuilder.withoutPort().withoutPath();

    expect(myUrlBuilder.build()).toBe('https://example.com/');
  });
  it('should be able to remove values without affecting original', function () {
    var myUrlBuilder = this.urlBuilder.clone();

    myUrlBuilder.withoutPort();

    expect(myUrlBuilder.build()).toBe('https://example.com/abcdefg');
  });
  it('should fall back to default values when removing', function () {
    var myUrlBuilder = this.urlBuilder.clone();

    myUrlBuilder.withoutPath().withoutProtocol().withoutPort();

    expect(myUrlBuilder.build()).toBe('http://example.com/');
  });
  it('should be able to add new values', function () {
    var myUrlBuilder = this.urlBuilder.clone();

    myUrlBuilder.withQueryString('abc=def&ghi=jkl');

    expect(myUrlBuilder.build()).toBe('https://example.com:8080/abcdefg?abc=def&ghi=jkl');
  });
});
