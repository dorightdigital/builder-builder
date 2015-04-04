# builder-builder
A runtime builder generator for use in node, io or the browser

## Usage Examples

There are many usages for the builder pattern, a pretty standard example is to build up a value object over a few lines:

 ````javascript
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
````

Or you can use it to map a problem domain - for example URLs:

````javascript
      var urlBuilder = builderBuilder({
        required: ['host'],
        optional: ['port', 'path', 'protocol', 'queryString'],
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

      expect(urlBuilder().withHost('example.com').withProtocol('https').build()).toBe('https://example.com/');
      expect(urlBuilder().withHost('example.com').withPath('/abc/def').build()).toBe('http://example.com/abc/def');
      expect(urlBuilder()
        .withHost('lmgtfy.com')
        .withQueryString('q=Builder+Builder+By+DoRightDigital')
        .build()).toBe('http://lmgtfy.com/?q=Builder+Builder+By+DoRightDigital');
    });
 ````

There are many more usage examples in the [tests](specs).  If you think there's something missing please raise a
 Pull Request.  It would be ideal to describe your desired use-case in a new test (or updating the expectation of an
 existing test), then if you're confident to solve the problem yourself then go ahead but if not feel free to start the
 discussion and see if someone else is willing to build the feature for you.

## Compatibility

This library is designed to be usable in Node.JS, IO.JS and all browsers in-the-wild.  It's self-contained and dependency free.

Happy Building,

From Mat Carey - the Builder Builder Builder.