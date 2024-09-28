var express  = require('express'); 
var app = express();

var path = require('path');
var mssql = require('mssql');
var connectToDatabase = require('./js/config');
var bodyParser = require('body-parser'); 

var port = 8080; 

// подключение модулей для обработки запросов 
var displayHandler = require('./js/displayhandler'); 
var insertHandler = require('./js/inserthandler'); 
var editHandler = require('./js/edithandler'); 

// установка генератора шаблонов 
app.set('views', __dirname + '/pages'); 
app.set('view engine', 'ejs');

// подгрузка статических файлов из папки pages 
app.use(express.static(path.join(__dirname, 'pages')));

// middleware для обработки данных в формате JSON 
var jsonParser = bodyParser.json();
var textParser = bodyParser.text(); 

app.use(jsonParser); 
app.use(textParser); 


app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'html', 'sign-in.html'));
});



app.get('/submit-sign-in', (req, res) => {
    const login = req.query.login;
    const password = req.query.password;

    connectToDatabase(function(err, pool) {
        if (err) {
            console.error('Ошибка подключения к базе данных:', err);
            res.status(500).send('Произошла ошибка при подключении к базе данных');
            return;
        }

        const request = pool.request();
        request.input('login', mssql.VarChar, login);
        request.input('password', mssql.VarChar, password);

        request.query('SELECT * FROM Admin WHERE login=@login AND password=@password', function(err, result) {
            if (err) {
                console.error('Ошибка выполнения запроса:', err);
                res.status(500).send('Произошла ошибка при получении данных');
                return;
            }

            if (result.recordset.length === 1) {
                
                    if (err) {
                        console.error('Ошибка повторного подключения к базе данных:', err);
                        res.status(500).send('Произошла ошибка при повторном подключении к базе данных');
                        return;
                    }
					res.cookie('login', login, { maxAge: 10000 });
                    res.redirect('/index');

            } else {
                res.redirect('/');
            }
        });
    });
});




// загрузить таблицу с элементами 
app.get('/index', displayHandler.displayItems);

// загрузка страницы для создания нового элемента 
app.get('/add', insertHandler.loadAddPage); 
// добавить новый элемент 
app.post('/add/newItem', insertHandler.addRow); 

// отобразить элементы в режиме редактирования 
app.get('/edit', displayHandler.displayItems); 

// загрузка страницы для редактирования элементов 
app.get('/edit/:id', editHandler.loadEditPage);

// редактирование элемента в бд 
app.put('/edit/:id', editHandler.changeItem);

// удаление элемента из бд 
app.delete('/edit/:id', editHandler.removeItem); 

// обработка ошибок 
app.use(function(err, req, res, next) {
	if (err) console.log(err.stack); 

	res.status(500).send('oops...something went wrong'); 
}); 

app.listen(port, function() { 

	console.log('app listening on port ' + port); 

});  
