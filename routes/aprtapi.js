//작성은 했으나... 오류가 나옵니다...
const express=require('express'); 
const http=require('http'); //http 요청 보내기 위한 모듈입니다.
const xmls=require('xml2js'); //xml파일을 json으로 변형하기 위한 모듈입니다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const router=express.Router();
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

router.use(express.json()); //JSON형태로 요청의 BODY를 파싱하기 위해 express의 미들웨어를 사용합니다.
let lawd_cdin=''; //각각 지역번호와 계약 연월을 받기위해서 존재합니다.
let deal_ymdin='';
//호출할 api의 url입니다.
var aparturl = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade';  //아파트 관련 API


router.get('/',(req,res,next)=>{ //기본 경로로 호출시 get 요청을 수행합니다.
    lawd_cdin=encodeURIComponent(req.query.lawd_cd || '11110');  //쿼리스트링으로 입력한 매개변수를 변수에 저장합니다.
    deal_ymdin=encodeURIComponent(req.query.deal_ymd || '201512');

    var apartParams = '?' + encodeURIComponent('serviceKey') + '='+process.env.KEY;  //인증키 부분입니다.
    apartParams  += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cdin); //매개변수에 넣어줍니다.
    apartParams  += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymdin); 

    var alurl=aparturl+apartParams; //URL과 매개변수들을 합쳐줍니다.

    http.get(alurl,(apiRes)=>{ //API에 대한 GET요청을 보내줍니다.
        let data=''; //api응답으로 받아오는 정보를 수집하기 위해 존재.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk;
        });
        apiRes.on('end',()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            //data+='>';
            xmls.parseString(data,{ explicitArray: false },(err,result)=>{ //그러나 이곳에서 API호출 결과로 XML이 오기에 JSON형태로 변환해줍니다.
                if(err){ //만약 에러가 있을시에는 에러 처리 미들웨어로 이동합니다.
                    next(err);
                }else{// 그러나 에러가 없다면 정상코드와 결과를 반환해줍니다.
                    res.status(200).send(result);
                }
            });
        });
     }).on('error',(e)=>{ //http get에서 일어나는 오류를 잡습니다.
         next(e);
    });
});

router.post('/update',(req,res)=>{ //라우터 경로에서 /update로 접근시 post요청을 수행합니다.
    const {ApartName, location, Amont, Area, Build } =req.body; //사용자가 요청 본문에 입력한 아파트이름,지역,매매가격,평수,건설년도를 입력받습니다.
    req.app.locals.properties.push({ //정보를 저장하여 사용하기 위해서 properties라는 변수에 정보들을 추가해줍니다.
        ApartName, location, Amount, Area, Build
    })
    res.status(201).send({message:"저장이 완료되었습니다.",ApartName, location, Amont, Area, Build}); //
}); //작성됨을 알리는 201코드와 메시지들과 변수들을 전송해줍니다.

router.get('/list',(req,res)=>{ //이곳은 바로위에 post로 입력한 정보들을 조회할수 있게 해주는 부분입니다.
    res.status(200).send(req.app.locals.properties); //저장된 부동산 정보전체를 응답해줍니다.
})


module.exports=router; // 설정한 라우터를 모듈로 내보냅니다.