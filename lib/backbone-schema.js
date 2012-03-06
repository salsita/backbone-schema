// (c) 2012 Salsita s.r.o.
// Dual-licensed under MIT license and GPL v2.

/**
 * Backbone schema-aware Model extension.
 * https://github.com/salsita/backbone-schema
 */

;(function() {

  // frameworks
  var _ = require('underscore')._;
  var Model = require('backbone').Model;
  var JSV = require('jsv').JSV;

  // `SchemaAwareModel` is a `Backbone.Model` that takes `schema`
  // option (when instantiated) and uses this schema (if provided) for
  // validation. `validate` function is by default invoked from `set`, `unset`
  // and `clear` Model methods and before it is added into any Collection.
  //
  // Usage:
  //    var model = new SchemaAwareModel(/* optional */ attributes,
  //                    { schema: ... });
  //
  SchemaAwareModel = Model.extend({

    _schema: null,

    initialize: function(attributes, options) {
      this._schema = options && options.schema;
      var error = this.validate({});
      if (error) {
        // this.clear() does not work when called from contructor!
        // erase the `attributes` manually;
        this.attributes = this._escapedAttributes = this._previousAttributes = {};
        this.trigger('error', error);
      }
    },

    // Allow only empty or schema-compliant attributes
    validate: function(attrs) {

      if (!this._schema) return;

      var env = JSV.createEnvironment();
      // Resulting model consists of attributes we already have set and
      // the attributes provided as argument to this function (merged).
      // When an attribute is `unset`, it is passed in `attrs` object,
      // the attribute has special value of `undefined`. To learn how the
      // resulting object will look like, we need to:
      // + merge the already-set attributes with the new ones, and
      // + remove the attributes that are to be unset.
      var obj = _.extend({}, this.attributes, attrs);
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if ('undefined' === typeof obj[key]) {
            delete obj[key];
          }
        }
      }
      if (_.isEmpty(obj)) {
        return;
      }
      var r = env.validate(obj, this._schema);

      if (0 != r.errors.length) {
        return 'Model schema validation failed: ' + r.errors[0].message
          + '\n  uri: ' + r.errors[0].uri
          + '\n  schemaUri: ' + r.errors[0].schemaUri
          + '\n  attribute: ' + r.errors[0].attribute
          + '\n  details: ' + r.errors[0].details;
      }
    }

  });

  exports.SchemaAwareModel = SchemaAwareModel;

}).call(this);
