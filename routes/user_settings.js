//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//В этом файле хранятся роуты по настройке пользователей

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===================================================================================================
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var express = require('express');
var router = express.Router();

//импоритруем модели монгуса
var models    = require('../config/mongoose');

var crypto = require('crypto');

var msg='';



//Принимаем форму с новым паролем
router.post('/set_passw', function(req, res) {


    if(req.session.username){//проверяем что пользователь прошёл аутентификацию
        //проверка напустую форму
        if(!req.body) {
            return res.sendStatus(400);
            res.send('Пришла пустая форма авторизации'.red);
            next();
        }

        //ищем пользователя в базе
        models.users.findOne({username: req.body.username}, function(err, results){
            if(err) console.log(err);

            if(!results) {
                msg = 'при поиска пользователя >>>' + req.body.username + '<<< для смены пароля, база вернула пустой результат';
                console.log(msg.bgRed.white);
                console.log(results);
                res.send('ошибка базы данных');
            }

            else {
                //шифруем полученный из формы старый пароль
                var current_hash = crypto.pbkdf2Sync(req.body.old_password, results.salt, 10000, 512, 'sha512').toString('hex')
                //если введённый старый пароль совпадает с тем что в базе, то продолжаем...
                if(current_hash === results.hashedPassword){
                    //если новые пароли совпадают, то шифруем пароль
                }



                if(results.username == req.body.username && results.hashedPassword == current_hash){
                    //разу получаем из базы список пользователей - он нам постоянно будет нужен

                    models.users.find(function(err, results1){
                        if(err){
                            msg = req.body.username + ': при попытке получения списка пользователей из базы, произошла ошибка';
                            console.log(msg.bgRed.white);
                            console.log(err);
                            return;
                        }
                        var tmp_arr_1={};
                        var tmp_arr_2={};
                        //получаем два массива со всеми имена пользователей (сокращёнными и полными)
                        results1.forEach(function(item, i, arr) {
                            var user = item.username;
                            tmp_arr_1[user] = item.post_long;;
                            tmp_arr_2[user] = item.post_short;
                        });

                        req.session.all_users_short = tmp_arr_2;
                        req.session.all_users_long = tmp_arr_1;
                        //пишем в сессию записи из базы
                        req.session.username = results.username;
                        req.session.isAdministrator = results.isAdministrator;
                        req.session.isModerator = results.isModerator;
                        req.session.post_short = results.post_short;
                        req.session.post_long = results.post_long;
                        req.session.docs_ispoln = results.docs_ispoln;
                        req.session.docs_kontrols = results.docs_kontrols;
                        //req.session.new_docs_ispoln = results.new_docs_ispoln;
                        //req.session.new_docs_kontrols = results.docs_kontrols;
                        req.session.len_new_docs_kontrols = results.new_docs_kontrols.length;
                        req.session.len_new_docs_ispoln = results.new_docs_ispoln.length;

                        //console.log('список документов гдепользователь исполнитель:');
                        //console.log(req.body);
                        /*
                        //если установлен чекбокс "запомнить меня", то пишем куку и запись в базу со случайным ключом
                        if(req.body.checkbox_remember_me){
                            var rand_value = crypto.randomBytes(32).toString("hex");//получаем случайный ключ
                            //птшем куку
                            res.cookie('logintoken', rand_value, {
                                        expires: new Date(Date.now() + 2 * 604800000),
                                        path: '/'
                            });
                            //пишем в базу
                            var add_rememberme = new models.rememberme({
                                username: req.session.username,
                                value: rand_value
                            });
                            add_rememberme.save(function (err) {
                                if(models.err_handler(err, req.session.username)) return;
                            });
                        }*/



                        msg = req.session.username + ': доступ разрешён';
                        console.log(msg.green);

                        //console.log(req.session.all_users_short);
                        //console.log(req.session.all_users_long);
                        res.send('');
                    });


                }

                else{

                    msg = req.body.username + ': доступ запрещён';
                    console.log(msg.red);

                    console.log(results);

                    res.send('неправильное имя пользователя/пароль');
                }

            }
        });

        res.send("получил форму");
    }
});



module.exports = router;