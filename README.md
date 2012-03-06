# backbone-schema

## Description

*Backbone.Model* doesn't perform any explicit validation on data that is being
*set* and *unset* on it. However the validation capability was taken into
account and derived models can introduce `validate` function and perform sanity
checks themselves.

*SchemaAwareModel*, presented here in *backbone-schema.js* CommonJS module,
validates model's data against provided schema-describing object. It makes sure
that the model is either empty, or the data set on it confirms to the provided
schema.

The schema-describing object is passed as a `schema` option when the model is
created. The schema-describing object must confirm to [Description of Structure
and Meaning of JSON
Documents](http://tools.ietf.org/html/draft-zyp-json-schema-03 "Description of
Structure and Meaning of JSON Documents").

When the result of *set*, *unset*, or *clear* methods would not yield an empty
model or model the data of which confirms to the schema, the model is not
updated at all and an `error` event is emitted. The model emits `change` event
in case the operation changing model's data succeeds.


## Dependencies

The SchemaAwareModel implementation depends on the following libraries / modules:

* [backbone.js](http://documentcloud.github.com/backbone/ "backbone.js"): the
Backbone functionality we are extending,
* [JSV.js](https://github.com/garycourt/JSV/ "JSV.js"): JSON Schema Validator, and
* [underscore.js](http://documentcloud.github.com/underscore/ "underscore.js"):
the utility library.

The SchemaAwareModel is a CommonJS module and uses other CommonJS modules, so
function `require()` must exist in the execution context.


## Usage

      var model = new SchemaAwareModel(/* optional */ attributes, { schema: ... });
      model.set(/* attributes */);
      model.set(/* attributes */);
      model.set(/* attributes */);
      ...
      model.get(/* attributes */);


## Example

      var Model = require('backbone-schema').SchemaAwareModel;

      var schema = {
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
      };

      var model = new Model( {}, { schema: schema} );

      // verify that events are emitted correctly
      model.bind('error', error);
      model.bind('change', change);

      model.set({ text: 'hello world' }); // fails: 'done' required
      model.set({ text: 'hello world', done: true }); // OK
      model.set({ extra: 1 }); // OK, extra properties allowed
      model.set({ extra: 'test' }); // OK, no type checking for extra properties
      model.set({ number: 1 }); // OK
      model.set({ number: 'test' }); // fails: 'number' must be numeric
      model.unset('text'); // fails: 'text' is required
      model.unset('number'); // OK
      model.clear(); // OK

      function error() {
        console.log('--> error <--');
      }

      function change() {
        console.log('--> OK <--');
      }


## Testing

Jasmine-node test specification for SchemaAwareModel code can be found in
tests/specs/schema-aware-model.spec.js file. To run the tests, go to the tests
directory and run the test suite:

      $ jasmine-node --verbose specs


