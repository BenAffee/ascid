//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//В этом файле хранятся роуты по дбавлению документов в базу

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//NOTE: Неплохо было бы добавить валидацию входящего файла

var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

var config = require('../config/index');

//импоритруем модели монгуса
var models    = require('../config/mongoose');

////работает...
var multer  = require('multer');
var upload_file_doc_dest = '../public/files/';
var upload_file_doc = multer({ dest: upload_file_doc_dest }).single('file_doc');



router.post('/', upload_file_doc, function (req, res) {
	msg = req.session.username + ': сработал путь upload_doc';
	console.log(msg.magenta.bold);
	
	//====================================================
	//ЗАПИСИ В БАЗУ МОЖЕТ ДОБАВЛЯТЬ ТОЛЬКО МОДЕРАТОР!!!
	//====================================================
	if(req.session.isModerator){

		//формируем имя файла
		var filename_doc = config.type_of_docs[req.body.type_doc] + '_'+ req.body.num_doc + '_от_' + req.body.date_doc + '.pdf';

		//сначала проверка файла и полей, если всё нормально, то пишем файл и записываемв базу
		if(file_doc_valid(req.file)){

			
			
			//собираем АССОЦИАТИВНЫЙ массив с пунктами
			var punkts=[];//массив со всеми пунктами, который будем добавлять в базу
			var ispoln=[];//массив с исполлнителями одного пункта
			var kontrols=[];//массив с контроллирующими одного пункта
			var status = {};//массив с именем исполнителя и полями исполнено и ознакомлен
			
			for (var i = 0; i <= req.body.punkts_count; i++) {
				//var pushed=[];//массив в котором хранится один пункт
				//var one_punkt={};//массив в котором хранится один пункт
				
				//добавляем в массив номер пункта
				var name = 'num_punkt_' + i;
				var number_punkt = req.body[name];
				
				//делаем красивую дату
				name = 'date_punkt_' + i;
				var str = req.body[name];
				var date_to_base = str[8] + str[9] + '.' + str[5] + str[6] + '.' + str[0] + str[1] + str[2] + str[3] + ' г.'
				
				//добавляем в массив исполнителей
				name = 'ispolniteli_' + i;
				//распарсим массив и добавим поля исполнено и ознакомлен
				var massiv = req.body[name];
				var isp_with_status={};//массив с именем исполнителя и полями исполнено и ознакомлен
				massiv.forEach(function(item, i, arr) {
					isp_with_status[item] = {'ispolneno':false, 'oznakomlen':false};
				});
				ispoln = ispoln.concat(massiv);//это массив в котором все исполнители из всех пунктов
				
				//добавляем в массив контроллирующих
				name = 'controllers_' + i;
				//распарсим массив и добавим поле ознакомлен
				massiv = req.body[name];
				var cont_with_status={};
				massiv.forEach(function(item, i, arr) {
					cont_with_status[item] = {'oznakomlen':false};
				});
				kontrols = kontrols.concat(req.body[name]);//это массив в котором все контроллирующие из всех пунктов
				
				
				punkts.push({
					'num_punkt':number_punkt,
					'date': date_to_base,
					'ispoln': isp_with_status,
					'kontrols': cont_with_status
				});
			}

			
			console.log('Пункты->');
			console.log(punkts);
			var old_name = req.file.path;
			var new_name = upload_file_doc_dest + filename_doc;
			
			fs.rename(
				old_name,
				new_name,
				function( err ) {
				if(err) console.log(err);
				else console.log('файл успешно переименован!')
				}
			)
			//делаем красивую дату
			var str = req.body.date_doc;
			var date_to_base = str[8] + str[9] + '.' + str[5] + str[6] + '.' + str[0] + str[1] + str[2] + str[3] + ' г.'			
			
			//пишем в базу документ...
			var add_doc = new models.docs({
				filename: filename_doc,
				doc_type: req.body.type_doc,
				doc_num: req.body.num_doc,
				doc_date: date_to_base,
				doc_ruc: req.body.ruc_doc,
				doc_about: req.body.about_doc,
				doc_punkts: punkts
			});

			add_doc.save(function (err) {
				if (!err) {
					var this_doc_id = add_doc._id;
					//var ispoln = add_doc.doc_punkts[2];
					msg = 'документ: ' + filename_doc + ' добавлен! id-->' + this_doc_id;
					console.log(msg.red);
					
					
					//оставляем в массивах контроллирующих и исполнителей только уникальные значения
					ispoln = unique_item_in_arr(ispoln);
					kontrols = unique_item_in_arr(kontrols);
					
					//пишем исполнителям сведения об этом документе
					models.users.update({"username": {$in: ispoln}}, 
										{$push: {docs_ispoln: this_doc_id, new_docs_ispoln: this_doc_id}}, 
										{multi: true}, 
										function(err, doc){
						if(models.err_handler(err, req.session.username)) return;
					});
					
					//пишем контроллирующим сведения об этом документе
					models.users.update({"username": {$in: kontrols}}, 
										{$push: {docs_kontrols: this_doc_id, new_docs_kontrols: this_doc_id}}, 
										{multi: true}, 
										function(err, doc){
						if(models.err_handler(err, req.session.username)) return;
					});					

					return res.send(msg);
				} 

				else {
					//console.log(err);
					if(err.name == 'ValidationError') {
						//отдаём пользователю все ошибки валидации от монгуса
						console.log('ошибки добавления документов:'.bgRed.white);
						//res.statusCode = 400;
						res.send(err.message);
					} 

					else {
						msg = 'Статус 500 при добавлении документа. Получена форма:' + req.body;
						res.send(msg);
						console.log(msg.bgRed.white);
						}
						console.log(err.message);
					//если есть ошибки добавления записи в базу, то удаляем файл
					msg = 'есть ошибки добавления записи в базу, поэтому файл удаляем';
					console.log(msg.red);
					file_doc_delete(new_name);
					
				}
			});
		}
		else{
			msg = 'файл не прошёл валидацию и будет удалён!';
			console.log(msg.bgRed.white);
			res.send(msg);
			//удаляем файл если он не прошёл валидацию
			file_doc_delete(req.file.path);

		}

	

	}
	else{
		res.send('Попытка нарушения прав доступа. Ошибка добавлена в лог');
		msg = req.session.username + ': попытка добавления файла не модератором';
        console.log(msg.bgRed.white);
	}

});



//функция валидации файла
var file_doc_valid = function(file){
	if (file.mimetype == 'application/pdf') {
		msg = 'Валидация на mimetype успешна. MimeType файла --> ' + file.mimetype;
		console.log(msg.green);
		return true;
	}
	else{
		msg = 'Файл не прошёл валидацию на mimetype. MimeType файла --> ' + file.mimetype;
		console.log(msg.red);		
		return false
	}
}

//функция удаления файла
var file_doc_delete = function(file){
	fs.unlink(file, function(err){
		if(err) console.log(err);
		else console.log('file deleted successfully');
		return true;
		}); 
}

//функция которая оставляет в массиве только уникальные значения
var unique_item_in_arr = function(arr){
	var obj = [];
	for (var i = 0; i < arr.length; i++) {
		var str = arr[i];
		obj[str] = true; // запомнить строку в виде свойства объекта
	}
	return Object.keys(obj); // или собрать ключи перебором для IE8-
}


module.exports = router;