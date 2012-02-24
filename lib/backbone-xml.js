// (c) 2012 Salsita s.r.o.
// Dual-licensed under MIT license and GPL v2.

/**
 * Backbone XML schema-aware Model extension.
 * https://github.com/salsita/backbone-xml
 */

;(function() {

  // frameworks
  var _ = require('underscore')._;
  var Model = require('backbone').Model;
  var Parser = require('xml2js').Parser;
  var Validator = require('xml2js-schema').Validator;
  if ('undefined' === typeof $) {
    // node.js environment
    $ = require('jquery');
  }

  // map from CRUD to HTTP
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

  // helper function to get a URL from a Model or Collection as a property
  // or as a function
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // throw an error when a URL is needed, and none is supplied
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // XML synchronizing capability (read-only for now) with optional schema
  // verification on parsed object. If schema verification is desired, pass the
  // schema-describing object in `schema` option. Model or Collection using this
  // synchronizing function will emit `error` event on parsing or validating
  // error accompanied with text description of the problem.
  function xmlSync(method, model, options) {

    // read-only for now
    if (method != 'read') {
      return false;
    }

    var type = methodMap[method];

    // XML-request options
    var params = _.extend({
      type: type,
      contentType: 'application/xml',
      // we don't want jQuery to process retrieved data
      dataType: 'text',
    }, options);

    // ensure that we have a URL
    if (!params.url) {
      params.url = getUrl(model) || urlError();
    }

    // ensure that we have the appropriate request data
    if (!params.data && model && (method == 'create' || method == 'update')) {
      // TODO: javascript to XML conversion
      params.data = {};
    }

    // convert XML into javascript before the original
    // success callback is invoked
    var origSuccess = params.success;
    params.success = function(data, textStatus, xhr) {
      var parser = new Parser({validator: params.schema ?
        new Validator(params.schema): null});
      parser.addListener('end', function(result) {
        origSuccess(result, textStatus, xhr);
      });
      parser.addListener('error', function(text) {
        model.trigger('error', text);
      });
      parser.parseString(data);
    };

    // make the request
    return $.ajax(params);
  };


  // `XMLModel` is a `Backbone.Model` that uses the above `xmlSync`
  // synchronizing function.
  //
  // Usage:
  //    var model = new XMLModel(/* optional */ attributes);
  //    model.bind('change', callback);
  //    model.fetch({ url: ..., schema: ... });
  //
  XMLModel = Model.extend({
    sync: xmlSync
  });

  exports.XMLModel = XMLModel;

}).call(this);
