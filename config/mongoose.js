var mongoose = require('mongoose');
var crypto = require('crypto');

//выводим в лог версию драйвера mongoose
var msg = 'версия драйвера mongoose: '+ mongoose.version;
console.log(msg.bgGreen.white);

//подключаем файл с конфигом
var config = require('./index');

var msg = 'среда выполнения: '+ config.node_env_mode;
console.log(msg.bgGreen.white);

//общий синтаксис метода createConnection выглядит слудеющим образом:
//mongoose.connect('mongodb://username:password@host:port/database').
mongoose.connect(config.mongoose.uri);
var db = mongoose.connection;

//обработка ошибок
db.on('error', function() {
	var msg = 'ошибка соединения с сервером БД: ' + config.mongoose.uri;
	console.log(msg.bgRed.white);
});	
	
db.once('open', function() {
	var msg = 'соединение с сервером БД: ' + config.mongoose.uri +' установлено';
	console.log(msg.bgGreen.white);
});

//схемы
var userSchema = new mongoose.Schema({
	// Логин
	username:{
		type:String, // тип: String
		required:[true,'Необходимо имя пользователя'],
		// Данное поле обязательно. Если его нет вывести ошибку с текстом usernameRequired
		maxlength:[32,'Слишком длинное имя (не более 32 символов)'],
		// Максимальная длинна 32 Юникод символа (Unicode symbol != byte)
		minlength:[3,'Слишком короткое имя (не менее 3 символов)'],
		// Слишком короткий Логин!
		match:[/^[\_A-Za-z0-9]+$/,'Не допустимые символы в имени пользователя (допускаются латинские буквы, цифры и подчёркивание)'],
		// Мой любимй формат! ЗАПРЕТИТЬ НИЖНЕЕ ТИРЕ!
		unique:[true,'Такой пользователь уже существует'] // Оно должно быть уникальным
	},
	// Шифрованный пароль
	hashedPassword:{
		type:String, // тип String
		required:[true,'Введите пароль!']
	},
	//соль
	salt: {
		type: String,
		required: true
	},
    // Полное наименование должности
	post_long:{
		type:String, // тип String
		maxlength:[256,'Слишком длинное наименование должности (не более 256 символов)'],
		match:[/^[А-Яа-я0-9\s\-\(\)]+$/,'Не допустимые символы в наименование должности (допускается кириллица и цыфры)'],
		required:[true,'Введите наименование должности!']
	},
	//Аббревиатура должности
	post_short:{
		type:String, // тип String

		maxlength:[8,'Слишком длинная аббревиатура должности (не более 8 символов)'],
 
		match:[/^[\-А-Яа-я0-9]+$/,'Не допустимые символы в аббревиатуре должности (допускается кириллица и цыфры)'],
 		required:[true,'Введите аббревиатуру должности!']
	},
	//Уровень руководства
	ruk_level:{
		type:Number, // тип String
		match:[/^[\1\2\3\4]+$/,'Не допустимый уровень руководителя']
	},
	//дата создания пользователя
	created: {
		type: Date,
		default: Date.now
	},
	
	//признак администратора
	isAdministrator: {
		type: Boolean,
		default: false
	},
	
	//признак модератора
	isModerator: {
		type: Boolean,
		default: false
	},
	
	//массив, в котором хранятся id ВСЕХ документов, в которых пользователь является исполнителем
	docs_ispoln: {
		type: Array,
	},
	
	//массив, в котором хранятся id ВСЕХ документов, в которых пользователь является контроллирующим
	docs_kontrols: {
		type: Array,
	},
	
	//массив, в котором хранятся id НОВЫХ документов, в которых пользователь является исполнителем
	new_docs_ispoln: {
		type: Array,
	},
	
	//массив, в котором хранятся id НОВЫХ документов, в которых пользователь является контроллирующим
	new_docs_kontrols: {
		type: Array,
	}
});

userSchema.methods.encryptPassword = function (password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

userSchema.virtual('userId')
    .get(function () {
        return this.id;
    });

userSchema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () { return this._plainPassword; });


userSchema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

var users = mongoose.model('users', userSchema);


//схема модели документа
var docsSchema = new mongoose.Schema({
	// Имя файла на сервере
	filename:{
		type:String, // тип: String
		required:[true,'Возникли проблемы с файлом. Возможно, Вы его не выбрали.'],
		unique:[true,'Файл с таким именем на сервере уже существует. убедитесь что Вы ранее не загружали документ с такими же реквезитами.']
	},
	// Тип документа
	doc_type:{
		type:Number, // тип String
		required:[true,'Вы не указали тип документа!']
	},
	//Номер документа
	doc_num:{
		type:Number, // тип String
		required:[true,'Вы не указали номер документа!']
	},
	//Дата утвердения документа
	doc_date:{
		type:Number, // тип число
		required:[true,'Необходимо указать дату утвержедния документа']
	},
	// Имя пользователя, утвердившего документ
	doc_ruc:{
		type:String, // тип: String
		required:[true,'Убедитесь, что указали руководителя']
	},	
	// Описание документа
	doc_about:{
		type:String, // тип: String
		required:[true,'Введите краткое описание документа']
	},		
	//дата добавления документа
	doc_created: {
		type: Date,
		default: Date.now
	},
	
	//массив пунктов документа
	doc_punkts: {
		type: Array,
		required:[true,'Опишите хотя бы один пункт']
	}

});

var docs = mongoose.model('docs', docsSchema);

//--------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//схема модели для логов
var logsSchema = new mongoose.Schema({
	// тип сообщения. (INFO, WARNING, ERROR)
	type_msg:{
		type:String, // тип: String
		required:[true,'В лог не попал тип логирующего сообщения'],
	},
	//Пользователь у которого возник лог
	user_msg:{
		type:String, // тип String
		required:[true,'В лог не попало имя пользователя']
	},
	// время записи
	time_msg:{
		type:Number, // тип Number
		required:[true,'В лог не попало время логирующего сообщения']
	},
	//Номер сообщения (чтобы можно было отличить сообщения друг от друга)
	num_msg:{
		type:Number, // тип String
		required:[true,'В лог не попал номер логирующего сообщения']
	},
	//Текст сообщения 
	text_msg:{
		type:String, // тип String
		required:[true,'В лог не попал текст логирующего сообщения']
	},
	//Если есть объект ошибки, то помещаем её сюда
	err_obj_msg:{
		type:String, // тип String
	}


});

var logs = mongoose.model('logs', logsSchema);


module.exports = {
    users: users,
    docs: docs,
	logs: logs
};

module.exports.err_handler = function(error, name){
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
}



