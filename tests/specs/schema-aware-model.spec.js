describe('Schema Aware Model Testing Module', function() {

  //
  // Global settings
  //

  var Model = require('../../lib/backbone-schema').SchemaAwareModel;

  var model, schema, errorEmitted, changeEmitted;

  function resetEmitted() {
    errorEmitted = changeEmitted = false;
  }

  //
  // Before each
  //

  beforeEach(function() {

    schema = {
      name: "testing",
      type: "object",
      properties: {
        "text": {
          type: "string",
          required: true
        },
        "done": {
          type: "boolean",
          required: true
        },
        "number": {
          type: "integer"
          // not required
        }
      }
      // additionalProperties: true by default
    };

    model = new Model( {}, { schema: schema} );
    resetEmitted();

    model.bind('change', function() {
      changeEmitted = true;
    });

    model.bind('error', function() {
      errorEmitted = true;
    });

  });


  //
  // Test specs
  //

  it('should fail to set data missing a required property', function() {
    model.set({ text: 'hello world' });
    expect(model.attributes).toEqual({});
    expect(errorEmitted).toBeTruthy();
    expect(changeEmitted).toBeFalsy();
  });

  it('should set data conforming to provided schema', function() {
    model.set({ text: 'hello world', done: true });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
  });

  it('should fail to set data with wrong property type', function() {
    model.set({ text: 123, done: true });
    expect(model.attributes).toEqual({});
    expect(errorEmitted).toBeTruthy();
    expect(changeEmitted).toBeFalsy();
  });

  it('should set data conforming to provided schema plus extra property', function() {
    model.set({ text: 'hello world', done: true, extra: 123 });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(model.get('extra')).toEqual(123);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
  });

  it('should fail to set data with extra property when extra properties not allowed', function() {
    schema.additionalProperties = false;
    model = new Model( {}, { schema: schema } );
    resetEmitted();
    model.bind('change', function() {
      changeEmitted = true;
    });
    model.bind('error', function(msg) {
      errorEmitted = true;
    });
    model.set({ text: 'hello world', done: true, extra: 123 });
    expect(model.attributes).toEqual({});
    expect(errorEmitted).toBeTruthy();
    expect(changeEmitted).toBeFalsy();
  });

  it('should change type of extra property', function() {
    model.set({ text: 'hello world', done: true, extra: 123 });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(typeof model.get('extra')).toEqual('number');
    expect(model.get('extra')).toEqual(123);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
    resetEmitted();
    model.set({ extra: 'test' });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(typeof model.get('extra')).toEqual('string');
    expect(model.get('extra')).toEqual('test');
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
  });

  it('should fail to change type of property defined in provided schema', function() {
    model.set({ text: 'hello world', done: true });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
    resetEmitted();
    model.set({ done: 'test' });
    expect(model.get('text')).toEqual('hello world');
    expect(typeof model.get('done')).toEqual('boolean');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeTruthy();
    expect(changeEmitted).toBeFalsy();
  });

  it('should unset optional property', function() {
    model.set({ text: 'hello world', done: true, number: 123 });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(model.get('number')).toEqual(123);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
    resetEmitted();
    model.unset('number');
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(model.get('number')).toEqual(null);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
  });

  it('should fail to unset mandatory property', function() {
    model.set({ text: 'hello world', done: true });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
    resetEmitted();
    model.unset('done');
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeTruthy();
    expect(changeEmitted).toBeFalsy();
  });

  it('should clear already set model', function() {
    model.set({ text: 'hello world', done: true });
    expect(model.get('text')).toEqual('hello world');
    expect(model.get('done')).toEqual(true);
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
    resetEmitted();
    model.clear();
    expect(model.attributes).toEqual({});
    expect(errorEmitted).toBeFalsy();
    expect(changeEmitted).toBeTruthy();
  });

});
