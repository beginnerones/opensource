const express=require('express');
const http=require('http'); //api호출을 위해서 사용합니다.

const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const router=express.Router(); //익스프레스에서 라우터 인스턴스를 생성합니다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

let pageinr=''; //지역을 검색할때 사용하려는 변수입니다.

let regin='http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList';

//지역을 입력하여 모르는 법정동 코드를 조회하여 줍니다.
router.get('/',(req,res)=>{
    pageinr=encodeURIComponent(req.query.locatadd_nm || '서울특별시'); //여기서 지역을 검새하여 줍니다.(ex. 부산,의정부,양양 등)

    let reParms='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY; //인증키를 전송.
    reParms+= '&' + encodeURIComponent('locatadd_nm')+'='+pageinr; //이곳에서 처리.
    reParms+= '&' + encodeURIComponent('type')+'='+encodeURIComponent('json'); //반환데이터를 json으로 받아온다.
    reParms+= '&' + encodeURIComponent('PageNo')+'='+encodeURIComponent('1'); //페이지 넘버를 의미.
    reParms+= '&' + encodeURIComponent('numOfRows')+'='+encodeURIComponent('10'); //한번에 불러올 데이터 행수.
    
    const bual=regin+reParms; //url을 합쳐서 실행한다.

    http.get(bual,(apiRes)=>{ //http에 get요청을 보내어 처리합니다.
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
    }).on('error',(err)=>{
        next(err);
    });
});



module.exports=router; //이 파일에서 정의한 라우터를 모듈로써 사용하기 위해서 존재합니다.다른파일에서 라우터로 사용이 가능해 집니다.
