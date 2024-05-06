
const express=require('express'); 
const http=require('http'); //http 요청 보내기 위한 모듈입니다.
const xmls=require('xml2js'); //xml파일을 json으로 변형하기 위한 모듈입니다.
const request = require('request');
const Apart=require('../models/apart');  //아파트와 관련된 db로 이곳에 주로 사용하기에 호출합니다.
const router=express.Router(); //현재 이곳은 라우터로 따로 분류하였기에 express에 라우터를 이용합니다.
const parser=xmls.Parser({trim:true,explicitArray:false});  //xml로 변경시 기본설정으로 띄어쓰기는 없애고,배열로 나열시 하나의 값만 존재시 대괄호를 없애는 설정으로 하였습니다.

router.use(express.json()); //JSON형태로 요청의 BODY를 파싱하기 위해 express의 미들웨어를 사용합니다.
let lawd_cdin=''; //각각 지역번호와 계약 연월을 받기위해서 존재합니다.
let deal_ymdin='';
//호출할 api의 url입니다.
const aparturl = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade';  //아파트 관련 API

//아파트에 대한 정보로 법정동코드,계약년도월을 작성해 매매 정보를 조회하여 줍니다.

router.get('/',(req,res,next)=>{ //기본 경로로 호출시 get 요청을 수행합니다.
    lawd_cdin=encodeURIComponent(req.query.lawd_cd);  //법정동코드를 입력하는 부분입니다.(ex.11110 앞에5글자만 입력하면 됩니다.)
    deal_ymdin=encodeURIComponent(req.query.deal_ymd); //그 해당 건물에 계약년도와 월을 입력합니다. (ex.201512)
    simple=encodeURIComponent(req.query.simple ||'0') //해당 정보를 간단하게 볼지 아닌지를 입력합니다. (1||0)

    let apartParams = '?' + encodeURIComponent('serviceKey') + '='+process.env.KEY;  //인증키 부분입니다.
    apartParams  += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cdin); //위에 값들을 api호출을 위해 매개변수에 넣어줍니다.
    apartParams  += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymdin); 

    const alurl=aparturl+apartParams; //URL과 매개변수들을 합쳐줍니다.

    request.get(alurl,(err,apiRes,body)=>{ //해당 api를 호출합니다.
        if(err){
           return next(err); //만약 가져오는데 오류가 있을시 에러처리 미들웨어로 이동합니다.
        }
        parser.parseString(body, (err, result) => {//해당 파일은 xml파일로 api를 반환하여서 왔기때문에 json으로 반환하여 줍니다.
            if (err) {
                return next(err);
            }
            if(simple=='0'){
                res.status(200).send(result); //200상태로 제대로 변환이 되어 클라이언트에게 해당 정보를 전달합니다.
            }else if(simple == '1'){ //간단하게 보여주기 위해 중요한 것들만 작성하여 줍니다.
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

//post로 본인이 원하는 아파트 정보를 입력하면 그 정보를 저장하여 줍니다.
router.post('/select',async(req,res,next)=>{ //라우터 경로에서 /update로 접근시 post요청을 수행합니다.
    const {ApartName, location, Amount, Area, Build } =req.body; //사용자가 요청 본문에 입력한 아파트이름,지역,매매가격,평수,건설년도를 입력받습니다.
    try{
        const newApart= await Apart.create({ //이 아파트db에 작성이 완료전까지 대기합니다.
            apart_name:ApartName,  //(ex.신한 아파트) //아파트이름을 의미합ㄴ디ㅏ.
            buildyear:Build,    //(ex.201512) //건설년도,월을 의미합니다.
            amount:Amount,        //(ex.200000) //매매가격입니다.
            location:location,    //(ex.서울시 도봉구) //지역을 의미합니다.
            area:Area ,        //(ex.46.23512~)평수를 의미합니다.
        });
        res.status(201).send({message:"저장이 완료되었습니다.",newApart}); //
    //작성됨을 알리는 201코드와 메시지들과 변수들을 전송해줍니다.
    }catch(err){
        next(err);
    }
});

//본인이 저장한 정보를 조회합니다.
router.get('/list',async(req,res)=>{ //이곳은 바로위에 post로 입력한 정보들을 조회할수 있게 해주는 부분입니다.
    const Apartall=await Apart.findAll({}); //아파트db에 모든 자료를 가져옵니다.
    if(!Apartall) return res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."});
    res.status(200).send(Apartall); //저장된 부동산 정보전체를 응답해줍니다.
});

router.delete('/delete/:id',async(req,res,next)=>{ //db에서삭제할 부분이 있다면 db에 열중 id열을 주소에 작성하여 삭제해줍니다.
    try{
        const deletelist=await Apart.destroy({
            where:{id:req.params.id}, //id에서 url주소에 id와 일치하는것을 호출합니다.
        });
        if(!deletelist) return res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."}); //삭제할 데이터가 없을시 호출해줍니다.
        res.status(202).send({message:"삭제 성공",deletelist}); //삭제 성공시 deletelist와 함께 반환해 줍니다.
    }catch(err){
        next(err);
    }
    
});


module.exports=router; // 설정한 라우터를 모듈로 내보냅니다.
