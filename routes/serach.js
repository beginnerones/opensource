const express=require('express');
const http=require('http');
const xmls=require('xml2js');
const router=express.Router();

let pageinr='';
let perpagein='';

let regin='http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList';


router.get('/',(req,res)=>{
    pageinr=encodeURIComponent(req.query.locatadd_nm || '서울특별시');

    let reParms='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY;
    reParms+= '&' + encodeURIComponent('locatadd_nm')+'='+pageinr;
    reParms+= '&' + encodeURIComponent('type')+'='+encodeURIComponent('json');
    reParms+= '&' + encodeURIComponent('PageNo')+'='+encodeURIComponent('1');
    reParms+= '&' + encodeURIComponent('numOfRows')+'='+encodeURIComponent('10');
    
    const bual=regin+reParms;

    http.get(bual,(apiRes)=>{
        let data='';
        apiRes.on('data',(chunk)=>{
            data+=chunk;
        });
        apiRes.on('end',()=>{
            try{
                const result=JSON.parse(data);
                res.locals.number={sido_cd:result.StanReginCd[1].row[0].sido_cd,sgg_cd:result.StanReginCd[1].row[0].sgg_cd}; //여기 수정.
                console.log(res.locals.number);
                res.status(200).send(result);  
            }catch(error){
                res.status(500).send({error:'응답오류'});
            }
             
        });
    });
});

module.exports=router;