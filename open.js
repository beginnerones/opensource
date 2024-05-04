const express= require('express'); //Express 프레임워크를 불러온다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const http=require('http'); //HTTP 서버 기능 사용 위한 모듈
const xmls=require('xml2js'); 
const logger = require('./logger');

const app=express(); //Express 앱 생성.
const router=express.Router(); //라우터 기능으로 코드를 직관적으로 볼수있게 나눈다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

app.locals.properties = []; //임시적으로 담기위한 변수 선언.(db가 없는 관계로.)
app.locals.location=[]; //지오코딩 api 결과 x,y좌표를 담기 위해 준비하였습니다.

const apjs=require('./routes/apartapi');  //아파트 매매에 대한 정보를 가져오는 라우터
const eventjs=require('./routes/eventapi');
const search=require('./routes/serach'); //지역에 법정동코드를 검색하기 위한 라우터
const zio=require('./routes/zio');  //특정 지역을 검색하여 그 지역에 대한 x,y좌표를 구할수 있는 라우터.

app.set('port',process.env.PORT||3000);  //포트는 env에서 정한 번호이거나 없다면 3000번


app.use(express.json());  //앱의 요청 본문 해석가능하게 json 미들웨어를 사용.(body를 바로 json으로 사용하게)
//각 라우터들의 경로를 지정해줍니다.
app.use('/api/apart',apjs);
app.use('/api/event',eventjs);
app.use('/api/search',search);
app.use('/api/zio',zio);

app.get('/',(res,req)=>{
    res.status(200).send({message:"아파트 매매값 조회및 주변행사 조회 api에 오신것을 환영합니다."});
});

app.get('/favicon.ico',(res,req)=>{
    res.status(204).end();
});
    

//라우터를 검색했는데 없을시 여기서 404 에러로 처리해줍니다.
app.use((req,res,next)=>{
    const error= new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status=404;
    logger.info("hello");
    logger.error(error.message);
    next(error);
})
//모든에러를 처리해주기 위한 미들웨어로서 서버간 전달된 에러를 처리해줍니다.
app.use((err,req,res,next)=>{
    console.error(err); //콘솔에 에러 문구 띄어줌
    res.status(500).send({ //500에러로 아래는 에러메세지와 상태를 json형태로 전달.
        message:err.message ||'서버 오류',
        status: err.status ||500
    });
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번에서 대기중.');
});