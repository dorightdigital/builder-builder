describe('Usage Examples', function () {
  "use strict";
  function loadJsConfigInBrowserOrNode() {
    return (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;
  }

  var builderBuilder = loadJsConfigInBrowserOrNode();

  beforeEach(function () {
    this.exampleBuilder = builderBuilder({
      required: ['anExample', 'url'],
      optional: ['anotherExample', 'optional']
    });
  });

  //describe('Example For README', function () {
  //  it('should give a complete example', function () {
  //    var someBuilder = builderBuilder({
  //        required: ['abc', 'def'],
  //        optional: ['ghi', 'jkl']
  //      }),
  //      output = someBuilder().withAbc('XYZ')
  //        .withDef('WXY').withGhi('UVW').build();
  //
  //    expect(output).toEqual({
  //      abc: 'XYZ',
  //      def: 'WXY',
  //      ghi: 'UVW'
  //    });
  //  });
  //});
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
      builder.withAnExample('ABC');
      builder.withUrl('http://www.google.com/');

      expect(builder.build()).toEqual({
        anExample: 'ABC',
        url: 'http://www.google.com/'
      });
    });
    it('should set optional field with generated function', function () {
      var builder = this.exampleBuilder();
      builder.withAnExample('ABC');
      builder.withUrl('http://www.google.com/');
      builder.withOptional('optional value set');

      expect(builder.build()).toEqual({
        anExample: 'ABC',
        url: 'http://www.google.com/',
        optional: 'optional value set'
      });
    });
    it('should set optional or required fields with the generic "with" setter', function () {
      var builder = this.exampleBuilder();
      builder.with('anExample', 'ABC');
      builder.with('url', 'http://www.google.com/');
      builder.with('optional', 'optional value set');

      expect(builder.build()).toEqual({
        anExample: 'ABC',
        url: 'http://www.google.com/',
        optional: 'optional value set'
      });
    });
  });
});
