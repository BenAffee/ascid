$(document).ready(function(){
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Делаем ajax асинхронным
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$.ajaxPrefilter(function( options, original_Options, jqXHR ) {
	options.async = true;
});

	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка формы входа
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#auth_ok_but', function(){
		//console.log('событие кнопки вход');
		//проверка на совпадение паролей
		/*if($('#new_password_1').val() != $('#new_password_2').val()){
			$('#reg_message').html('Пароли не совпадают!');
			return;
		}*/

		var $form = $('#form_auth');
		//console.log('отправка формы');

		$.ajax({
			type: 'post',
			url: '/auth',
			data: $form.serialize()
		})

		.done(function(msg) {
			if(msg == '') location.reload(); // если от сервера пришёл пустой ответ, то перезагружаем страницу. В этом случае, если на бэкэнде всё прошло нормально, то должна подхватиться сессия и т.п.
			else $('#reg_message_auth').text(msg);//если есть ошибки от сервера, то показываем их в окне
			//$("#ModalEnter").modal('hide');
		})

		.fail(function() {
			$('#reg_message_auth').text('Что-то пошло не так... Обратитесь к администратору');
		});
	});	





	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Функция для проверки совпадения паролей
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('input','.input_set_passw', function(){
		//если в поле старый пароль что-то введено и новые пароли совпадают, то активируем кнопку отправки нового пароля
		if(($('#new_password1').val()!=='') &&($('#old_password').val()!=='') && ($('#new_password1').val() === $('#new_password2').val())){
			$('#reg_message_set_passwd').text('сработал скрипт');
			$('#set_passw_but').prop('disabled',false);
		}
		else{
			$('#reg_message_set_passwd').text('не все поля заполнены, либо пароли не совпадают');
			$('#set_passw_but').prop('disabled',true);
		}

	});


	//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка формы смены пароля
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#set_passw_but', function(){
		console.log('событие кнопки сменить пароль');
		//проверка на совпадение паролей
		/*if($('#new_password_1').val() != $('#new_password_2').val()){
			$('#reg_message').html('Пароли не совпадают!');
			return;
		}*/

		var $form = $('#set_passw');
		//console.log('отправка формы');

		$.ajax({
			type: 'post',
			url: '/user_settings/set_passw',
			data: $form.serialize()
		})

			.done(function(msg) {
				if(msg == '') location.reload(); // если от сервера пришёл пустой ответ, то перезагружаем страницу. В этом случае, если на бэкэнде всё прошло нормально, то должна подхватиться сессия и т.п.
				else $('#reg_message_set_passwd').text(msg);//если есть ошибки от сервера, то показываем их в окне
				//$("#ModalEnter").modal('hide');
			})

			.fail(function() {
				$('#reg_message_set_passwd').text('Что-то пошло не так... Обратитесь к администратору');
			});
	});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка формы со сведениями о документе, с которым ознакомился пользователь
//в контексте исполнителя
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$(document).on('click', '.ref_download_ispoln', function(){

		var name = $(this).attr('name');
		var id = name.substr(2);//отрезаем 2 первых символа
		var username = $('#username_'+id).val();//получаем имя пользователя
		//var punkts = $('#punkts_'+id).val();//получаем массив с пунктами
		$.ajax({
			method: 'POST',
			url: '/oznakomlen_ispoln',
			data: { id: id, user: username}
		})
		.done(function( msg ) {
			//$('#message1').html(msg);
			$('#main_content').html(msg);
			if($('#num_of_new_ispoln').val() != 0){//если количествоновых документов не равно 0, то показываем количество в бадже
				//на всякий случай устанавливаем видимым бадж
				$('#span_num_of_new_ispoln').show();
				$('#span_num_of_new_ispoln').html($('#num_of_new_ispoln').val());
			}
			else
				$('#span_num_of_new_ispoln').hide();//прячем бадж, если нет новых документов
			console.log($('#num_of_new_ispoln').val());
		});
	
	//console.log(username);
	}); 	

	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка формы со сведениями о документе, с которым ознакомился пользователь
