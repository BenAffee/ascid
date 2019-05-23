//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//В этом файле хранятся роуты по аутентификации пользователей, регистрации и их выхода из системы

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


var express = require('express');
var router = express.Router();

var csrf = require('csurf')
var csrfProtection = csrf({ cookie: true });

//импоритруем модели монгуса
var models    = require('../config/mongoose');

const noe_functions = require('../config/noe_functions');


var crypto = require('crypto');

var msg='';
//================================================================================================
//================================================================================================
//-------------Авторизация===================================== 
//================================================================================================
//================================================================================================
router.post('/', csrfProtection, function (req, res) {

	//логируем срабатывание этого роута
	let message_arr = ['INFO', 'undefined', '1', 'сработал путь auth', 'пользователь ввёл-->'+req.body.username];
	noe_functions.set_log_msg(message_arr);

	//защищаемся от инъекции через поле имя пользователя.
    //заодно проверяем на пустую форму
    //проверяем по регулярке...
    let pattern = /^[a-zA-Z0-9\_]+$/;// такая же регулярка в монгузе
    if (!req.body.username.match(pattern)){
        console.log ('имя пользователя не соответствует регулярке');

		//логируем ошибку проверки формата имени пользователя
		message_arr = ['WARNING', 'undefined', '2', 'имя пользователя не соответствует регулярному выражению', 'пользователь ввёл-->'+req.body.username ];
		noe_functions.set_log_msg(message_arr);

        res.send('ошибка формата имени пользователя');
        return;
    }
	//ищем пользователя в базе
	models.users.findOne({username: req.body.username}, function(err, results){
		if(err) console.log(err);
		
		if(!results) {
			msg = 'при попытке авторизации пользователя >>>' + req.body.username + '<<< база вернула пустой результат';
			console.log(msg.bgRed.white);
			console.log(results);
			res.send('неправильное имя пользователя/пароль');
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
					//получаем два массива со всеми имена пользователей (сокращёнными и полными)
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
					//req.session.new_docs_ispoln = results.new_docs_ispoln;
					//req.session.new_docs_kontrols = results.docs_kontrols;
					req.session.len_new_docs_kontrols = results.new_docs_kontrols.length;
					req.session.len_new_docs_ispoln = results.new_docs_ispoln.length;
                    req.session.inferiors = results.inferiors;

					msg = req.session.username + ': доступ разрешён';
					console.log(msg.green);

                    console.log(req.session.all_users_short);

					//console.log(req.session.all_users_short);
					//console.log(req.session.all_users_long);
					res.send('');
				});
				

			}
		
			else{

				msg = req.body.username + ': доступ запрещён';
				console.log(msg.red);
				
				console.log(results);
		
				res.send('неправильное имя пользователя/пароль');
			}

		} 
	});
	   
});





//================================================================================================
//================================================================================================
//--------------------------------------------------Выход пользователя
//================================================================================================
//================================================================================================
router.get('/logout', function(req, res, next) {
	msg = req.session.username + ': сработал путь logout';
	console.log(msg.magenta.bold);
	
	// Удалить сессию
	if (req.session) {
		//models.rememberme.remove({ 'username': req.session.username }, function() {});
		//res.clearCookie('logintoken');
		req.session.destroy(function() {});
	}
	res.redirect('/');
});





module.exports = router;