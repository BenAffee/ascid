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
        models.users.findOne({username: req.session.username}, function(err, results){
            if(err) console.log(err);

            if(!results) {
                msg = 'при поиска пользователя >>>' + req.body.username + '<<< для смены пароля, база вернула пустой результат';
                console.log(msg.bgRed.white);
                console.log(results);
                res.send('ошибка базы данных');
            }

            else {
                //шифруем полученный из формы старый пароль
                var current_hash = crypto.pbkdf2Sync(req.body.old_password, results.salt, 10000, 512, 'sha512').toString('hex');
                //если введённый старый пароль совпадает с тем что в базе, то продолжаем...
                if(current_hash === results.hashedPassword){
                    //если новые пароли совпадают, то шифруем новый пароль и пишем его в базу
                    if(req.body.new_password1 === req.body.new_password2) {
                        current_hash = crypto.pbkdf2Sync(req.body.new_password1, results.salt, 10000, 512, 'sha512').toString('hex');

                        //пишем контроллирующим сведения об этом документе
                        models.users.update({"username": req.session.username},
                            {"hashedPassword": current_hash},
                            {multi: true},
                            function (err, doc) {
                                if (models.err_handler(err, req.session.username)) {
                                    res.send('ошибки базы при изменеини пароля');
                                    return;
                                }
                                else{
                                    res.send('пароль успешно изменён');
                                }
                            });

                        /*var set_new_pass = new models.users({
                            hashedPassword: current_hash
                        });

                        set_new_pass.save(function (err) {
                            if (!err) {
                                return res.send('Пароль изменён!');
                            }

                            else {
                                //console.log(err);
                                if (err.name == 'ValidationError') {
                                    //отдаём пользователю все ошибки валидации от монгуса
                                    console.log('ошибка изменения пароля'.bgRed.white);
                                    //res.statusCode = 400;
                                    res.send(err.message);
                                }

                                else {
                                    msg = 'Статус 500 при изменении пароля:' + req.body;
                                    res.send(msg);
                                    console.log(msg.bgRed.white);
                                }
                            }
                        })*/
                    }
                }

            }
        });
        //res.send("получил форму");
    }
    else {
        res.send('ошибка аутентификации при смене пароля');
    }
});



module.exports = router;