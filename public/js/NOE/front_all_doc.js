$(document).ready(function(){
    //после того как всё загрузилось заменяем миллисекунды на даты
    //делаю на нативном JavaScript в надежде побыстрее преобразовывать даты, нежели это было-бы на jQuery
    var dates = document.getElementsByClassName('front_date');
    console.log(dates);
    //dates.forEach((v,i,a) => {v = new Date(v)})
    for (var i=0; i<dates.length; i++){
        var millis = dates[i].innerText;
        console.log(millis);
        var new_front_date = new Date(millis);
        console.log(new_front_date);
        //dates[i].innerText=new Date(millis);
    }


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
			
			//в ответе приходит список документов без удалённого документа
			$('#main_content').html(msg);
		})
		
		.fail(function() {
			alert('Что-то пошло не так... Обратитесь к администратору');
		});
	
	//console.log(username);
	}); 	
});