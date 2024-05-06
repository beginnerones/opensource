
const express=require('express'); 
const http=require('http'); //http 요청 보내기 위한 모듈입니다.
const xmls=require('xml2js'); //xml파일을 json으로 변형하기 위한 모듈입니다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const router=express.Router();
const Zio=require('../models/zio'); //zio db에 연결된 x,y좌표를 사용하기 위해 호출합니다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

router.use(express.json()); //JSON형태로 요청의 BODY를 파싱하기 위해 express의 미들웨어를 사용합니다.
let lawd_cdin=''; //각각 지역번호와 계약 연월을 받기위해서 존재합니다.
let deal_ymdin='';
//호출할 api의 url입니다.
const evurl = 'http://apis.data.go.kr/B551011/KorService1/locationBasedList1';  //아파트 관련 API

//기본경로로 들어갈시 이전에 저장했던 zio테이블에 저장된 내용을 기준으로 그 지역에 행사를 조회하여 줍니다.
router.get('/',async(req,res,next)=>{ //기본 경로로 호출시 get 요청을 수행합니다.
    smart=req.query.MobileOS||'ETC'; //핸드폰에 os를 입력하여 줍니다,기본적인 값을 작성하였습니다.(IOS,AND.WIN,ETC).
    selindex=parseInt(req.query.selindex,10);  //이곳은 ZIO 데이터베이스에 ID 인덱스 번호를 입력하여 여기에 저장된 X,Y좌표 주변에 행사를 조회합니다.1부터 시작합니다.
    radius=req.query.radius||'1000'; //해당 좌표 주변으로부터 몇m로 조회할지 설정합니다.기본값이 존재합니다.
    console.log(selindex);
    const zioList=await Zio.findOne({  //데이터베이스에서 정보를 불러옵니다.
        attributes:['x','y'],
        where:{
            id:selindex, //SELindex와 같은 값입니다.
        },
    });
    

    if(!zioList){ //만약 ziolist가 비어있을시 반환해 줍니다.
        console.log(req.app.locals.location);
        return res.status(400).send({error:'잘못된 인덱스'});
    }
    const x=zioList.dataValues.x; //해당하는 x,y좌표를 api를 호출하기 위해 작성해 줍니다.
    const y=zioList.dataValues.y;
    let querys='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY;  //API호출을 위하여 필요한 매개변수들을 작성합니다.
    querys+='&' + encodeURIComponent('MobileOS')+'='+encodeURIComponent(smart);
    querys+='&' + encodeURIComponent('MobileApp')+'='+encodeURIComponent('openapi'); //제가 만드는 서비스 이름을 작성합니다
    querys+='&' + encodeURIComponent('_type')+'='+encodeURIComponent('json'); //JSON형태로 반환해 줍니다
    querys+='&' + encodeURIComponent('mapX')+'='+encodeURIComponent(x); //X,Y좌표입니다
    querys+='&' + encodeURIComponent('mapY')+'='+encodeURIComponent(y);
    querys+='&' + encodeURIComponent('radius')+'='+encodeURIComponent(radius); //거리입니다.

    const eventurl=evurl+querys; //URL을 호출하기 위해 합쳐줍니다.

    http.get(eventurl,(apiRes)=>{ //http에 get요청을 보내어 처리합니다.
        let data=''; //api응답으로 받아오는 정보를 수집하기 위해 존재.
        apiRes.on('data',(chunk)=>{
            data+=chunk; //이곳에서 데이터들을 수집하여 줍니다.
        });
        apiRes.on('end',()=>{
            try{ //데이터를 받아오는게 끝나면 실행
                const result=JSON.parse(data); //받아온 데이터를 js객체로 반환.
                res.status(200).send(result);  //정상호출 되었음을 알리는 200번대 번호와 js결과를 반환해줍니다(자동 json으로 변환됩니다). 
            }catch(error){ //만약 위에서 오류가 있었다면
                res.status(500).send({error:'응답오류'}); //여기서 500과 함께 응답오류를 보냅니다.
            }
             
        });
    })

});


module.exports=router; // 설정한 라우터를 모듈로 내보냅니다.
