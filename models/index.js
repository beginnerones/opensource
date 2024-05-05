const Sequelize = require('sequelize');  //시퀄라이즈를 통해서 mysql과 연결해줍니다.
const Apart=require('./apart.js'); //mysql에 apart db와 연결한 파일을 불러줍니다.
const Zio=require('./zio'); //mysql에 zio db와 연결한 파일을 불러줍니다.

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env]; //db에 기본설정 파일인 config.js를 연결하여 줍니다.
const db = {}; //db들을 담을 변수입니다.

const sequelize = new Sequelize(config.database, config.username, config.password, config);  //시퀄라이즈에 객체를 생성하여 기본적인 데이터드을 저장하여 줍니다.
db.sequelize = sequelize;
db.Apart=Apart;  //db변수에 db들을 추가하여줍니다.
db.Zio=Zio;

Apart.initiate(sequelize);  //각 db들에 초기설정을 해줍니다(스키마 설정)
Zio.initiate(sequelize);

// Apart.associations(db);
// Zio.associations(db);
module.exports = db;
