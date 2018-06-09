var express = require('express');
var router = express.Router();

//var path = require('path');
//var fs = require('fs');
var mongoose = require('mongoose');
//импоритруем модели монгуса
var models = require('../config/mongoose');


var crypto = require('crypto');
var config = require('../config/index');

var multer  = require('multer');

//работает...
var upload_file_doc_dest = './public/files/';
var upload_file_doc = multer({ dest: upload_file_doc_dest }).single('file_doc');

//var flow = require('nimble');//для последовательного выполнения операций

var msg='';

var moder_users=[];
var moder_users_all=[];



//--------------------------------------------------------------------------------------------GET home page.
router.get('/', function(req, res, next) {

	
	
	
	
	res.render('index', { 
		//отсюда то, что по умолчанию
		username: req.session.username,//отдаём в шаблон ИМЯ ПОЛЬЗОВАТЕЛЯ
		isAdministrator: req.session.isAdministrator,//отдаём в шаблон СТАТУСЫ ПОЛЬЗОВАТЕЛЯ
		isModerator: req.session.isModerator,
		post_short: req.session.post_short,//отдаём в шаблон СИСОК ИМЁН ПОЛЬЗОВАЕЛЕЙ
		post_long: req.session.post_long,
		len_new_docs_ispoln: req.session.len_new_docs_ispoln,//отдаём в шаблон количество записей в поле НОВЫЕ
		len_new_docs_kontrols: req.session.len_new_docs_kontrols
		//дальше для теста

	});
});

//================================================================================================
//================================================================================================
//----ПРИЁМ СВЕДЕНИЙ О ДОКУМЕНТЕ С КОТОРЫМ ОЗНАКОМИЛСЯ ПОЛЬЗОВАТЕЛЬ В КОНТЕКСТЕ ИСПОЛНИТЕЛЯ
//================================================================================================
//================================================================================================
router.post('/oznakomlen_ispoln', function(req, res) {
	msg = req.session.username + ': ознакомился с документом ' + req.body.id;
	console.log(msg.magenta.bold);
	
	var id = req.body.id;
	var username = req.body.user;
	if(username == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		//добавляем статус ОЗНАКОМЛЕН
		var query = {};
		var filter = {};
		query["doc_punkts.$[elem].ispoln." + username + ".oznakomlen"] = true;

		filter["elem.ispoln." + username + ".oznakomlen"] = false;
		
		//устанавливаем стутус ознакомлен для полей тсполнителей документа
		//делаем всё в один запрос
		models.docs.update({'_id': id}, 
						   {$set: query}, 
						   {multi: true, arrayFilters: [ filter ]}, 
						   function(err, doc){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;

			//удаляем записи о НОВЫХ из базы 
			models.users.update({"username" : req.session.username}, 
								{$pull: {"new_docs_ispoln": mongoose.Types.ObjectId(id), "new_docs_kontrols": mongoose.Types.ObjectId(id)}}, 
								{ multi: true }, 
								function(err, doc){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;
				//res.redirect('/control/6');
				res.redirect('/control/6');
				//res.send("СТАТУС ДОКУМЕНТА ИЗМЕНЁН");
			});
		});
	}
	else{
		msg = req.session.username + ': ПОПЫТКА ОЗНАКОМИТЬСЯ ОТ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ' + req.body.user + '. ДОКУМЕНТ: ' + id;
		console.log(msg.bgRed.white);
	}
});


//================================================================================================
//================================================================================================
//----ПРИЁМ СВЕДЕНИЙ О ДОКУМЕНТЕ С КОТОРЫМ ОЗНАКОМИЛСЯ ПОЛЬЗОВАТЕЛЬ В КОНТЕКСТЕ КОНТРОЛЛИРУЮЩЕГО
//================================================================================================
//================================================================================================
router.post('/oznakomlen_kontrol', function(req, res) {
	msg = req.session.username + ': ознакомился с документом ' + req.body.id;
	console.log(msg.magenta.bold);
	
	var id = req.body.id;
	var username = req.body.user;
	if(username == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		var query = {};
		var filter = {};
		query["doc_punkts.$[elem].kontrols." + username + ".oznakomlen"] = true;
		filter["elem.kontrols." + username + ".oznakomlen"] = false;
		
		//то же самое для полей контроллирующих
		//делаем всё в один запрос
		models.docs.update({'_id': id}, 
						   {$set: query}, 
						   {multi: true, arrayFilters: [ filter ]}, 
						   function(err, doc){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;
			
			//удаляем записи о НОВЫХ из базы 
			models.users.update({"username" : req.session.username}, 
								{$pull: {"new_docs_ispoln": mongoose.Types.ObjectId(id), "new_docs_kontrols": mongoose.Types.ObjectId(id)}}, 
								{ multi: true }, 
								function(err, doc){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;
				//res.redirect('/control/6');
				res.redirect('/control/7');
				
				//res.send("СТАТУС ДОКУМЕНТА ИЗМЕНЁН");
			});
		});
	}
	else{
		msg = req.session.username + ': ПОПЫТКА ОЗНАКОМИТЬСЯ ОТ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ' + req.body.user + '. ДОКУМЕНТ: ' + id;
		console.log(msg.bgRed.white);
	}
});


//================================================================================================
//================================================================================================
//----ОТМЕТКА ОБ ИСПОЛНЕНИИ
//================================================================================================
//================================================================================================
router.post('/ispolneno', function(req, res) {
	msg = req.session.username + ': пользователь --> ' + req.body.user + ' исполнил пункт --> '+ req.body.punkt + ' документа --> '+ req.body.id;
	console.log(msg.magenta.bold);

	
	var id = req.body.id;
	var username = req.body.user;
	var punkt = req.body.punkt;
	if(req.body.kontr == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		
		//добавляем статус ИСПОЛНЕНО
		var query = {};
		var filter = {};
		query["doc_punkts.$[elem].ispoln." + username + ".ispolneno"] = true;
		filter["elem.num_punkt"] = punkt;
		console.log(query);
		console.log(filter);
		//делаем всё в один запрос
		models.docs.update({'_id': id}, 
						   {$set: query}, 
						   {multi: true, arrayFilters: [ filter ]}, 
						   function(err, doc){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;
		});
		
		res.send(msg);
	}
	else{
		msg = req.session.username + ': ПОПЫТКА ОТМЕТИТЬ ОБ ИСПОЛНЕНИИ ОТ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ' + req.body.user + '. ДОКУМЕНТ: ' + id;
		console.log(msg.bgRed.white);
	}
	

});



module.exports = router;
