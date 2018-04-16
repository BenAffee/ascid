var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var redis   = require('redis');
var session = require('express-session');
var redisStore = require('connect-redis')(session);

var colors = require('colors');

var crypto = require('crypto');

var config = require('./config/index');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});

var flow = require('nimble');//для последовательного выполнения операций

var client  = redis.createClient();

var db = require('./config/mongoose');


var index = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var control = require('./routes/control');
var upload_doc = require('./routes/upload_doc');

var app = express();

var rand_hash = crypto.randomBytes(32).toString("hex"); //случайный хэш для ключа сессии

app.use(session({
    secret: rand_hash,
    store: new redisStore({ host: config.redis.url, port: 6379, client: client,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser({uploadDir:'/public/tmp'}));

app.use(express.query());
//app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


//app.set('photos', __dirname + '/public/photos');


app.use('/', index);
app.use('/users', users);
app.use('/auth', auth);
app.use('/control', control);
app.use('/upload_doc', upload_doc);

/*req.session.test='test';
if (req.session.test=='test') console.log('сессии запущены'.bgGreen.white);
else console.log('сессии НЕ запущены'.bgRed.white);*/





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
