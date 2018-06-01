//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//В этом файле хранятся роуты по аутентификации пользователей, регистрации и их выхода из системы

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var express = require('express');
var router = express.Router();

//импоритруем модели монгуса
var models    = require('../config/mongoose');

var crypto = require('crypto');

var msg='';

//--------------------------------------------------------------------------------------------Авторизация 
router.post('/', function (req, res) {

	msg = req.session.username + ': сработал путь auth';
	console.log(msg.magenta.bold);
	
	//проверка напустую форму
	if(!req.body) {
		return res.sendStatus(400);
		console.log('Пришла пустая форма авторизации'.red);
		next();
	}
	
	//ищем пользователя в базе
	models.users.findOne({username: req.body.username}, function(err, results){
		if(err) console.log(err);
		
		if(!results) {
			msg = 'при попытке авторизации пользователя >>>' + req.body.username + '<<< база вернула пустой результат';
			console.log(msg.bgRed.white);
			console.log(results);
		}

		else {
			//шифруем полученный из формы пароль
			var current_hash = crypto.pbkdf2Sync(req.body.password, results.salt, 10000, 512, 'sha512').toString('hex')
			
			if(results.username == req.body.username && results.hashedPassword == current_hash){
				//разу получаем из базы список пользователей - он нам постоянно будет нужен
				
				models.users.find(function(err, results1){
					if(err){
						msg = req.body.username + ': при попытке получения списка пользователей из базы, произошла ошибка';
						console.log(msg.bgRed.white);						
						console.log(err);
						return;
					}
					var tmp_arr_1={};
					var tmp_arr_2={};
					//var i =0;
					results1.forEach(function(item, i, arr) {
						var user = item.username;
						tmp_arr_1[user] = item.post_long;;
						tmp_arr_2[user] = item.post_short;
					});

					req.session.all_users_short = tmp_arr_2;
					req.session.all_users_long = tmp_arr_1;
					//пишем в сессию записи из базы
					req.session.username = results.username;
					req.session.isAdministrator = results.isAdministrator;
					req.session.isModerator = results.isModerator;
					req.session.post_short = results.post_short;
					req.session.post_long = results.post_long;
					req.session.docs_ispoln = results.docs_ispoln;
					req.session.docs_kontrols = results.docs_kontrols;
					req.session.new_docs_ispoln = results.new_docs_ispoln;
					req.session.new_docs_kontrols = results.docs_kontrols;
					req.session.len_new_docs_kontrols = results.new_docs_kontrols.length;
					req.session.len_new_docs_ispoln = results.new_docs_ispoln.length;
					
					//console.log('список документов гдепользователь исполнитель:');
					//console.log(req.session.docs_ispoln);


					msg = req.session.username + ': доступ разрешён';
					console.log(msg.green);

					console.log(req.session.all_users_short);
					console.log(req.session.all_users_long);
					res.redirect('/');
				});
				

			}
		
			else{

				msg = req.body.username + ': доступ запрещён';
				console.log(msg.red);
				
				console.log(results);
		
				res.redirect('/');
			}

		} 
	});
	   
});


//===============================================================Регистрация нового пользователя
router.post('/reg', function (req, res) {
	
	msg = req.session.username + ': сработал путь reg';
	console.log(msg.magenta.bold);
	if(req.session.isAdministrator){
			console.log('вошёл');
			var add_user = new models.users({
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