'use strict';

/**
 * Module dependencies.
 **/
var _ 			= require('lodash'),
	fs 				= require('fs'),
	async 		= require('async'),
	mongoose 	= require('mongoose'),
	path 			= require('path'),
	spawn 		= require('child_process').spawn;

function Seeder(options, callback) {
	var that = this;

	this.result = {
		db: "",
		cleared: [],
		populate: {}
	};

	// Set default options
	var defaultOptions = {
		mongodb: {
        host: "localhost",
        port: 27017,
        dbname: "mongoose-seed-plus-dev"
    },
    dump: {
        bin: "/usr/local/bin/mongodump",
        enable: false,
        args: []
    },
    models: [],
    path: ""
	};

	defaultOptions.dump.args = [
		'--db', options.mongodb.dbname || defaultOptions.mongodb.dbname,
		'--out', "",
		'--quiet'
  ];

	var args = [];
	if (options.dump.args) {
		args = _.concat(defaultOptions.dump.args, options.dump.args);
	}

	this.options = _.merge(defaultOptions, options);
	this.options.dump.args = args;

	async.waterfall([
		function connect(callback) {
			return that.connect(callback);
		},
		function dump(callback) {
			if (that.options.dump.enable) {
				return that.dump(callback);
			}

			return callback();
		},
		function loadModels(callback) {
			return that.loadModels(callback);
		},
		function clearModels(callback) {
			return that.clearModels(callback);
		},
		function readData(callback) {
			return that.readData(callback);
		},
		function populateModels(data, callback) {
			return that.populateModels(data, callback);
		},
	], function (err) {
		if (err) {
			return callback(err, null);
		}

		mongoose.connection.close();
		return callback(null, that.result);
	});
}

Seeder.prototype.connect = function(callback) {
	var dbURI = 'mongodb://'+ this.options.mongodb.host +':'+ this.options.mongodb.port +'/'+ this.options.mongodb.dbname;
	this.result.db = dbURI;

	mongoose.connect(dbURI, { useMongoClient: true });

  mongoose.connection.on('connected', function() {
    return callback();
  });

  mongoose.connection.on('error', function(err) {
    return callback({ "code": "connect", message: "Could not connect to MongoDB!", error: err });
  });
};

Seeder.prototype.dump = function(callback) {
	try {
		var mongodump = spawn(this.options.dump.bin, this.options.dump.args);
	}
	catch (err) {
		return callback({ code: "dump", message: 'Could not dump ' + this.options.mongodb.dbname, error: err });
	}

	mongodump.on('exit', function () {
		return callback();
	});
};

Seeder.prototype.loadModels = function(callback) {
	var models = this.options.models;
	async.each(models, function(model, callback) {
		try {
			require(path.resolve(model.path));
		}
		catch (e) {
			return callback({ code: 'load', message: e.message, error: e });
		}

		return callback();
	}, function(err) {
		if (err) {
			return callback(err);
		}

		return callback();
	});
};

Seeder.prototype.clearModels = function(callback) {
	var invalidModels = [];
	var models = this.options.models;
	var that = this;

	// Convert to array if not already
	if (!Array.isArray(models)) {
		return callback({ code: 'clear', message: "Invalid model type" });
	}

	// Confirm that all Models have been registered in Mongoose
	models.forEach(function(model) {
		if(_.indexOf(mongoose.modelNames(), model.name) === -1) {
			invalidModels.push(model.name);
		}
	});

	if (invalidModels.length) {
		return callback({ code: 'model', message: "Models not registered in Mongoose: " + invalidModels});
	}

	// Clear each model
	async.each(models, function(model, done) {
		if (model.clear) {
			var Model = mongoose.model(model.name);
			Model.remove({}, function(err) {
				if (err) {
					return done({ code: 'model', message: 'Unable to clean model', error: err });
				}

				that.result.cleared.push(model.name);
				done();
			});
		}
		else {
			done();
		}
	}, function(err) {
		if (err) {
			return callback(err);
		}

		return callback();
	});
};

Seeder.prototype.readData = function(callback) {
	var data = [];
	var migrations_path = this.options.path;
	var files = fs.readdirSync(migrations_path);

	async.each(files, function(file, done) {
		if (~file.indexOf('.json')) {
			try {
				var model = require(migrations_path + '/' + file);
			}
			catch (e) {
				return done({ code: 'read', message: e.message, error: e });
			}

      data.push(model);
    }

    done();
	}, function(err) {
		if (err) {
			return callback(err);
		}

		return callback(null, data);
	});
};

Seeder.prototype.populateModels = function(seedData, callback) {
	var that = this;
	async.each(seedData, function(entry, done) {
		var Model = mongoose.model(entry.model);
		async.each(entry.documents, function(document, done) {
			Model.create(document, function(err) {
				if (err) {
					return done({ code: 'populate', message: 'Unable to create document .', error: err });
				}

				if (that.result.populate[entry.model]) {
					that.result.populate[entry.model] = that.result.populate[entry.model] + 1;
				}
				else {
					that.result.populate[entry.model] = 1;
				}

				done();
			});
		}, function(err) {
			if (err) {
				return done(err);
			}

			done();
		});
	}, function(err) {
		if (err) {
			return callback(err);
		}

		return callback();
	});
};

module.exports = Seeder;