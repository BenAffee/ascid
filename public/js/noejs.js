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
//Отправка формы добавления документа с помощью плагина jqueryForm
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    var options_form_submit = { 
        target:        '#add_doc_message',   // target element(s) to be updated with server response 
        beforeSubmit:  showRequest,  // pre-submit callback 
        success:       showResponse  // post-submit callback 
 
        // other available options: 
        //url:       url         // override for form's 'action' attribute 
        //type:      type        // 'get' or 'post', override for form's 'method' attribute 
        //dataType:  null        // 'xml', 'script', or 'json' (expected server response type) 
        //clearForm: true        // clear all form fields after successful submit 
        //resetForm: true        // reset the form after successful submit 
 
        // $.ajax options can be used here too, for example: 
        //timeout:   3000 
    }; 	
    // bind to the form's submit event 
	$(document).on('submit','#uploadForm', function(){
    //$('#uploadForm').submit(function() { 
        // inside event callbacks 'this' is the DOM element so we first 
        // wrap it in a jQuery object and then invoke ajaxSubmit 
        $(this).ajaxSubmit(options_form_submit); 
 
        // !!! Important !!! 
        // always return false to prevent standard browser submit and page navigation 
        return false; 
    }); 	
	
	
	
	
	
	
	
	
	
	
	
	//$('#uploadForm').ajaxForm(options_form_submit); 
	
function showRequest(formData, jqForm, options) { 
    // formData is an array; here we use $.param to convert it to a string to display it 
    // but the form plugin does this for you automatically when it submits the data 
    var queryString = $.param(formData); 
 
    // jqForm is a jQuery object encapsulating the form element.  To access the 
    // DOM element for the form do this: 
    // var formElement = jqForm[0]; 
 
    alert('About to submit: \n\n' + queryString); 
 
    // here we could return false to prevent the form from being submitted; 
    // returning anything other than false will allow the form submit to continue 
    return true; 
} 
	
function showResponse(responseText, statusText, xhr, $form)  { 
    // for normal html responses, the first argument to the success callback 
    // is the XMLHttpRequest object's responseText property 
 
    // if the ajaxForm method was passed an Options Object with the dataType 
    // property set to 'xml' then the first argument to the success callback 
    // is the XMLHttpRequest object's responseXML property 
 
    // if the ajaxForm method was passed an Options Object with the dataType 
    // property set to 'json' then the first argument to the success callback 
    // is the json data object returned by the server 
 
    alert('status: ' + statusText + '\n\nresponseText: \n' + responseText + 
        '\n\nThe output div should have already been updated with the responseText.'); 
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






