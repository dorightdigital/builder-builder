describe('Scope Management', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  it('should keep actual reference to objects passed in - allowing you to pass in complex objects with their own state management', function () {
    var inputObject = {
        abc: 'def',
        getter: function (name) {
          return this[name];
        }
      },
      exampleBuilder = builderBuilder({
        required: ['example']
      }),
      outputObject = exampleBuilder().withExample(inputObject).build().example;

    expect(inputObject).toBe(outputObject); // practical example of this below:

    expect(inputObject.getter('ghi')).toBeUndefined();
    outputObject.ghi = 'jkl';
    expect(inputObject.getter('ghi')).toBe('jkl');
  });

  it('should clone output to avoid first-level values being changed by manipulating built output', function () {
    var exampleBuilder = builderBuilder({
        required: ['example']
      }),
      builder = exampleBuilder().withExample('abc');

    builder.build().example = 'jkl';

    expect(builder.build().example).toBe('abc');
  });
});