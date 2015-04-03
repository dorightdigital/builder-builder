describe('Usage Examples', function () {
  "use strict";
  function loadJsConfigInBrowserOrNode() {
    return (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;
  }

  var builderBuilder = loadJsConfigInBrowserOrNode();

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
  });
});
