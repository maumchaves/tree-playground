var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');
var util = require('util');
var session = require('express-session');
var fs = require('fs');
var copyFrom = require('pg-copy-streams').from;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(session({
  secret: 'DDog8kyigxyiiWgRKmDuQknoIRM69LTl',
  resave: true,
  saveUninitialized: true
}));

var sess;

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  sess = request.session;
  if(sess.username) {
    response.render('pages/index');
  } else {
    response.redirect('/login');
  }
});

app.get('/login', function(request, response) {
  sess = request.session;
  if(sess.username) {
    response.redirect('/');
  } else {
    response.render('pages/login', {username: "", password: "", err: false} );
  }
});

app.post('/login', function(request, response) {
  const query =  'SELECT password = crypt($1, password) as isValidUser FROM users WHERE username = $2';
  const params = [request.body.password, request.body.username];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, params, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else if(!result.rows[0].isvaliduser) {
        response.render('pages/login', {
          username: request.body.username,
          password: "",
          err: true });
      } else {
        sess = request.session;
        sess.username = request.body.username;
        response.redirect('/');
      }
    });
  });
});

app.post('/logout', function(request, response) {
  request.session.destroy(function(err) {
    if(err)  { handleError(response, err); }
    else {
      response.redirect('/login');
    }
  });
});

// API REST based on https://devcenter.heroku.com/articles/mean-apps-restful-api

// Generic error handler used by all endpoints.
function handleError(response, err, code) {
  console.error(err);
  response.status(code || 500).json({"error": err.message || err});
}

/*  "/api/users"
 *    GET: finds all users
 *    POST: creates a new user
 */

app.get("/api/users", function(request, response) {
  const query = 'SELECT id_user, username FROM users';
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json(result.rows); }
    });
  });
});

app.post("/api/users", function(request, response) {
  var newUser = request.body;

  if (!newUser.username || !newUser.password) {
    return handleError(response, "Invalid user input: must provide a username and password.", 400);
  }

  const query =  'INSERT INTO users(username, name, last_name, password) values ($1, $2, $3, crypt($4, gen_salt(\'md5\')))';
  const params = [newUser.username, !newUser.name ? null : newUser.name,
    !newUser.lastName ? null : newUser.lastName, newUser.password];

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, params, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json("OK!"); }
    });
  });
});

/*  "/api/users/:id"
 *    GET: find user by id
 *    PUT: update user by id
 *    DELETE: deletes user by id
 */

app.get("/api/users/:id", function(request, response) {
  const query =  'SELECT id_user, username, name, last_name FROM users WHERE id_user = $1';
  const params = [request.params.id];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, params, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json(result.rows[0]); }
    });
  });
});

app.put("/api/users/:id", function(request, response) {
  var updateUser = request.body;
  const query = 'UPDATE users SET name = $1, last_name = $2 WHERE id_user = $3'
  const params = [!updateUser.name ? null : updateUser.name,
    !updateUser.lastName ? null : updateUser.lastName, request.params.id];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, params, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json("OK!"); }
    });
  });
});

app.delete("/api/users/:id", function(request, response) {
  const query =  'DELETE FROM users WHERE id_user = $1';
  const params = [request.params.id];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, params, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json(result.rows[0]); }
    });
  });
});

app.get("/api/trees", function(request, response) {
  const query = 'SELECT id, date, scientific_name, value FROM trees';
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json(result.rows); }
    });
  });
});

app.post("/api/trees", function(request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    var stream = client.query(copyFrom('COPY trees FROM STDIN WITH CSV HEADER'));
    var fileStream = fs.createReadStream('trees_dataset.csv')
    fileStream.on('error', done);
    stream.on('error', function(err) {
      done();
      handleError(response, err);
    });
    stream.on('end', function() {
      done();
      response.status(200).json("OK!");
    });
    fileStream.pipe(stream);
  });
});

app.delete("/api/trees", function(request, response) {
  const query = 'DELETE FROM trees';
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) {
      done();
      if (err) { handleError(response, err); }
      else { response.status(200).json("OK!"); }
    });
  });
});

// End API REST

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