//в контексте контроллирующего
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$(document).on('click', '.ref_download_kontrol', function(){

		var name = $(this).attr('name');
		var id = name.substr(2);//отрезаем 2 первых символа
		var username = $('#username_'+id).val();//получаем имя пользователя
		//var punkts = $('#punkts_'+id).val();//получаем массив с пунктами
		$.ajax({
			method: 'POST',
			url: '/oznakomlen_kontrol',
			data: { id: id, user: username}
		})
		.done(function( msg ) {
			//$('#message1').html(msg);
			$('#main_content').html(msg);
			if($('#num_of_new_kontrol').val() != 0){//если количествоновых документов не равно 0, то показываем количество в бадже
				//на всякий случай устанавливаем видимым бадж
				$('#span_num_of_new_kontrol').show();
				$('#span_num_of_new_kontrol').html($('#num_of_new_kontrol').val());
			}
			else
				$('#span_num_of_new_kontrol').hide();//прячем бадж, если нет новых документов
			console.log($('#num_of_new_kontrol').val());
		});
	
	//console.log(username);
	});
	
	

	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка отметки об исполнении
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$(document).on('click', '.ref_ispolneno', function(e){
		e.preventDefault();
		var name = $(this).attr('id');
		var arr = name.split('-');
		//console.log(arr);
		$.ajax({
			method: 'POST',
			url: '/ispolneno',
			data: { id: arr[0], punkt: arr[1], user: arr[2], kontr: arr[3]}
		})
		.done(function( msg ) {
			//$('#message_update_ispolnen').html(msg);
			//меняем цвет баджа
			$("#badge_" + name).removeClass('badge-warning');
			$("#badge_" + name).addClass('badge-success');
			//удаляем ссылку со знаком "галочка"
			$("#"+name).remove();
		});

	});






	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//обработка кликов по ссылкам
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//$('.control_href').click(function(e) {
	$(document).on('click','.control_href', function(e){
	
		e.preventDefault();
		var page = '/control/' + $(this).attr('href');
		//console.log(page);
		$.ajax({
			async: true,
			type: "GET",
			url: page,
			dataType: "html",
		
	
			success: function(msg) {
					$('#main_content').html(msg);
					$('.multi-select').multiSelect('refresh');
			},
		
			error: function() {
				$('#main_content').html('Что-то пошло не так... Обратитесь к администратору');
			}
		});
		//console.log(page);
	});
	
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//обработка клика по ссылке "ЗАБЫЛИ ПАРОЛЬ?"
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#href_remember_pass', function(e){
		e.preventDefault();
		$('#reg_message_auth').html('Для смены пароля обратитесь к администратору по телефону +7-931-543-01-19');
	});
	
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Проверка типа браузера
//взято отсюда --> https://stackoverflow.com/questions/13478303/correct-way-to-use-modernizr-to-detect-ie#13480430
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
	
var BrowserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "Other";
			this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
		},
		searchString: function (data) {
			for (var i = 0; i < data.length; i++) {
				var dataString = data[i].string;
				this.versionSearchString = data[i].subString;

				if (dataString.indexOf(data[i].subString) !== -1) {
					return data[i].identity;
				}
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index === -1) {
				return;
			}

			var rv = dataString.indexOf("rv:");
			if (this.versionSearchString === "Trident" && rv !== -1) {
				return parseFloat(dataString.substring(rv + 3));
			} else {
				return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
			}
		},

		dataBrowser: [
			{string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
			{string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
			{string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
			{string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
			{string: navigator.userAgent, subString: "Opera", identity: "Opera"},  
			{string: navigator.userAgent, subString: "OPR", identity: "Opera"},  

			{string: navigator.userAgent, subString: "Chrome", identity: "Chrome"}, 
			{string: navigator.userAgent, subString: "Safari", identity: "Safari"}	   
		]
	};
	
	BrowserDetect.init();
	//document.write("You are using <b>" + BrowserDetect.browser + "</b> with version <b>" + BrowserDetect.version + "</b>");
	
	//если пользователь зашёл через эксплорер или эдж, то ркомендуем ему пользоваться друшими браузерами)))
	if (BrowserDetect.browser == 'Explorer' || BrowserDetect.browser == 'MS Edge')
		alert('Вы используете браузер InternetExplorer. Во избежание ошибок при работе приложения используйте браузеры Chrome или Mozilla.');

});






