var mongoose = require('mongoose');
var crypto = require('crypto');

//выводим в лог версию драйвера mongoose
var msg = 'версия драйвера mongoose: '+ mongoose.version;
console.log(msg.bgGreen.white);

//подключаем файл с конфигом
var config = require('./index');


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
        match:[/^[a-z0-9]+$/,'Не допустимые символы в имени пользователя (допускаются латинские буквы и цыфры)'],
        // Мой любимй формат! ЗАПРЕТИТЬ НИЖНЕЕ ТИРЕ!
        unique:true // Оно должно быть уникальным
    },
    // Пароль
    hashedPassword:{
        type:String, // тип String
        // В дальнейшем мы добавим сюда хеширование

        required:[true,'Введите пароль!']
        // Думаю здесь все уже очевидно
    },
	    // Пароль
    /*password:{
        type:String, // тип String
        // В дальнейшем мы добавим сюда хеширование

        required:[true,'Введите пароль!']
        // Думаю здесь все уже очевидно
    },*/
	//соль
	salt: {
        type: String,
        required: true
    },
    // Полное наименование должности
	post_long:{
		type:String, // тип String

        maxlength:[256,'Слишком длинное наименование должности (не более 256 символов)'],
 
        match:[/^[А-Яа-я0-9]+$/,'Не допустимые символы в наименование должности (допускается кириллица и цыфры)'],
        required:[true,'Введите наименование должности!']
	},
	
	//Аббревиатура должности
	post_short:{
		type:String, // тип String

        maxlength:[8,'Слишком длинная аббревиатура должности (не более 8 символов)'],
 
        match:[/^[А-Яа-я0-9]+$/,'Не допустимые символы в аббревиатуре должности (допускается кириллица и цыфры)'],
        required:[true,'Введите аббревиатуру должности!']
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




module.exports = mongoose;
module.exports = mongoose.model('users', userSchema);


