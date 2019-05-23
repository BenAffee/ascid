//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//В этом файле хранятся роуты админ-панели
//	-создание пользователей
//	-удаление пользователей

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


var express = require('express');
var router = express.Router();

//var csrf = require('csurf')
//var csrfProtection = csrf({ cookie: true });

//импоритруем модели монгуса
var models	= require('../config/mongoose');

const noe_functions = require('../config/noe_functions');


//================================================================================================
//================================================================================================
//===================Регистрация нового пользователя============================
//================================================================================================
//================================================================================================
router.post('/reg', function (req, res) {
	
	msg = req.session.username + ': сработал путь reg';
	console.log(msg.magenta.bold);
	if(req.session.isAdministrator){
			//console.log(req.body.its_moder);
			//если установлен чекбокс на возможность добавления документов, то устанавливаем переменную в true
			//иначе так и останется false
			//потом это значение запишем в базу в поле isModerator
			let its_moder=false;
			if(req.body.its_moder==='on') its_moder=true;
			//console.log(its_moder);
			//добавляем пользователя в поле "подчинённые" каждому пользователю, указанному как командир
			models.users.update({"username" : req.body.new_chiefs},
				{$push: {"inferiors": req.body.new_username}},
				{ multi: true },
				function(err, doc){
					//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
					if(models.err_handler(err, req.session.username)) return;
					//res.redirect('/control/6');
                    console.log('добавили подчинённого командирам');
					//res.send("СТАТУС ДОКУМЕНТА ИЗМЕНЁН");
				});



			let add_user = new models.users({
				username: req.body.new_username,
				password: req.body.new_password_1,
				post_long: req.body.new_post_long,
				post_short: req.body.new_post_short,
				ruk_level: req.body.new_ruk_level,
				chiefs: req.body.new_chiefs,
				isModerator: its_moder
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

//================================================================================================
//================================================================================================
//===================УДАЛЯЕМ пользователя============================
//================================================================================================
//================================================================================================
router.post('/delete_user', function (req, res) {
	if(req.session.isAdministrator){
		models.users.findOneAndRemove({username: req.body.username }, function(err,doc) {
			if (!err) {

				console.log(doc);
				//удаляем информацию о пользователе у командиров и подчинённых указанных в соответствующих полях
				let inferiors = doc.inferiors;
                let chiefs = doc.chiefs;
                //удаляем записи у подчинённых
                models.users.update({"username" : inferiors},
                    {$pull: {"chiefs": req.body.username}},
                    { multi: true },
                    function(err, doc) {
                        //обрабатываем ошибки, если ошибки есть, то логируем все-все-все
                        if (models.err_handler(err, req.session.username)) {
                            let message_arr = ['ERROR', req.session.username, '17', 'ошибка удаления информации о пользователе у подчинённых', err];
                            noe_functions.set_log_msg(message_arr);
                            return;
                        }
                    }
                );
                //удаляем записи у командиров
				models.users.update({"username" : chiefs},
					{$pull: {"inferiors": req.body.username}},
					{ multi: true },
					function(err, doc){
					//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
						if(models.err_handler(err, req.session.username)){
							let message_arr = ['ERROR', req.session.username, '18', 'ошибка удаления информации о пользователе у командиров', err];
							noe_functions.set_log_msg(message_arr);
							return;
                        }
                    }
                );

                //логируем успешное удаление пользователя
				let message_arr = ['INFO', req.session.username, '8', 'удалён пользователь', 'имя пользователя -->'+req.body.username+'. удалил -->' + req.session.username];
				noe_functions.set_log_msg(message_arr);
			}
			else {
				//если есть ошибки из базы, то пишем в лог
				let message_arr = ['ERROR', req.session.username, '10', 'ошибка удаления пользователя из базы', err];
				noe_functions.set_log_msg(message_arr);
			}
			//после того как удалили пользователя, снова показывем страницу со всеми пользователями
			res.redirect('/control/1');
		});

	}
	else{
			//логируем попытку несанкционированного доступа
			let username_log = 'undefined';
			if (req.session.username) username_log = req.session.username;
			message_arr = ['WARNING', username_log, '9', 'Неудачная попытка удаления пользователя', 'Access denied!'];
			noe_functions.set_log_msg(message_arr);
			//отдаём юзеру предупреждение
			res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');
	}
});


//================================================================================================
//================================================================================================
//===================Поазываем логи============================
//================================================================================================
//================================================================================================
router.post('/logs', function (req, res) {
	if(req.session.isAdministrator){
		//console.log('tcnm');
		new Promise (function (resolve, reject){
			//выбираем из базы всех пользователей
			models.users.find({}, function(err, results){
				if(err){
					//логируем ошибки полученные от базы
					message_arr = ['ERROR', req.session.username, '15', 'ошибка получения списка ВСЕХ пользователей при отображении логов', err];
					noe_functions.set_log_msg(message_arr);
				}

				if(!results) {
					//заносим в лог, если из базы пришёл пустой результат
					message_arr = ['WARNING', req.session.username, '16', 'база вернула пустой результат при получении списка ВСЕХ пользователей при отображении логов', 'Empty result!'];
					noe_functions.set_log_msg(message_arr);
					res.send('неправильное имя пользователя/пароль');
				}

				else {

					results.sort(noe_functions.dynamicSort('username'));//сортируем результаты по уровню руководства
					//console.log(results);
					resolve (results);

				}
			})
		})

		.then((results) => {
			//console.log(req.body)
			let object_req = {};
			let time = new Date();
			if(Object.keys(req.body).length == 0){
				//если из браузера пришёл пустой запрос, 
				//то показываем логи за последние 10 минут 
				//(т.е. 1000*60*10 = 600000 микросекунд)
				//console.log('тела нет!')
				object_req = {time_msg: {$gte: time.getTime()-600000}};
			}
			else{
				
				
				if(req.body.filter_username){
					//если из браузера пришло имя пользователя, 
					//то показываем его логи за последние сутки 
					//(т.е. 1000×60×60×24 = 86400000 микросекунд)
					object_req['user_msg'] = req.body.filter_username;
					object_req['time_msg'] = {$gte: time.getTime()-86400000};
				}
				
				if(req.body.filter_type_msg){
					//если из браузера пришло тип сообщения, 
					//то показываем логи с этим типом за последние сутки 
					//(т.е. 1000×60×60×24 = 86400000 микросекунд)
					object_req['type_msg'] = req.body.filter_type_msg;
					object_req['time_msg'] = {$gte: time.getTime()-86400000};
				}
				
				if(req.body.filter_time_msg){
					//если из браузера пришло тип сообщения, 
					//то показываем логи с этим типом за последние сутки 
					//(т.е. 1000×60×60×24 = 86400000 микросекунд)
					switch(req.body.filter_time_msg) {
						case '1'://за последние10 минут
							object_req['time_msg'] = {$gte: time.getTime()-600000};
							break
						case '2'://за последний час(1000×60×60=3600000)
							object_req['time_msg'] = {$gte: time.getTime()-3600000};
							break
						case '3'://за последние 3 часа(1000×60×60*3=10800000)
							object_req['time_msg'] = {$gte: time.getTime()-10800000};
							break
						case '4'://за последние сутки(1000×60×60×24 = 86400000)
							object_req['time_msg'] = {$gte: time.getTime()-86400000};
							break
					}
				}
				//console.log(object_req);
			}
			//выбираем из базы логи
			models.logs.find(object_req, function(err, logs){
				if(err){
					//логируем ошибки полученные от базы
					message_arr = ['ERROR', req.session.username, '13', 'ошибка получения логов', err];
					noe_functions.set_log_msg(message_arr);
				}

				if(!logs) {
					//заносим в лог, если из базы пришёл пустой результат
					message_arr = ['WARNING', req.session.username, '14', 'база вернула пустой результат при получении логов', 'Empty result!'];
					noe_functions.set_log_msg(message_arr);
					res.send('в логах ничего нет');
				}

				else {
					//логируем отображение логов
					let message_arr = ['INFO', req.session.username, '12', 'отображаем логи', 'OK!'];
					noe_functions.set_log_msg(message_arr);
					//console.log(logs);
					res.render('logs', {
						res: results,
						logs: logs
					});
				}
			});
		})
	}
	else{
			//логируем попытку несанкционированного доступа
			let username_log = 'undefined';
			if (req.session.username) username_log = req.session.username;
			message_arr = ['WARNING', username_log, '11', 'Неудачная попытка отобразить логи', 'Access denied!'];
			noe_functions.set_log_msg(message_arr);
			//отдаём юзеру предупреждение
			res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');
	}
});


module.exports = router;