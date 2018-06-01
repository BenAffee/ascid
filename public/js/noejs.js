$(document).ready(function(){

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
//Отправка формы со сведениями о документе, с которым ознакомился пользователь
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	$(document).on('click', '.ref_download', function(){

		var name = $(this).attr('name');
		var id = name.substr(2);//отрезаем 2 первых символа
		var username = $('#username_'+id).val();//получаем имя пользователя
		$.ajax({
			method: 'POST',
			url: '/oznakomlen',
			data: { id: id, user: username }
		})
		.done(function( msg ) {
			$('#message1').html(msg);
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






