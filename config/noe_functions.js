//В этом файле находятся все наиболее часто используемые пользовательские функции
var express = require('express');
var router = express.Router();

const fs = require('fs');
//импоритруем модели монгуса
const models = require('../config/mongoose');

let noe_functions={};

//функция удаления файла
noe_functions.file_doc_delete = function(file){
	fs.unlink(file, function(err){
		if(err) console.log(err);
		else console.log('file deleted successfully');
		return true;
	})
}

//функция которая оставляет в массиве только уникальные значения
noe_functions.unique_item_in_arr = function(arr){
	let obj = [];
	for (let i = 0; i < arr.length; i++) {
		let str = arr[i];
		obj[str] = true; // запомнить строку в виде свойства объекта
	};
	return Object.keys(obj); // или собрать ключи перебором для IE8-
};


//функция логирования//type, name, num, text, err_obj
noe_functions.set_log_msg = function(msg_arr){
	let error_obj;
	if(msg_arr[4]) error_obj=msg_arr[4];
	else error_obj='none';
	
	let time = new Date();
	//пишем в базу новый лог...
	let add_log = new models.logs({
		type_msg: msg_arr[0],
		user_msg: msg_arr[1],
		time_msg: time.getTime(),
		num_msg: msg_arr[2],
		text_msg: msg_arr[3],
		err_obj_msg: error_obj
	});
	
	add_log.save(function (err) {
		if (err) {
			console.log('!1!! ОШИБКИ ЛОГИРОВАНИЯ');
			console.log(err);
		};
	});
	return;
}

//функция преобразования даты в миллисекунды
noe_functions.dateToMillis = function(date_str,path_str){
	//паттерн для проверки даты, такой же паттерны используется на стороне пользователя
	let pattern = /^(?:(?:31(\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
	//если строка соответствует паттерну
	if(date_str.match(pattern)){
		let arr_substr=date_str.split(".");
		//год может быть как двузначным, так и четырёхзначным
		//если год двузначный то прикручиваем перед ним '20'
		let year;
		if(arr_substr[2].length == 2) {
			year = '20' + arr_substr[2];
		}
		else{
			year = arr_substr[2];
		}
		//получаем и возвращаем дату в миллисекундах
		let date = +new Date(year, arr_substr[1]-1, arr_substr[0]);
		return date;

	}
	else {
		//логируем ошибку проверки формата даты на стороне пользователя
		noe_functions.set_log_msg('ERROR', //тип сообщения (INFO, WARNING, ERROR)
			req.session.username, //имя пользователя
			'7', //номер сообщения
			'ошибка проверки формата даты на стороне сервера',
			'пришло-->'+date_str+'. путь -->'+path_str);//текст сообщения и объект ошибки
		return 0;
	}

};

//функция сортировки ассоциативного массива
noe_functions.dynamicSort = function(property){
	let sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}



module.exports = noe_functions;