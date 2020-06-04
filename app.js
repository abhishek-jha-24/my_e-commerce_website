var express = require('express');
const path = require('path');
const crypto = require('crypto');

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const morgan = require('morgan');

const bodyparser = require('body-parser');

const mongoose = require('mongoose');
const methodOverride = require('method-override');

mongoose
  .connect(
    'mongodb+srv://dbAbhishekjha:' + process.env.MONGO_ATLAS_PW + '@abhishek-ow5k3.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});


app.use(cors());
app.use(cookieParser());


app.use(expressLayouts);

app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'))

app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

const productroutes = require('./api/routes/products');
const ordersroutes = require('./api/routes/orders');

const userroutes = require('./api/routes/user');
const extraroutes = require('./api/routes/c')

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use((req, res, next) => {


	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers", 
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
		);

	if (req.method === 'OPTIONS'){
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET' );
		return res.status(200).json({});
	}
	next();

});

app.use('/', extraroutes);

app.use('/products', productroutes);
app.use('/orders', ordersroutes);

app.use('/user', userroutes);


app.use((req, res, next) => {
	const error = new Error('not found');
	error.status = 404;
	next(error);

});


app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	});


});

module.exports = app;