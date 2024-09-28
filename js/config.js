var mssql = require('mssql');

// параметры соединения с бд
var config = {
	server: 'LAPTOP-RPD6D51R\\SQLEXPRESS01',
    database: 'testdb',
    user: 'Maria',
    password: '12345',
    options: {
      encrypt: true,  // Использование SSL/TLS
      trustServerCertificate: true // Отключение проверки самоподписанного сертификата
    },
    port: 1433
}
// var connection = new mssql.ConnectionPool(config); 
// var pool = connection.connect(function(err) {
// 	if (err) console.log(err)
// }); 

// module.exports = pool; 


var connectionPool = new mssql.ConnectionPool(config);

// Подключаемся к базе данных с обработкой ошибок через колбэк
function connectToDatabase(callback) {
    connectionPool.connect(function(err) {
        if (err) {
            console.error('Ошибка подключения к MSSQL:', err);
            callback(err, null); // Передаем ошибку в колбэк
        } else {
            console.log('Подключение к MSSQL установлено');
            callback(null, connectionPool); // Передаем пул соединений в колбэк
        }
    });
}

module.exports = connectToDatabase;