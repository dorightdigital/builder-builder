describe('Batch Setting', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    this.nameBuilder = builderBuilder({
      optional: ['firstName', 'lastName', 'title', 'middleNames', 'suffix']
    });
  });

  it('should lookup all known values from getter function', function () {
    var builder = this.nameBuilder().readFromGetterFunction(function (key) {
      if (key === 'firstName') {
        return 'Cedric';
      }
      if (key === 'title') {
        return 'Sir';
      }
    });

    expect(builder.build()).toEqual({title: 'Sir', firstName: 'Cedric'});
  });

  it('should lookup all known values from object', function () {
    var builder = this.nameBuilder().withTitle('Mrs').readFromObject({
      firstName: 'Test',
      lastName: 'Tester'
    });

    expect(builder.build()).toEqual({
      title: 'Mrs',
      firstName: 'Test',
      lastName: 'Tester'
    });
  });

  it('should support object in constructor', function () {
    var builder = this.nameBuilder({
      firstName: 'Test',
      lastName: 'Tester'
    }).withTitle('Mrs');

    expect(builder.build()).toEqual({
      title: 'Mrs',
      firstName: 'Test',
      lastName: 'Tester'
    });
  });

  it('should support getter function in constructor', function () {
    var builder = this.nameBuilder(function (key) {
      if (key === 'firstName') {
        return 'Cedric';
      }
      if (key === 'title') {
        return 'Sir';
      }
    });

    expect(builder.build()).toEqual({title: 'Sir', firstName: 'Cedric'});
  });

  it('should allow mixing between various methods', function () {
    var builder = this.nameBuilder({title: 'Sir'}).readFromGetterFunction(function (key) {
      if (key === 'firstName') {
        return 'Dave';
      }
    }).withLastName('Davis');

    expect(builder.build()).toEqual({title: 'Sir', firstName: 'Dave', lastName: 'Davis'});
  });

  it('should override later values with earlier values', function () {
    var builder = this.nameBuilder({title: 'Sir', firstName: 'a', lastName: 'German'})
      .readFromGetterFunction(function (key) {
        if (key === 'firstName') {
          return 'Herman';
        }
      })
      .withTitle('Mr');

    expect(builder.build()).toEqual({title: 'Mr', firstName: 'Herman', lastName: 'German'});
  });
});