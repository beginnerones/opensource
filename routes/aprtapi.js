const express=require('express');
const http=require('http');
const xmls=require('xml2js');
const router=express.Router();
const product=[];

router.use(express.json());
let lawd_cdin='11110';
let deal_ymdin='201512';
var aparturl = 'http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTrade';  //아파트 관련 API


router.get('/',(req,res,next)=>{
    lawd_cdin=encodeURIComponent(req.query.lawd_cd || '11110');
    deal_ymdin=encodeURIComponent(req.query.deal_ymd || '201512');

    var apartParams = '?' + encodeURIComponent('serviceKey') + '='+'t%2FbZbOb8%2FvZCS3bXQhktOEZc6cfInpMtwWlmoItALr2ESQm79v7096IZ5c2FOvfI01WukrkFHldjJ3nhNK6iew%3D%3D'; /* Service Key*/
    apartParams  += '&' + encodeURIComponent('LAWD_CD') + '=' + encodeURIComponent(lawd_cdin);
    apartParams  += '&' + encodeURIComponent('DEAL_YMD') + '=' + encodeURIComponent(deal_ymdin); 

    var alurl=aparturl+apartParams;

    http.get(alurl,(apiRes)=>{
        let data='';
        apiRes.on('data',(chunk)=>{
            data+=chunk;
        });
        apiRes.on('end',()=>{
            xmls.parseString(data,{ explicitArray: false },(err,result)=>{
                if(err){
                    next(err);
                }else{
                    res.status(200).send(result);
                }
            });
        });
     }).on('error',(e)=>{
         next(e);
    });
});

router.post('/update',(req,res)=>{
    const {ApartName, location, Amont, Area, Build } =req.body;
    req.app.locals.properties.push({
        ApartName, location, Amount, Area, Build
    })
    res.status(201).send({message:"저장이 완료되었습니다.",ApartName, location, Amont, Area, Build});
});

router.get('/list',(req,res)=>{
    res.status(200).send(req.app.locals.properties);
})


module.exports=router;