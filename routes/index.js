var express = require('express');
var router = express.Router();

//var path = require('path');
//var fs = require('fs');

//импоритруем модели монгуса
var models    = require('../config/mongoose');

var crypto = require('crypto');
var config = require('../config/index');

var multer  = require('multer');

//работает...
var upload_file_doc_dest = './public/files/';
var upload_file_doc = multer({ dest: upload_file_doc_dest }).single('file_doc');

//var flow = require('nimble');//для последовательного выполнения операций

var msg='';

//var moder_users=[];
//var moder_users_all=[];



//--------------------------------------------------------------------------------------------GET home page.
router.get('/', function(req, res, next) {
	
	msg = req.session.username + ': сработал корневой путь';
	console.log(msg.magenta.bold);

	res.render('index', { 
		username: req.session.username,
		isAdministrator: req.session.isAdministrator,
		isModerator: req.session.isModerator,
		post_short: req.session.post_short,
		post_long: req.session.post_long
	  
	});
});



//тут всякие аяксовые штуки

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
