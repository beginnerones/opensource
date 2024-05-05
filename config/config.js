require('dotenv').config();

module.exports = {  //db에 연결하기위한 환경설정입니다.
  development: {  //개발시에 사용됩니다.
    username: "root",
    password: process.env.PW , //db설정한 비밀번호
    database: "nodejs",  //데이터베이스에 이름
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username:  "root",
    password:  process.env.PW,
    database:  "nodejs",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {  //배포시에 사용됩니다.
    username:  "root",
    password: process.env.PW,
    database:  "nodejs",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};