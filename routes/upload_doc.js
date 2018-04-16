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
var upload_file_doc_dest = './public/files/';
var upload_file_doc = multer({ dest: upload_file_doc_dest }).single('file_doc');



router.post('/', upload_file_doc, function (req, res) {
	//var file = req.files.file_doc;
	
	msg = req.session.username + ': сработал путь upload_doc';
	console.log(msg.magenta.bold);
	
	//====================================================
	//ЗАПИСИ В БАЗУ МОЖЕТ ДОБАВЛЯТЬ ТОЛЬКО МОДЕРАТОР!!!
	//====================================================
	if(req.session.isModerator){

		//console.log(req.body);
		//console.log(req.file);
		


		
		//формируем имя файла
		var filename_doc = config.type_of_docs[req.body.type_doc] + '_'+ req.body.num_doc + '_от_' + req.body.date_doc;
		
	
		//сначала проверка файла и полей, если всё нормально, то пишем файл и записываемв базу
		if(file_doc_valid(req.file)){
			//собираем массив с пунктами
			var punkts=[];//массив со всеми пунктами, который будем добавлять в базу
			var pushed=[];//массив в котором хранится один пункт
			//начинаем перибирать значения... старт с 0, конечное знаение ханится в punkts_count
			var i;
			for (i = 0; i <= req.body.punkts_count; i++) {
				var name = 'num_punkt_' + i;
				if(req.body[name]){
					var pushed=[];//массив в котором хранится один пункт


					//console.log('----------------------------------------------'.green);
					//console.log(name);
					//console.log(req.body[name]);

					//добавляем в массив номер пункта
					pushed.push(req.body[name]);

					//добавляем в массив дату исполнения
					name = 'date_punkt_' + i;
					pushed.push(req.body[name]);

					//добавляем в массив исполнителей
					name = 'ispolniteli_' + i;
					pushed.push(req.body[name]);

					//добавляем в массив контроллирующих
					name = 'controllers_' + i;
					pushed.push(req.body[name]);

					//добавляем всё в массив который уйдёт в базу
					punkts.push(pushed);
				}
			}			
			
			
			
			var old_name = req.file.path;
			var new_name = 'public/files/' + filename_doc + '.pdf';
			
			fs.rename(
				old_name,
				new_name,
				function( err ) {
				if(err) console.log(err);
				else console.log('файл успешно переименован!')
				}
			)
			
			//пишем в базу документ...
			var add_doc = new models.docs({
				filename: filename_doc,
				doc_type: req.body.type_doc,
				doc_num: req.body.num_doc,
				doc_date: req.body.date_doc,
				doc_ruc: req.body.ruc_doc,
				doc_about: req.body.about_doc,
				doc_punkts: punkts
			});

			add_doc.save(function (err) {
				if (!err) {

					msg = 'документ: ' + filename_doc + ' добавлен!'
					console.log(msg.red);
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
						//res.statusCode = 500;
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
		res.send('а ты жулик)))');
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

module.exports = router;