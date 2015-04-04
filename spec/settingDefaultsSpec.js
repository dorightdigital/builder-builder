describe('Default values', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    this.config = {
      optional: ['a', 'c'],
      defaults: {a: 'b', c: 'd'}
    };
    this.exampleBuilder = builderBuilder(this.config);
  });
  it('should fall back to defaults when no value is set', function () {
    expect(this.exampleBuilder().build()).toEqual({
      a: 'b',
      c: 'd'
    });
  });
  it('should not share scope between two builders using the same config', function () {
    this.exampleBuilder().withA('the value');
    expect(this.exampleBuilder().build().a).toBe('b');
  });
  it('should use default values in the state they are in at the time of instantiation', function () {
    var newBuilder, oldBuilder;
    oldBuilder = this.exampleBuilder();
    this.config.defaults.a = 'xyz';
    newBuilder = this.exampleBuilder();
    expect(oldBuilder.build().a).toBe('b');
    expect(newBuilder.build().a).toBe('xyz');
  });
});
