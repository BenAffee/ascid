//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//В этом файле хранятся роуты по нажатиям ссылок 'control'
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var express = require('express');
var router = express.Router();


//импоритруем модели монгуса
var models    = require('../config/mongoose');

const noe_functions = require('../config/noe_functions');

var config = require('../config/index');

var flow = require('nimble');//для последовательного выполнения операций

var msg='';

var moder_users=[];
var moder_users_all=[];



//Открываем страничку смены пароля
router.get('/get_form_set_passw', function(req, res, next) {
    res.render('set_passw', {});
});


router.get('/:page', function(req, res, next) {
	var control = req.params.page;	
//--------------------------------------------	
//Здесь админ панель
//--------------------------------------------	
	if (control==1) {
		if(req.session.isAdministrator) {
			//логируем срабатывание этого роута
			let message_arr = ['INFO', req.session.username, '3', 'вход в админ-панель', 'ОК'];
			noe_functions.set_log_msg(message_arr);
			
			//выбираем из базы всех пользователей
			models.users.find({}, function(err, results){
				if(err){
					//логируем ошибки полученные от базы
					message_arr = ['ERROR', req.session.username, '5', 'ошибка получения списка ВСЕХ пользователей', err];
					noe_functions.set_log_msg(message_arr);
				} 

				if(!results) {
					//заносим в лог, если из базы пришёл пустой результат
					message_arr = ['WARNING', req.session.username, '6', 'база вернула пустой результат при получении списка ВСЕХ пользователей', 'Empty result!'];
					noe_functions.set_log_msg(message_arr);
					res.send('неправильное имя пользователя/пароль');
				}

				else {
					
					results.sort(noe_functions.dynamicSort('ruk_level'));//сортируем результаты по уровню руководства
					//console.log(results);
					res.render('admin', { 
						res: results
					});
				}
			});

			//msg = req.session.username + ': вход в админ-панель';
			//console.log(msg.magenta.bold);

		}
			
		else{
			//логируем попытку несанкционированного доступа
			let username_log = 'undefined';
			if (req.session.username) username_log = req.session.username;
			message_arr = ['WARNING', username_log, '4', 'Неудачная попытка входа в админ-панель', 'Access denied!'];
			noe_functions.set_log_msg(message_arr);
			//отдаём юзеру предупреждение
			res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');

		}
	
	}
	

	
	
//--------------------------------------------	
//Здесь форма добавления документов
//--------------------------------------------	
	
	if (control==2) {
		if(req.session.isModerator) {
			msg = req.session.username + ': вход в панель добавления документов';
			console.log(msg.magenta.bold);
			
			
			//последовательное выполнение. сначала запрос в базу потом обработка результата
			flow.series([
				
				//достаём из базы рукоаводителей 1 и 2 уровня, чтобы передать массив в форму добавления документов
				function(callback){
					if(moder_users.length == 0){ //если в этой сессии уже есть массив с именами руководителей, то в базу больше не лезем
						models.users.find({ruk_level: {$in:[1,2]}}, function(err, results){
							msg = req.session.username + ': достаём из базы имена руководителей 1 и 2 уровня';
							console.log(msg.green.bold);
							if(err) 
								console.log(err);
							else {
								console.log('запрос в базу обрабатывается');
								
								results.forEach(function(item, i, arr) {
									var pushed=[];
									pushed.username = item.username;
									pushed.post_short = item.post_short;
									moder_users.push(pushed);
								});

							}
							callback();
						});
					}
					else {
						msg = req.session.username + ': в сессии уже есть массив руководителей 1,2 уровня';
						console.log(msg.blue.bold);
						callback();
					}
				},
				
				
				//достаём из всех должностных лиц, кроме модераторов и администраторов чтобы передать массив в форму добавления документов
				function(callback){
					if(moder_users_all.length == 0){ //если в этой сессии уже есть массив с именами руководителей, то в базу больше не лезем
						models.users.find({ruk_level: {$in:[2,3,4]}}, function(err, results){
							msg = req.session.username + ': достаём из базы всех должностных лиц';
							console.log(msg.green.bold);
							if(err) 
								console.log(err);
							else {
								console.log('запрос в базу обрабатывается');
								
								results.forEach(function(item, i, arr) {
									var pushed=[];
									pushed.username = item.username;
									pushed.post_short = item.post_short;
									moder_users_all.push(pushed);
								});

							}
							callback();
						});
					}
					else {
						msg = req.session.username + ': в сессии уже есть массив всех должностных лиц';
							
						console.log(msg.blue.bold);
						callback();
					}
				},
				
				//отдаём переменные и рендерим шаблон
				function (callback) {
					res.render('add_doc', {
						DL12: moder_users,
						DLall: moder_users_all,
						docs: config.type_of_docs
					}, function(err,html){
						if(err){
							msg = req.session.username + ': ошибка рендеринга шаблона формы ввода документа';
							console.log(msg.bgRed.white);
							console.log(err);
						}
						else{ 
							
							res.send(html);
							
						}
					});
					
					callback();
					
				},
				
			]);
		
		}
			
		else{
			res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');
			
			msg = req.session.username + ': неудачная попытка загрузки формы нового документа';
			console.log(msg.bgRed.white);
		}
	
	}
//================================================================================================
//тут отображаем все документы
//ТОЛЬКО ДЛЯ МОДЕРАТОРА и АДМИНИСТРАТОРА!!!
//================================================================================================	
	if (control==3) {
		if(req.session.isModerator || req.session.isAdministrator) {
			msg = req.session.username + ': показываем список всех документов';
			console.log(msg.magenta.bold);

			//выбираем из базы ВСЕ документы
			models.docs.find(function(err, results){
				var lengths_of_punkts = [];
				//console.log(results);
				if(err){
					console.log(err);
					return;
				} 

				if(results.length===0) {
					msg = 'В базе ничего нет? или что-то пошло не так....';
					console.log(msg.bgRed.white);
					console.log(results);
					res.send('Нет документов');
				}


				else {
					//пишем в массив количество пнктов в каждом документе
					results.forEach(function(item, i, arr) {
						lengths_of_punkts.push(item.doc_punkts.length);
					});
					
					
					
					//console.log(results);
					//var lengths_of_punkts = [3, 3];
					res.render('all_doc_for_moder', { 
						docs: results,
						type_docs: config.type_of_docs,
						all_users_short: req.session.all_users_short,
						all_users_long: req.session.all_users_long,
						lengths: lengths_of_punkts

					});
				} 
			});	
		}
		
		else{
			res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');
			
			msg = req.session.username + ': неудачная попытка показать ВСЕ документы';
			console.log(msg.bgRed.white);
		}
	}
	
//================================================================================================
//здесь отображаем ВСЕ документы в которых пользователь является ИСПОЛНИТЕЛЕМ
//================================================================================================	
	if (control==4) {
		msg = req.session.username + ': ВСЕ документы в которых пользователь является ИСПОЛНИТЕЛЕМ';
		console.log(msg.magenta.bold);
		
		//выбираем из базы документы в которых пользователь указан как исполнитель
		var lengths_of_punkts = [];//здесь хранятся количество пунктов в которых указан пользователь
		models.docs.find({'_id': {$in: req.session.docs_ispoln}}, function(err, results){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;
			//если из базы что-то получили, то обрабатываем ответ, иначе отвечаем в браузер что ничего не найдено
			if(results.length > 0){
				var all_num_punkt_in_base = [];
				//нам нужно оставить только пункты "в части касающейся" пользователя
				//для этого перебираем выборку и просматриваем элементы массива puncts, если в элементе нет имени пользователя, то удаляем этот элемент
				results.forEach(function(item, i, arr) {
					var cur_puncts = item.doc_punkts;
					cur_puncts.forEach(function(item1, i1, arr1) {
						//используем in, потому-что ищем в Object
						if(!(req.session.username in item1['ispoln'])){//если пользователь в пунктах не найден, то сплайсим из выборки этот пункт
							results[i].doc_punkts.splice(i1, 1);
						}
					});
					lengths_of_punkts.push(results[i].doc_punkts.length);

				});

				res.render('ispoln_user', { 
					docs: results,
					username: req.session.username,
					all_users_short: req.session.all_users_short,
					all_users_long: req.session.all_users_long,
					type_docs: config.type_of_docs,
					lengths: lengths_of_punkts,
					number_of_punkt_in_base: all_num_punkt_in_base
				});
			}
			else res.send("НЕТ ДОКУМЕНТОВ");
		});
	}
	
//================================================================================================
//здесь отображаем ВСЕ документы в которых пользователь является КОНТРОЛЛИРУЮЩИМ
//================================================================================================	
	if (control==5) {
		msg = req.session.username + ': ВСЕ документы в которых пользователь является КОНТРОЛЛИРУЮЩИМ';
		console.log(msg.magenta.bold);
		
		//выбираем из базы документы в которых пользователь указан как КОНТРОЛЛИРУЮЩИЙ
		var lengths_of_punkts = [];//здесь хранятся количество пунктов в которых указан пользователь
		models.docs.find({'_id': {$in: req.session.docs_kontrols}}, function(err, results){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;
			
			if(results.length > 0){
			//нам нужно оставить только пункты "в части касающейся" пользователя
			//для этого перебираем выборку и просматриваем элементы массива puncts, если в элементе нет имени пользователя, то удаляем этот элемент
				results.forEach(function(item, i, arr) {
					var cur_puncts = item.doc_punkts;
					cur_puncts.forEach(function(item1, i1, arr1) {
							//используем indexOf потому-что ищем в простом массиве
							//if(massiv.indexOf(req.session.username) == -1){
							//используем in, потому-что ищем в Object
							if(!(req.session.username in item1['kontrols'])){
								results[i].doc_punkts.splice(i1, 1);
							}
					});
					lengths_of_punkts.push(results[i].doc_punkts.length);
				});

				res.render('kontrol_user', { 
					docs: results,
					all_users_short: req.session.all_users_short,
					all_users_long: req.session.all_users_long,
					type_docs: config.type_of_docs,
					username: req.session.username,
					lengths: lengths_of_punkts
				});
			}
			else res.send("НЕТ ДОКУМЕНТОВ");
		});
	}
	
//================================================================================================
//здесь отображаем НОВЫЕ документы в которых пользователь является ИСПОЛНИТЕЛЕМ
//================================================================================================	
	if (control==6) {
		msg = req.session.username + ': прказываем НОВЫЕ документы в которых пользователь является ИСПОЛНИТЕЛЕМ';
		console.log(msg.magenta.bold);
		
		//ищем в базе пользователя и выбираем списоа ид НОВЫХ документов
		models.users.findOne({'username': req.session.username}, function(err1, docs){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err1, req.session.username)) return;
			if(!docs) return;
			var news = docs.new_docs_ispoln;
			req.session.len_new_docs_ispoln = news.length;
			//выбираем из базы НОВЫЕ документы в которых пользователь указан как исполнитель
			var lengths_of_punkts = [];//здесь хранятся количество пунктов в которых указан пользователь
			models.docs.find({'_id': {$in: news}}, function(err, results){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;

				if(results.length > 0){
				//нам нужно оставить только пункты "в части касающейся" пользователя
				//для этого перебираем выборку и просматриваем элементы массива puncts, если в элементе нет имени пользователя, то удаляем этот элемент
					results.forEach(function(item, i, arr) {
						var cur_puncts = item.doc_punkts;
						cur_puncts.forEach(function(item1, i1, arr1) {
							//используем in, потому-что ищем в Object
							if(!(req.session.username in item1['ispoln']))
								//если пользователь в пунктах не найден, то сплайсим из выборки этот пункт
								results[i].doc_punkts.splice(i1, 1);

						});
						lengths_of_punkts.push(results[i].doc_punkts.length);
					});

					res.render('ispoln_user', { 
						docs: results,
						username: req.session.username,
						all_users_short: req.session.all_users_short,
						all_users_long: req.session.all_users_long,
						type_docs: config.type_of_docs,
						num_of_new_ispoln: results.length,
						lengths: lengths_of_punkts
					});
				}
				else res.send("НЕТ НОВЫХ ДОКУМЕНТОВ. <input type=hidden id=num_of_new_ispoln value=0>");
			});
		});
	}
	
	
	
