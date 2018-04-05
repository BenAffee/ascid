var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var db = require('../config/mongoose');
var users    = require('../config/mongoose');
var crypto = require('crypto');
var config = require('../config/index');
var multer  = require('multer')
var upload = multer({ dest: 'files/' })
var flow = require('nimble');
var msg='';
var dbo=[];
//var moder_users=[];

/*var resultsDB = function(fields){
	users.findOne(fields, function(err, docs){
	if (!err) return docs;
	else console.log('ошибка доступа к базе'.red.bold)

});
}*/

//--------------------------------------------------------------------------------------------GET home page.
router.get('/', function(req, res, next) {
	msg = req.session.username + ': сработал корневой путь';
	console.log(msg.magenta.bold);
	
	//var db = resultsDB('users',{username: 'admin'});
	console.log(config.type_of_docs);
	
	res.render('index', { 
		username: req.session.username,
		isAdministrator: req.session.isAdministrator,
		isModerator: req.session.isModerator,
		post_short: req.session.post_short,
		post_long: req.session.post_long
	  
	});
	
	//console.log(req.session);
});

//--------------------------------------------------------------------------------------------GET home page.
router.get('/control/:page', function(req, res, next) {
	var control = req.params.page;	
	

	
	if (control==1) {
		if(req.session.isAdministrator) {
			msg = req.session.username + ': вход в админ-панель';
			console.log(msg.magenta.bold);
			res.render('admin');
		}
			
		else{
			res.send('а ты жулик))) попробуй что-нибудь по-сложней');
		
			msg = req.session.username + ': неудачная попытка входа в админку';
			console.log(msg.bgRed.white);
		}
	
	}
	
	
	if (control==2) {
		if(req.session.isModerator) {
			msg = req.session.username + ': вход в панель добавления документов';
			console.log(msg.magenta.bold);
			var moder_users=[];
			//последовательное выполнение. сначала запрос в базу потом обработка результата
			flow.series([
				function(callback){
					users.find({ruk_level: {$in:[1,2]}}, function(err, results){
    					if(err) 
							console.log(err);
						else {
							//delete results["salt"];
							console.log('запрос в базу обрабатывается');
							//next();
							//console.log(results);
							dbo = results;
							//return results;
						}
						callback();
					});
					
				},
				
				function (callback) {
					
					dbo.forEach(function(item, i, arr) {
						//var pushed={username: item.username,
								 //  post_short: item.post_short
								 //  };
						
						var pushed=[];
						pushed.username = item.username;
						pushed.post_short = item.post_short;
						moder_users.push(pushed);
					});
					//console.log(moder_users);
					callback();
				},
				
				function (callback) {
					console.log(moder_users);
					res.render('add_doc', {
						DL: moder_users,
						docs: config.type_of_docs
					}, function(err,html){
						if(err){
							msg = req.session.username + ': ошибка рендеринга шаблона формы ввода документа';
							console.log(msg.bgRed.white);
							console.log(err);
						}
						else res.send(html);
					});
					callback();
				},
			]);

			

		
		}
			
		else{
			res.send('а ты жулик))) попробуй что-нибудь по-сложней');
			
			msg = req.session.username + ': неудачная попытка загрузки формы нового документа';
			console.log(msg.bgRed.white);
		}
	
	}
		
		
		

	
});



//--------------------------------------------------------------------------------------------Авторизация 
router.post("/auth", urlencodedParser, function (req, res) {

	msg = req.session.username + ': сработал путь auth';
	console.log(msg.magenta.bold);
	
	//проверка напустую форму
	if(!req.body) {
		return res.sendStatus(400);
		console.log('Пришла пустая форма авторизации'.red);
		next();
	}
	
	//ищем пользователя в базе
	users.findOne({username: req.body.username}, function(err, docs){
    	if(err) console.log(err);
		
    	if(!docs) {
			msg = 'при попытке авторизации пользователя >>>' + req.body.username + '<<< база вернула пустой результат';
			console.log(msg.bgRed.white);
		}
     
    	else {
			//шифруем полученный из формы пароль
			var current_hash = crypto.pbkdf2Sync(req.body.password, docs.salt, 10000, 512, 'sha512').toString('hex')
			
			if(docs.username == req.body.username && docs.hashedPassword == current_hash){
					
				msg = req.session.username + ': доступ разрешён';
				console.log(msg.green);
				
				//пишем в сессию записи из базы
				req.session.username = docs.username;
				req.session.isAdministrator = docs.isAdministrator;
				req.session.isModerator = docs.isModerator;
				req.session.post_short = docs.post_short;
				req.session.post_long = docs.post_long;				
				
				res.redirect('/');
			}
		
			else{
				//req.session.isAuth=false;
				msg = req.body.username + ': доступ запрещён';
				console.log(msg.red);
				
				console.log(docs);
		
				res.redirect('/');
			}

		} 
	});
	   
});


//===============================================================Регистрация нового пользователя
router.post("/reg", urlencodedParser, function (req, res) {
	
	msg = req.session.username + ': сработал путь reg';
	console.log(msg.magenta.bold);
	if(req.session.isAdministrator){
			var add_user = new users({
				username: req.body.new_username,
				password: req.body.new_password_1,
				post_long: req.body.new_post_long,
				post_short: req.body.new_post_short,
				ruk_level: req.body.new_ruk_level
			});

    		add_user.save(function (err) {
				if (!err) {
			
					msg = 'пользователь: ' + req.body.new_username + ' добавлен!'
            		console.log(msg.red);
            		return res.send(msg);
				} 
				
				else {
					//console.log(err);
            		if(err.name == 'ValidationError') {
						//отдаём пользователю все ошибки валидации от монгуса
						console.log('ошибки регистрации пользователя:'.bgRed.white);
                		//res.statusCode = 400;
                		res.send(err.message);
            		} 
					
					else {
                		res.statusCode = 500;
						msg = 'Статус 500 при регистрации пользователя. Получена форма:' + req.body;
                		res.send(msg);
						console.log(msg.bgRed.white);
            		}
            	console.log(err.message);
        		}
			});
	}
	else{
		res.send('а ты жулик)))');
		msg = req.session.username + ': попытка регистрации нового пользователя не администратором';
        console.log(msg.bgRed.white);
	}
});


/*router.post('/upload', upload.single('file_doc'), function (req, res) {
  console.log("test")
  console.log(req.files)
  res.end('File uploaded.')
})*/







var cpUpload = upload.fields([{ name: 'file_doc', maxCount: 1 }, { name: 'about_doc', maxCount: 1 }])
router.post('/upload', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files 
  // 
  // e.g. 
  //  req.files['avatar'][0] -> File 
  //  req.files['gallery'] -> Array 
  // 
  // req.body will contain the text fields, if there were any 
	console.log(req.body);
    res.end('File uploaded.')
  
})






//--------------------------------------------------------------------------------------------Выход пользователя
router.get('/logout', function(req, res, next) {
	msg = req.session.username + ': сработал путь logout';
	console.log(msg.magenta.bold);
	
	// Удалить сессию
	if (req.session) {
		req.session.destroy(function() {});
	}
	res.redirect('/');
});





module.exports = router;
