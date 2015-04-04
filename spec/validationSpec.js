describe('Validation', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    var exampleBuilder = builderBuilder({
      required: ['anExample', 'url'],
      optional: ['anotherExample', 'optional']
    });
    this.builder = exampleBuilder();
  });
  it('should validate when building', function () {
    spyOn(this.builder, 'validate');

    expect(this.builder.withAnExample('abc').withUrl('def').build).toThrow();

    expect(this.builder.validate).toHaveBeenCalled();
  });
  it('validation should be based on list of missing required fields - failure example', function () {
    spyOn(this.builder, 'listMissingFields').and.returnValue([]);

    var validationResponse = this.builder.validate();

    expect(this.builder.listMissingFields).toHaveBeenCalled();
    expect(validationResponse).toBe(true);
  });
  it('validate should hook into missing fields for consistency', function () {
    spyOn(this.builder, 'listMissingFields').and.returnValue(['a']);

    var validationResponse = this.builder.validate();

    expect(this.builder.listMissingFields).toHaveBeenCalled();
    expect(validationResponse).toBe(false);
  });
  it('should error with a message', function () {
    expect(this.builder.build).toThrow(new Error('Could not build as builder didn\'t validate: missing anExample, url'));
  });
  it('should error with a message listing missing fields when building with missing fields', function () {
    spyOn(this.builder, 'listMissingFields').and.returnValue(['one', 'two', 'three']);

    expect(this.builder.build).toThrow(new Error('Could not build as builder didn\'t validate: missing one, two, three'));
  });
});