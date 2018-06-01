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
	//эта секция будет передаваться после аутентификации
	//req.session.username = 'NF_1'
	//req.session.docs_ispoln = ['5ae61b19ebfce0317860388d','5ae61b60ebfce0317860388e', '5ae75e42d60d7212beab6fd1'];

					/*var push1 = {};
					var ggg = 'NF_1';
					push1[ggg]={'ispolneno':false, 'oznokomlen':false};
					console.log('------------------исполнители');
					console.log(push1);	*/
	//var push1 = [5,6];
	/*var push1 = 'NF_1';
if(push1.constructor === Array) console.log('массив');
	else console.log('не массив');*/

	
	
	

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
//----ПРИЁМ СВЕДЕНИЙ О ДОКУМЕНТЕ С КОТОРЫМ ОЗНАКОМИЛСЯ ПОЛЬЗОВАТЕЛЬ
//================================================================================================
//================================================================================================
router.post('/oznakomlen', function(req, res) {
	msg = req.session.username + ': ознакомился с документом ' + req.body.id;
	console.log(msg.magenta.bold);
	
	var id = req.body.id;
	var username = req.body.user;
	//console.log('nen');
	if(username == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		//добавляем статус ОЗНАКОМЛЕН
		/*models.docs.updateOne({"_id": id}, {doc_punkts: new_puncts}, function(err, doc){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;
		});*/
		
		
		//ищем в базе документ и во всех пунктах в поле ознакомлен ставим true
		models.docs.findOne({'_id': id}, function(err, results){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;


			var puncts = results.doc_punkts;
			//console.log(puncts);
			var new_puncts = [];//здесь будут изменённые пункты

			//перебираем пункты, если находим имя пользователя, то ставим статус ОЗНАКОМЛеН
			puncts.forEach(function(item, i, arr) {
				//ещем имя пользователя сначала в массиве исполнителей, а затем контроллирующих, если пользователь найден, 
				//то помечаем его как ознакомлен и удаляем документ из НОВЫХ
				//используем in, потому-что ищем в Object
				if((username in item[2])){
					//console.log(username + ' ЕСТЬ в ' + item[0] + ' пункте');
					item[2][username]['oznakomlen'] = true;
					//удаляем записи из сессии

				}
				if((username in item[3])){
					//console.log(username + ' ЕСТЬ в ' + item[0] + ' пункте');
					item[3][username]['oznakomlen'] = true;
				}
				

				//добавляем пункт после проверки
				new_puncts.push(item);
			});
			//добавляем статус ОЗНАКОМЛЕН
			models.docs.update({"_id": id}, {doc_punkts: new_puncts}, function(err, doc){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;
			});

			//удаляем записи из базы
			models.users.update({"username" : req.session.username}, 
								{$pull: {"new_docs_ispoln": mongoose.Types.ObjectId(id), "new_docs_kontrols": mongoose.Types.ObjectId(id)}}, 
								{ multi: true }, 
								function(err, doc){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;
			});

		});

		//console.log(req.body);
		res.send("СТАТУС ДОКУМЕНТА ИЗМЕНЁН");
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
	
//-----------------это удалить
	//req.session.username = 'ZNA';
//-----------------это удалить	
	
	var id = req.body.id;
	var username = req.body.user;
	var punkt = req.body.punkt;
	if(req.body.kontr == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		console.log(req.body);
		//cсначала достаём из базы интересующий нас документ
		models.docs.findOne({'_id': id}, function(err, results){
			//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
			if(models.err_handler(err, req.session.username)) return;

			var puncts = results.doc_punkts;
			//console.log(puncts);
			var new_puncts = [];//здесь будут изменённые пункты

			//перебираем пункты, если находим номер пункта, то в этом пункте отмечаем пользователя как исполнено
			puncts.forEach(function(item, i, arr) {
				//используем in, потому-что ищем в Object
				/*if(username in item[2]){
					//console.log(username + ' ЕСТЬ в ' + item[0] + ' пункте');
					item[2][username]['oznakomlen'] = true;
					//console.log(item[2]);

				}*/
				//если номер пункта в итеме равен искомому, то устанавливаем искомому пользователю статус true
				if(item[0] == punkt){
					item[2][username]['ispolneno'] = true;
				}
				//добавляем пункт после проверки
				new_puncts.push(item);
			});

			models.docs.update({"_id": id}, {doc_punkts: new_puncts}, function(err, doc){
				//обрабатываем ошибки, если ошибки есть, то логируем все-все-все
				if(models.err_handler(err, req.session.username)) return;
			});



			//console.log('новые пункты');
			//console.log(new_puncts);
		});
		
		res.send(msg);
	}
	else{
		msg = req.session.username + ': ПОПЫТКА ОТМЕТИТЬ ОБ ИСПОЛНЕНИИ ОТ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ' + req.body.user + '. ДОКУМЕНТ: ' + id;
		console.log(msg.bgRed.white);
	}
	

});

//функция обработки ошибок от базы данных
/*var err_handler = function(error, name){
	if(error) {
		var msg = name + ' --> ВНИМАНИЕ! ошибки базы данных:'
		console.log(msg.bgRed.white);
		console.log(error);
		return true;
	}
	else {
		var msg = name + ' --> Норма. Запросы в базу прошли.'
		console.log(msg.green);
		return false;
		//console.log(doc);
	}
}*/


module.exports = router;
