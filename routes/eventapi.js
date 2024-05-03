
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
var evurl = 'http://apis.data.go.kr/B551011/KorService1/locationBasedList1';  //아파트 관련 API


router.get('/',(req,res,next)=>{ //기본 경로로 호출시 get 요청을 수행합니다.
    smart=req.query.MobileOS;
    selindex=parseInt(req.query.selindex,10);
    radius=req.query.radius||'1000';
    console.log(selindex);

    const select=req.app.locals.location[selindex];
    if(!select){
        console.log(req.app.locals.location);
        return res.status(400).send({error:'잘못된 인덱스'});
    }
    let querys='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY;
    querys+='&' + encodeURIComponent('MobileOS')+'='+encodeURIComponent(smart);
    querys+='&' + encodeURIComponent('MobileApp')+'='+encodeURIComponent('openapi');
    querys+='&' + encodeURIComponent('_type')+'='+encodeURIComponent('json');
    querys+='&' + encodeURIComponent('mapX')+'='+encodeURIComponent(select.x);
    querys+='&' + encodeURIComponent('mapY')+'='+encodeURIComponent(select.y);
    querys+='&' + encodeURIComponent('radius')+'='+encodeURIComponent(radius);

    const eventurl=evurl+querys;

    http.get(eventurl,(apiRes)=>{ //http에 get요청을 보내어 처리합니다.
        let data=''; //api응답으로 받아오는 정보를 수집하기 위해 존재.
        apiRes.on('data',(chunk)=>{
            data+=chunk; //이곳에서 데이터들을 수집하여 줍니다.
        });
        apiRes.on('end',()=>{
            try{ //데이터를 받아오는게 끝나면 실행
                const result=JSON.parse(data); //받아온 데이터를 json객체로 반환.
                res.status(200).send(result);  //정상호출 되었음을 알리는 200번대 번호와 json결과를 반환해줍니다. 
            }catch(error){ //만약 위에서 오류가 있었다면
                res.status(500).send({error:'응답오류'}); //여기서 500과 함께 응답오류를 보냅니다.
            }
             
        });
    });
});


module.exports=router; // 설정한 라우터를 모듈로 내보냅니다.