/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require("express");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require("cfenv");

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// cloudat package
var cloudant = require('cloudant');
////////////////////////////////////////////////////////////////////////////
var session = require('express-session');
app.use(session({
	secret: 'ssshhhhh'
}));
var requester = require("request");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
//////////////////////////////////routes///////////////////////////////////////////

/*app.get('/login', function(request, response) {
	var req = {
		selector: {
			username: {
				"$eq": request.query.username
			},
			password: {
				"$eq": request.query.password
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		if (body.docs != []) {
			response.send(body.docs[0]);
		}
	});
});*/

app.get('/dashboard', function(request, response) {
	var sess = request.session;
	if (sess.email) {
		console.log(sess.email);
		////////////////////////////////////////cloudants cans////////////////////////////////////////////////////
		var cans;
		var req = {
		selector: {
			type: {
				"$eq": "can"
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		if (body.docs != []) {
			cans=body.docs;
		}
	});
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/////////////////////////////////////////////cloudant///////////////////////////////////////
		var req = {
			selector: {
				email: {
					"$eq": sess.email
				}
			}
		};
		var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
		var options = {
			url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
			headers: {
				"Authorization": auth
			},
			method: "POST",
			json: req
		};
		requester(options, function(error, cloudantres, body) {
			try {
				request.session.email = body.docs[0].email;
				request.session.name = body.docs[0].name;
				request.session.location = body.docs[0].location;
				request.session.points = body.docs[0].points;
			} catch (e) {
				console.log(e);
				//response.redirect('/');
				response.send('error accessing docs[0]');
			}
			///////////////////////////////////////////ejs//////////////////////////////////////////////
		fs.readFile(path.join(__dirname, 'public/home.html'), 'utf-8', function(err, content) {
			if (err) {
				response.end('error occurred');
				return;
			}
			var name = request.session.name; //here you assign temp variable with needed value
			var email = request.session.email;
			var points = request.session.points;
			var location = request.session.location;

			var renderedHtml = ejs.render(content, {
				name: name,
				email: email,
				points: points,
				location: location,
				cans: cans
			}); //get redered HTML code
			response.end(renderedHtml);
		});
		//////////////////////////////////////////////////////////////////////////////////////////////
		});
		
		//response.sendFile(path.join(__dirname, 'public/home.html'));
	} else {
		response.sendFile(path.join(__dirname, 'public/index.html'));
	}
});

app.get('/logout', function(request, response) {
	var sess = request.session;
	if (sess.email) {
		request.session.destroy(function(err) {
			// cannot access session here
		});
	}
	response.redirect('/');
});

app.post('/login', function(request, response) {
	var req = {
		selector: {
			email: {
				"$eq": request.body.email
			},
			password: {
				"$eq": request.body.password
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		try {
			request.session.email = body.docs[0].email;
			request.session.name = body.docs[0].name;
			request.session.location = body.docs[0].location;
			request.session.points = body.docs[0].points;
			response.redirect('/dashboard');
		} catch (e) {
			response.redirect('/');
		}
	});
});


app.post('/register', function(request, response) {
	console.log("received request");

	var req = {
		"type": "user",
		"name": request.body.name,
		"password": request.body.password,
		"email": request.body.email,
		"location": request.body.location,
		"points": 0
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		request.session.email = req.email;
		request.session.name = req.name;
		request.session.location = req.location;
		request.session.points = req.points;
		response.redirect('/dashboard');
	});
});

app.post('/update', function(request, response) {
	var sess = request.session;
	var req = {
		selector: {
			email: {
				"$eq": sess.email
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		try {
			var updated = body.docs[0];
			updated.name = request.body.name;
			updated.location = request.body.location;
			updated.password = request.body.password;
			var urll = "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/" + body.docs[0]._id;
			var options = {
				url: urll,
				headers: {
					"Authorization": auth
				},
				method: "PUT",
				json: updated
			};
			requester(options, function(error, cloudantres, body) {
				response.redirect('/dashboard');
			});

		} catch (e) {
			response.redirect('/');
		}
	});
});


app.post('/points', function(request, response) {

	var req = {
		selector: {
			email: {
				"$eq": request.body.email
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		try {
			var x = body.docs[0].email;
			var updated = body.docs[0];
			updated.points = parseInt(updated.points) + parseInt(request.body.points);
			var urll = "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/" + body.docs[0]._id;
			var options = {
				url: urll,
				headers: {
					"Authorization": auth
				},
				method: "PUT",
				json: updated
			};
			requester(options, function(error, cloudantres, body) {
				response.send('updated');
			});
		} catch (e) {
			response.send('email invalid');
		}
	});
});

app.get('/cans', function(request, response) {
	var req = {
		selector: {
			type: {
				"$eq": "can"
			}
		}
	};
	var auth = 'Basic ' + new Buffer("a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix" + ':' + "fee15ebadbe1ffc0e618076a140204d09dadad8ddbeae2a6fbbd9b261815fc03").toString('base64');
	var options = {
		url: "https://a7616bc9-0f15-4c85-b2a8-b18c355ad95f-bluemix.cloudant.com/smarttrash/_find",
		headers: {
			"Authorization": auth
		},
		method: "POST",
		json: req
	};
	requester(options, function(error, cloudantres, body) {
		if (body.docs != []) {
			response.send(body.docs);
		}
	});
});


/////////////////////////////////////////////////////////////////////////////////////////////////
// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function() {
	// print a message when the server starts listening
	console.log("server starting on " + appEnv.url);
});