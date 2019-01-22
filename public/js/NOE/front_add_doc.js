$(document).ready(function(){
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Проверка даты в поле дата
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    /*$(document).on('input','#date_doc', function(){
		
		var str = $('#date_doc').val();
		var pattern = /^(?:(?:31(\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
		if(str.match(pattern)) $('#date_doc').css('color', 'green');
		
		else $('#date_doc').css('color', 'red');

    });*/
	
    $(document).on('input','.date_input', function(){
		
		var str = $(this).val();
		var pattern = /^(?:(?:31(\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
		if(str.match(pattern)) $(this).css('color', 'green');
		
		else $(this).css('color', 'red');

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