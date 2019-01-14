$(document).ready(function(){


	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Отправка формы входа
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#auth_ok_but', function(){
		console.log('событие кнопки вход');
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
//Отправка формы регистрациии пользователя
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#reg_button', function(){
		console.log('событие кнопки регистрации');
		//проверка на совпадение паролей
		if($('#new_password_1').val() != $('#new_password_2').val()){
			$('#reg_message').html('Пароли не совпадают!');
			return;
		}

		var $form = $('#form_reg');		
		//console.log('отправка формы');

		$.ajax({
			type: 'post',
			url: '/auth/reg',
			data: $form.serialize()
		})

		.done(function(msg) {
			$('#reg_message').text(msg);
			//$("#ModalEnter").modal('hide');
		})

		.fail(function() {
			$('#reg_message').text('Что-то пошло не так... Обратитесь к администратору');
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
//НАЖАТИЕ КНОПКИ УДАЛИТЬ
//в контексте модератора
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$(document).on('click', '.ref_delete_doc', function(e){

		e.preventDefault();
		//отправляем аяксом id документа, который собрались удалить
		$.ajax({
			method: 'POST',
			url: '/delete_doc',
			data: { id: $(this).attr('href')}
		})
		.done(function( msg ) {
			alert(msg);

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
//Отправка формы добавления документа с помощью плагина jqueryForm
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	var options_form_submit = { 
		target: '#add_doc_message',   // target element(s) to be updated with server response 
		beforeSubmit: showRequest,  // pre-submit callback 
		success: showResponse  // post-submit callback 

    }; 	

	$(document).on('submit','#uploadForm', function(){
		$(this).ajaxSubmit(options_form_submit); 
 		return false; 
	}); 	
	
	function showRequest(formData, jqForm, options) { 

		//var queryString = $.param(formData); 
		// var formElement = jqForm[0]; 
		//alert('About to submit: \n\n' + queryString); 
		return true; 
} 
	
	function showResponse(responseText, statusText, xhr, $form)  { 
		//alert('status: ' + statusText + '\n\nresponseText: \n' + responseText + 
		//'\n\nThe output div should have already been updated with the responseText.'); 
} 	

	
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//обработка кликов по ссылкам
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	//$('.control_href').click(function(e) {
	$(document).on('click','.control_href', function(e){
	
		e.preventDefault();
		var page = '/control/' + $(this).attr('href');
		console.log(page);
		$.ajax({
			type: 'get',
			url: page,
		})
	
		.done(function(msg) {
				$('#main_content').html(msg);
				$('.multi-select').multiSelect('refresh');

				//$("#ModalEnter").modal('hide');
		})
		
		.fail(function() {
			$('#main_content').html('Что-то пошло не так... Обратитесь к администратору');
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
		$('#reg_message_auth').html('Для смены пароля обратитесь к администратору по телефону +7-999-999-99-99');
	});
	
	
	
	
	
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//обработка кликов по ссылкам закрытия пунктов добавления документов
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','.close_card', function(e){
		e.preventDefault();
		var name = '#card_' + $(this).attr('href');
		//console.log(name);
		$(name).remove();
	});
	
	
	
	
	
	
	
	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//добавить пункт в форме ввода документов
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	$(document).on('click','#add-punkt', function(){
	
		//e.preventDefault();
		//присваиваеваем новое значение счётчика
		var i = Number($('#punkts_count').val())+1;
		$('#punkts_count').val(i);

		console.log('отдаём счётчик: ' + i);
		var link = '/control/numer/' + i;
		$.ajax({
			type: 'get',
			url: link
		})
	
		.done(function(msg) {
				$('#accordion').append(msg);
				$('#ispolniteli_'+i).multiSelect('refresh');
				$('#controllers_'+i).multiSelect('refresh');
				//$("#ModalEnter").modal('hide');
			//ispolniteli_#{count_punkt}
		})
		
		.fail(function() {
			$('#main_content').html('Что-то пошло не так... Обратитесь к администратору');
		});
		//console.log(page);
	});	
});






