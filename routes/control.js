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

var config = require('../config/index');

var flow = require('nimble');//для последовательного выполнения операций

var msg='';

var moder_users=[];
var moder_users_all=[];


router.get('/:page', function(req, res, next) {
	var control = req.params.page;	
//--------------------------------------------	
//Здесь админ панель
//--------------------------------------------	
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
						//console.log(req.session.moder_users);
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
					//console.log(moder_users_all);
					
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
			
			//console.log(req.session.moder_users);

		
		}
			
		else{
			res.send('а ты жулик))) попробуй что-нибудь по-сложней');
			
			msg = req.session.username + ': неудачная попытка загрузки формы нового документа';
			console.log(msg.bgRed.white);
		}
	
	}
});

module.exports = router;