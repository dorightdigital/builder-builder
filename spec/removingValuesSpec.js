describe('Removing Values', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  it('should be able to remove default values', function () {
    var nameBuilder = builderBuilder({
        optional: ['firstName', 'lastName', 'middleName']
      }),
      name = nameBuilder()
        .with('firstName', 'abc')
        .withLastName('def')
        .withMiddleName('embarressing')
        .withoutMiddleName();

    expect(name.build()).toEqual({
      firstName: 'abc',
      lastName: 'def'
    });
  });
});