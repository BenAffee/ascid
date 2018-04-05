/*$(document).on('click','#reg_button1', function(){
		console.log('нажатие кнопки 1');
});*/

//Отправка формы регистрациии пользователя
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
		url: '/reg',
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


	



$(document).ready(function(){

//обработка кликов по ссылкам
	$('.control_href').click(function(e) {
	
		e.preventDefault();
		var page = '/control/' + $(this).attr('href');
		console.log(page);
		$.ajax({
			type: 'get',
			url: page,
		})
	
		.done(function(msg) {
				$('#main_content').html(msg);
				//$("#ModalEnter").modal('hide');
		})
		
		.fail(function() {
			$('#main_content').html('Что-то пошло не так... Обратитесь к администратору');
		});
		//console.log(page);
	});
});






