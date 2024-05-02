const express=require('express');  //open.js같이 
const http=require('http');
const https=require('https');
const xmls=require('xml2js');
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const router=express.Router();
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.
let ziourl='https://api.vworld.kr/req/address';

router.get('/',(req,res)=>{
    let type=encodeURIComponent(req.query.type||'PARCEL');
    let adr=encodeURIComponent(req.query.address||'판교');
    let zioParams='?'+encodeURIComponent('key')+'='+process.env.ZIO;
    zioParams+= '&' + encodeURIComponent('service')+'='+encodeURIComponent('address');
    zioParams+= '&' + encodeURIComponent('request')+'='+encodeURIComponent('GetCoord');
    zioParams+= '&' + encodeURIComponent('format')+'='+encodeURIComponent('json');
    zioParams+= '&' + encodeURIComponent('type')+'='+type;
    zioParams+= '&' + encodeURIComponent('address')+'='+adr;
    zioParams+= '&' + encodeURIComponent('crs')+'='+encodeURIComponent('epsg:4326');

    let zioal=ziourl+zioParams;
    https.get(zioal,(apiRes)=>{
        let data='';
        apiRes.on('data',(chunk)=>{
            data+=chunk;
        });
        apiRes.on('end',()=>{
            try{
                const result=JSON.parse(data);
                // res.locals.number={sido_cd:result.StanReginCd[1].row[0].sido_cd,sgg_cd:result.StanReginCd[1].row[0].sgg_cd}; //여기 수정.
                // console.log(res.locals.number);
                res.status(200).send(result);  
            }catch(error){
                res.status(500).send({error:'응답오류'});
            }
             
        });
    });
});
module.exports=router;
