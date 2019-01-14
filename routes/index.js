var express = require('express');
var router = express.Router();

//var path = require('path');
//var fs = require('fs');
var mongoose = require('mongoose');
//импоритруем модели монгуса
var models = require('../config/mongoose');


//var crypto = require('crypto');
var config = require('../config/index');


var noe_functions = require('../config/noe_functions');
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
		node_environment: process.env.NODE_ENV,//отправляем состояние среды исполнения
						// чтобы включить кеширование страниц на стороне пользователя в режиме продакшн
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


//================================================================================================
//================================================================================================
//----УДАЛЯЕМ ДОКУМЕНТ
//================================================================================================
//================================================================================================
router.post('/delete_doc', function(req, res) {
	if (req.session.isModerator){
		
			new Promise (function (resolve, reject){
                models.docs.findOne({_id: req.body.id}, function(err, results){
                    if(err) console.log(err);

                    if(!results) {
                        msg = 'при попытке поиска документа >>>' + req.body.id + '<<< для удаления,  база вернула пустой результат';
                        console.log(msg.bgRed.white);
                        console.log(results);
                        res.send('ошибка поиска документа для удаления');
                    }

                    else {
                        //если документ нашёлся,
                        //то резолвим дальше по цепочке список пользователей в которых этот документ указан для исполнения или контроля
                        //и имя файла для удаления

                        //сначала выберем все пункты из документа...
                        var punkts=results.doc_punkts;
                        var tmp=[];

                        //затем выберем все имена пользователей, которые указаны в этих пунктах
                        punkts.forEach(function(item, i, arr) {
                            //сначала исполнители...
                            var ispoln = item.ispoln;
                            for (var key in ispoln){
                                tmp.push(key);
                            }

                            //...затем контроллирующие
                            var kontrols = item.kontrols;
                            for (var key in kontrols){
                                tmp.push(key);
                            }
                        });
                        //оставляем только уникальные значения в массиве
                        tmp = noe_functions.unique_item_in_arr(tmp);

                        //и удаляем сам файл
                        noe_functions.file_doc_delete(config.path_to_files + results.filename);

                        punkts = tmp;
                        resolve (punkts);
                     }
			    })
            })

			.then((punkts) => {
					console.log(punkts);
                    console.log(req.body.id);
					let ok;
					//проходим по всем пользователям указанным в документе и удаляем id документа
                    models.users.update({"username": {$in: punkts}},
                        {$pull: {"docs_kontrols": mongoose.Types.ObjectId(req.body.id),
                                "new_docs_kontrols": mongoose.Types.ObjectId(req.body.id),
                                "docs_ispoln": mongoose.Types.ObjectId(req.body.id),
                                "new_docs_ispoln": mongoose.Types.ObjectId(req.body.id)}},
                        {multi: true},
                        function(err){
                            if(models.err_handler(err, req.session.username)) return ok;
                    });
				})
		
			.then((ok) => {
					let ok1;
					models.docs.remove({ _id: req.body.id }, function(err) {
						if (!err) {
								console.log('запись ' + req.body.id + ' успешно удалена из базы')
						}
						else {
								console.log('ошибка удаления записи ' + req.body.id + ' из базы')
						}
						return ok1
					});
				})

			.then((ok1) => {
				//после того как удалили документ из базы и сам файл, снова показывем страницу со всеми документами
				res.redirect('/control/3');
				})
	}
	
	else{
		msg = req.session.username + ': попытка удаления документа НЕ модератором!';
		console.log(msg.magenta.bold);
	}

});



module.exports = router;