//================================================================================================
//здесь отображаем НОВЫЕ документы в которых пользователь является КОНТРОЛЛИРУЩИМ
//================================================================================================	
	if (control==7) {
		msg = req.session.username + ': прказываем НОВЫЕ документы в которых пользователь является КОНТРОЛЛИРУЩИМ';
		console.log(msg.magenta.bold);
		
		//ищем в базе пользователя и выбираем списоа ид НОВЫХ документов
		models.users.findOne({'username': req.session.username}, function(err1, docs){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err1, req.session.username)) return;
			if(!docs) return;
			var news = docs.new_docs_kontrols;
			req.session.len_new_docs_kontrols = news.length;
			//выбираем из базы НОВЫЕ документы в которых пользователь указан как исполнитель
			var lengths_of_punkts = [];//здесь хранятся количество пунктов в которых указан пользователь
			models.docs.find({'_id': {$in: news}}, function(err, results){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;

				if(results.length > 0){
				//нам нужно оставить только пункты "в части касающейся" пользователя
				//для этого перебираем выборку и просматриваем элементы массива puncts, если в элементе нет имени пользователя, то удаляем этот элемент
					results.forEach(function(item, i, arr) {
						var cur_puncts = item.doc_punkts;
						cur_puncts.forEach(function(item1, i1, arr1) {
							//используем in, потому-что ищем в Object
							if(!(req.session.username in item1['kontrols']))
								//если пользователь в пунктах не найден, то сплайсим из выборки этот пункт
								results[i].doc_punkts.splice(i1, 1);

						});
						lengths_of_punkts.push(results[i].doc_punkts.length);
					});

					res.render('kontrol_user', { 
						docs: results,
						username: req.session.username,
						all_users_short: req.session.all_users_short,
						all_users_long: req.session.all_users_long,
						type_docs: config.type_of_docs,
						num_of_new_kontrol: results.length,
						lengths: lengths_of_punkts
					});
				}
				else res.send("НЕТ НОВЫХ ДОКУМЕНТОВ. <input type=hidden id=num_of_new_kontrol value=0>");
			});
		});
	}


});


//================================================================================================
//здесь отрабатываем форму отписывания документа
//================================================================================================
router.post('/transfer_doc', function(req, res, next) {
    res.send(req.body.transfer_doc_id);
    console.log('тут');
});



//================================================================================================
//тут всякие аяксовые штуки
//================================================================================================
router.get('/numer/:count', function(req, res, next) {
	msg = req.session.username + ': пытаемся добавить пункт со счётчиком:' + req.params.count;
	console.log(msg.yellow.bold);
	
	res.render('add_docs_puncts', {
		DLall: moder_users_all,
		count_punkt: req.params.count
	}, function(err,html){
		if(err){
			msg = req.session.username + ': ошибка рендеринга шаблона добавления пункта';
			console.log(msg.bgRed.white);
			console.log(err);
		}
		else{ 

			res.send(html);

		}
	});
});

module.exports = router;