'use strict';

var util = require('../lib/adminUtil');
var request = require('../lib/requestProcessor');
var views = require('../helper/viewsHelper');
var fieldsHelper = require('../helper/fieldsHelper');
//const utilNode = require('util');

var async = require('async');

module.exports = function(req, res) {
    var instance = util.findInstanceObject(req);
    // sails.log.info("Instance: " + JSON.stringify(instance.uri));
    //sails.log.info(utilNode.inspect(instance, { showHidden: true, depth: 1 }));
    if (!instance.model) {
        return res.notFound();
    }
    if (!instance.config.add) {
        return res.redirect(instance.uri);
    }
    var fields = fieldsHelper.getFields(req, instance, 'add');
    var data = {}; //list of field values
    async.series([
        function loadAssociations(done) {
            fieldsHelper.loadAssociations(fields, function(err, result) {
                fields = result;
                done();
            });
        },

        function checkPost(done) {
            if (req.method.toUpperCase() === 'POST') {
                var reqData = request.processRequest(req, fields);
                instance.model.create(reqData).exec(function(err, record) {
                    if (err) {
                        req._sails.log.error(err);
                        data = reqData;
                        return done(err);
                    }
                    return done();
                });
            } else {
                done();
            }
        }
    ], function(err) {
        return res.viewAdmin({
            instance: instance,
            fields: fields,
            data: data
        });
    });

};
