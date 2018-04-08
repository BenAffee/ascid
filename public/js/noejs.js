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
	
	
//обработка кликов по ссылкам закрытия пунктов добавления документов
	$(document).on('click','.close_card', function(e){
		e.preventDefault();
		var name = '#card_' + $(this).attr('href');
		//console.log(name);
		$(name).remove();
	});
	
//добавить пункт в форме ввода документов
	$(document).on('click','#add-punkt', function(){
	
		//e.preventDefault();
		//присваиваеваем новое значение счётчика
		var i = Number($('#punkts_count').val())+1;
		$('#punkts_count').val(i);

		console.log('отдаём счётчик: ' + i);
		var link = '/numer/' + i;
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






