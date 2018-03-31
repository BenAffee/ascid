$(document).ready(function(){
	
//Отправка формы регистрациии пользователя
	$('#reg_button').click(function() {
		//отмена действия по умолчанию для кнопки submit
		//e.preventDefault();
	
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
				$('#reg_message').html(msg);
				//$("#ModalEnter").modal('hide');
		})
		
		.fail(function() {
			$('#reg_message').html('Что-то пошло не так... Обратитесь к администратору');
		});
	});

//обработка кликов по ссылкам
	$('.control_href').click(function(e) {
	
		e.preventDefault();
		var page = '/control/' + $(this).attr('href');
		//console.log(page);
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






