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
	var push1 = 'NF_1';
if(push1.constructor === Array) console.log('массив');
	else console.log('не массив');

	
	
	

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













module.exports = router;
