
const express=require('express'); 
const http=require('http'); //http 요청 보내기 위한 모듈입니다.
const xmls=require('xml2js'); //xml파일을 json으로 변형하기 위한 모듈입니다.
const request = require('request');
const Apart=require('../models/apart');
const router=express.Router();
const parser=xmls.Parser({trim:true,explicitArray:false});

router.use(express.json()); //JSON형태로 요청의 BODY를 파싱하기 위해 express의 미들웨어를 사용합니다.
let lawd_cdin=''; //각각 지역번호와 계약 연월을 받기위해서 존재합니다.
let deal_ymdin='';
//호출할 api의 url입니다.
const aparturl = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade';  //아파트 관련 API


router.get('/',(req,res,next)=>{ //기본 경로로 호출시 get 요청을 수행합니다.
    lawd_cdin=encodeURIComponent(req.query.lawd_cd || '11110');  //쿼리스트링으로 입력한 매개변수를 변수에 저장합니다.
    deal_ymdin=encodeURIComponent(req.query.deal_ymd || '201512');
    simple=encodeURIComponent(req.query.simple ||'0')

    let apartParams = '?' + encodeURIComponent('serviceKey') + '='+process.env.KEY;  //인증키 부분입니다.
    apartParams  += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cdin); //매개변수에 넣어줍니다.
    apartParams  += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymdin); 

    const alurl=aparturl+apartParams; //URL과 매개변수들을 합쳐줍니다.

    request.get(alurl,(err,apiRes,body)=>{
        if(err){
           return next(err);
        }
        parser.parseString(body, (err, result) => {
            if (err) {
                return next(err);
            }
            if(simple=='0'){
                res.status(200).send(result);
            }else if(simple == '1'){
                const items=result.response.body.items.item;
                const simpleitem=items.map((item)=>{
                    return{
                        거래금액:item.거래금액.trim(),
                        건축년도:item.건축년도,
                        아파트이름:item.아파트,
                        법정동:item.법정동.trim(),
                        전용면적:item.전용면적,
                        층:item.층
                    };
                });
                res.status(200).send(simpleitem);
            }
            
        }); 

    });
});

router.post('/select',async(req,res,next)=>{ //라우터 경로에서 /update로 접근시 post요청을 수행합니다.
    const {ApartName, location, Amount, Area, Build } =req.body; //사용자가 요청 본문에 입력한 아파트이름,지역,매매가격,평수,건설년도를 입력받습니다.
    try{
        const newApart= await Apart.create({
            apart_name:ApartName,
            buildyear:Build,
            amount:Amount,
            location:location,
            area:Area ,
        });
        res.status(201).send({message:"저장이 완료되었습니다.",newApart}); //
    //작성됨을 알리는 201코드와 메시지들과 변수들을 전송해줍니다.
    }catch(err){
        next(err);
    }
});

router.get('/list',async(req,res)=>{ //이곳은 바로위에 post로 입력한 정보들을 조회할수 있게 해주는 부분입니다.
    const Apartall=await Apart.findAll({});
    if(!Apartall) return res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."});
    res.status(200).send(Apartall); //저장된 부동산 정보전체를 응답해줍니다.
});

router.delete('/delete/:id',async(req,res,next)=>{
    try{
        const deletelist=await Apart.destroy({
            where:{id:req.params.id},
        });
        if(!deletelist) res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."});
        res.status(202).send({message:"삭제 성공",deletelist});
    }catch(err){
        next(err);
    }
    
});


module.exports=router; // 설정한 라우터를 모듈로 내보냅니다.