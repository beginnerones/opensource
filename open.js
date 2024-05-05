const express= require('express'); //Express 프레임워크를 불러온다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const http=require('http'); //HTTP 서버 기능 사용 위한 모듈
const xmls=require('xml2js'); 
const logger = require('./logger');
const {sequelize} = require('./models');
const Apart=require('./models/apart');
const Zio=require('./models/zio');

const app=express(); //Express 앱 생성.
const router=express.Router(); //라우터 기능으로 코드를 직관적으로 볼수있게 나눈다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

sequelize.sync({force:false})  //데이터베이스를 연결시키는부로 force는 서버 재시작마다 db초기화 할것인지 묻는 옵션.
    .then(()=>{
        console.log('데이터베이스 연결 성공'); //제대로 연결시 나옵니다.
    })
    .catch((err)=>{
        console.error(err);  //에러시 호출이 됩니다.
    });

const apjs=require('./routes/apartapi');  //아파트 매매에 대한 정보를 가져오는 라우터
const eventjs=require('./routes/eventapi'); //x,y 좌표를 이용하여 주변에 행사를 조회하는 라우터
const search=require('./routes/serach'); //지역에 법정동코드를 검색하기 위한 라우터
const zio=require('./routes/zio');  //특정 지역을 검색하여 그 지역에 대한 x,y좌표를 구할수 있는 라우터.

app.set('port',process.env.PORT||3000);  //포트는 env에서 정한 번호이거나 없다면 3000번


app.use(express.json());  //앱의 요청 본문 해석가능하게 json 미들웨어를 사용.(body를 바로 json으로 사용하게)
//각 라우터들의 경로를 지정해줍니다.
app.use('/api/apart',apjs);
app.use('/api/event',eventjs);
app.use('/api/search',search);
app.use('/api/zio',zio);

app.get('/',(req,res)=>{ //기본적인 루트경로로 들어가면 아래와 같은 메시지를 보여줍니다.
    res.status(200).send({message:"아파트 매매값 조회및 주변행사 조회 api에 오신것을 환영합니다."});
});

app.get('/favicon.ico',(req,res)=>{  //기본 파비콘 아이콘이 존재하지않아 아래와같이 응답을 하게 하였습니다.
    res.status(204).end();
});
    

//라우터를 검색했는데 없을시 여기서 404 에러로 처리해줍니다.
app.use((req,res,next)=>{
    const error= new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status=404;
    logger.info("hello");
    logger.error(error.message);
    next(error); //error변수를 아래 에러처리 미들웨어에 err로 보내줍니다.
})
//모든에러를 처리해주기 위한 미들웨어로서 서버간 전달된 에러를 처리해줍니다.
app.use((err,req,res,next)=>{
    console.error(err); //콘솔에 에러 문구 띄어줌
    res.status(500).send({ //500에러로 아래는 에러메세지와 상태를 json형태로 전달.
        message:err.message ||'서버 오류',
        status: err.status ||500
    });
});

app.listen(app.get('port'),()=>{  //port번호로 서버를 구동시킵니다.
    console.log(app.get('port'),'번에서 대기중.');
});