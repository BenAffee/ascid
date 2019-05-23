const redis	 = require('redis');
const redisClient = redis.createClient();

// отлавливаем ошибки
redisClient.on("error", function (err) {
	console.log("Ошибки redis: " + err);
});

// Попробуем записать и прочитать
/*redisClient.set('myKey', 'Hello Redis', function (err, repl) {
	if (err) {
		// Оо что то случилось при записи
		console.log('Что то случилось при записи: ' + err);
		redisClient.quit();
	} else {
		// Прочтем записанное
		redisClient.get('myKey', function (err, repl) {
				//Закрываем соединение, так как нам оно больше не нужно
				redisClient.quit();
				if (err) {
						console.log('Что то случилось при чтении: ' + err);
				} else if (repl) {
				// Ключ найден
						   console.log('Ключ: ' + repl);
			} else {
				// Ключ ненайден
				console.log('Ключ ненайден.')

		};
		});
	};
});*/

//пробуем записать

redisClient.get('colUsers', function (err, repl) {
	//Закрываем соединение, так как нам оно больше не нужно
	//redisClient.quit();
	if (err) {
		console.log('Что то случилось при чтении: ' + err);
	} 
	else {
		if (repl) {
		// Ключ найден
		console.log('Ключ: ' + repl);
		} 
		else {
			// Ключ ненайден
			console.log('Ключ ненайден. Записываем')
			redisClient.set('colUsers', 'ffffffff', function (err, repl) {
				if (err) {
					// Оо что то случилось при записи
					console.log('Что то случилось при записи: ' + err);
					redisClient.quit();
				}
				else{
					console.log('Записалось!: ' + repl);
				}
			
			})
		}
	}
})