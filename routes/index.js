var express = require('express');
var router = express.Router();

//var path = require('path');
//var fs = require('fs');

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
		username: req.session.username,
		isAdministrator: req.session.isAdministrator,
		isModerator: req.session.isModerator,
		post_short: req.session.post_short,
		post_long: req.session.post_long
		//дальше для теста

	});
});


//----ПРИЁМ СВЕДЕНИЙ О ДОКУМЕНТЕ С КОТОРЫМ ОЗНАКОМИЛСЯ ПОЛЬЗОВАТЕЛЬ
router.post('/oznakomlen', function(req, res) {
	msg = req.session.username + ': ознакомился с документом ' + req.body.id;
	console.log(msg.magenta.bold);
	
	var id = req.body.id;
	var username = req.body.user;
	//console.log('nen');
	if(username == req.session.username){//эта проверка чтобы пользователь "случайно" не ознакомился с документом от имени другого пользователя
		//ищем в базе документ и во всех пунктах в поле ознакомлен ставим true
		models.docs.findOne({'_id': id}, function(err, results){


			if(err){
				msg = req.body.username + ': при попытке получения документов, для изменения статуса ОЗНАКОМЛеН произошли ошибки:';
				console.log(msg.bgRed.white);
				console.log(err);
			}

			if(!results) {
				msg = req.body.username + ': в базе нет документовдля изменения статуса ОЗНАКОМЛеН';
				console.log(msg.yellow);
				res.send('Документы не найдены...');
			}

			var puncts = results.doc_punkts;
			//console.log(puncts);
			var new_puncts = [];//здесь будут изменённые пункты

			//перебираем пункты, если находим имя пользователя, то ставим статус ОЗНАКОМЛеН
			puncts.forEach(function(item, i, arr) {
				//используем in, потому-что ищем в Object
				if(username in item[2]){
					//console.log(username + ' ЕСТЬ в ' + item[0] + ' пункте');
					item[2][username]['oznakomlen'] = true;
					//console.log(item[2]);

				}
				//добавляем пункт после проверки
				new_puncts.push(item);
			});

			models.docs.update({"_id": id}, {doc_punkts: new_puncts}, function(err, doc){
					if(err) {
						var msg = req.session.username + ' --> ВНИМАНИЕ! ошибки базы данных:'
						console.log(msg.bgRed.white);
						console.log(err);
					}
					else {
						var msg = req.session.username + ' --> Норма. Запросы в базу прошли.'
						console.log(msg.green);
						//console.log(doc);
					}
			});



			//console.log('новые пункты');
			//console.log(new_puncts);
		});

		//console.log(req.body);
		res.send("СТАТУС ДОКУМЕНТА ИЗМЕНЁН");
	}
	else{
		msg = req.session.username + ': ПОПЫТКА ОЗНАКООМИТЬСЯ ОТ ИМЕНИ ПОЛЬЗОВАТЕЛЯ ' + req.body.user;
		console.log(msg.bgRed.white);
	}
});










module.exports = router;
