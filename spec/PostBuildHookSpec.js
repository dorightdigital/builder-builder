describe('Post Build Hook', function () {
  "use strict";

  var builderBuilder = (typeof require === 'function' && require('../src/builderBuilder')) || window.builderBuilder;

  beforeEach(function () {
    this.spy = jasmine.createSpy('postBuildHook');
    this.urlBuilder = builderBuilder({
      required: ['hostName'],
      postBuildHook: this.spy
    });
  });
  it('should be passed the built object', function () {
    this.urlBuilder().withHostName('example.com').build();

    expect(this.spy).toHaveBeenCalledWith({hostName: 'example.com'});
  });
  it('should be passed the built object', function () {
    this.spy.and.returnValue('this is the output from build');

    var output = this.urlBuilder().withHostName('example.com').build();

    expect(output).toBe('this is the output from build');
  });
});