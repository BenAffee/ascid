$(document).ready(function(){
    //после того как всё загрузилось заменяем миллисекунды на даты
    //делаю на нативном JavaScript в надежде побыстрее преобразовывать даты, нежели это было-бы на jQuery

    var dates = document.getElementsByClassName('front_date');
    for (var i=0; i<dates.length; i++){
        //получаем дату ISO из миллискунд, которые мы получили
        var new_front_date_iso = new Date(Number(dates[i].innerText));

        //получаем номер дня в месяце, если это одна цифра то добавляем вперёд "0" "для красоты"
        //если день состоит из одной цифры, то оставляем его в покое
        var new_day = new_front_date_iso.getDate();
        if (new_day < 10) new_day = '0' + new_day;

        //тоже самое, что и для дня,  делаем и для месяца
        var new_month = new_front_date_iso.getMonth()+1;
        if (new_month < 10) new_month = '0' + new_month;

        // формируем строку формата "ДД.ММ.ГГГГ г."
        var new_date = new_day + '.' + new_month + '.' + new_front_date_iso.getFullYear() + ' г.';

        //заменяем строку с датой в таблице
        dates[i].innerText=new_date;
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