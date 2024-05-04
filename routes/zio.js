const express=require('express');  //이곳에서 익스프레스를 사용하기 위해서 작성해줍니다.
const http=require('http'); //http모듈을 불러와줍니다.
const https=require('https'); //api의 주소가 https이므로 https모듈도 불러와줍니다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const Zio=require('../models/zio');
const router=express.Router();  //이곳에서도 다른 라우터들과 마찬가지로 라우터 인스턴스를 생성해줍니다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.
let ziourl='https://api.vworld.kr/req/address'; //호출할 api주소입니다.
let zioParams='';

router.get('/',(req,res)=>{ //이 라우터에 루트경로로 호출시 GET 요청을 처리해줍니다.
    let type=encodeURIComponent(req.query.type||'PARCEL'); // 도로명주소로 작성할지 지번주소로 작성할지 선택합니다.
    let adr=encodeURIComponent(req.query.address||'판교'); //정보를 알고싶은 지역에 대해서 작성합니다.
    zioParams='?'+encodeURIComponent('key')+'='+process.env.ZIO; //인증키를 의미합니다.
    zioParams+= '&' + encodeURIComponent('service')+'='+encodeURIComponent('address'); //요청 서비스 명입니다.
    zioParams+= '&' + encodeURIComponent('request')+'='+encodeURIComponent('GetCoord'); //요청 서비스 오퍼레이션 입니다.
    zioParams+= '&' + encodeURIComponent('format')+'='+encodeURIComponent('json'); //반환형태를 JSON으로 반환해줍니다.
    zioParams+= '&' + encodeURIComponent('type')+'='+type; //위에서 입력받은 변수를 입력해 줍니다.
    zioParams+= '&' + encodeURIComponent('address')+'='+adr; 
    zioParams+= '&' + encodeURIComponent('crs')+'='+encodeURIComponent('epsg:4326'); //응답 결과의 좌표를 표시할때 어떤 좌표계로 표시할지를 나타냅니다.

    let zioal=ziourl+zioParams; //URL과 파라미터를 합칩니다.
    https.get(zioal,(apiRes)=>{ //HTTPS모듈로 api에 get요청을 보내비다.
        let data=''; //api호출 결과값을 받을 변수입니다.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk;
        });
        apiRes.on('end',()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            try{
                const result=JSON.parse(data); //json방식으로 변경하여 객체로 생성해줍니다.
                res.status(200).send(result);   //이후 변형된 객체를 정상작동인 200코드와 결과를 보내줍니다.
            }catch(error){
                res.status(500).send({error:'응답오류'});//그런데 만약 위 과정에서 오류가 있을시 에러메세지와 500코드를 전송해줍니다.
            }
             
        });
    });
});

router.post('/select',(req,res)=>{ //원하는 지역에 x,y좌표를 저장.
    const {type,address}=req.body;
    zioParams='?'+encodeURIComponent('key')+'='+process.env.ZIO; //인증키를 의미합니다.
    zioParams+= '&' + encodeURIComponent('request')+'='+encodeURIComponent('GetCoord'); //요청 서비스 오퍼레이션 입니다.
    zioParams+= '&' + encodeURIComponent('service')+'='+encodeURIComponent('address'); //요청 서비스 명입니다.
    zioParams+= '&' + encodeURIComponent('format')+'='+encodeURIComponent('json'); //반환형태를 JSON으로 반환해줍니다.
    zioParams+= '&' + encodeURIComponent('type')+'='+type; //위에서 입력받은 변수를 입력해 줍니다.
    zioParams+= '&' + encodeURIComponent('address')+'='+address;  
    zioParams+= '&' + encodeURIComponent('crs')+'='+encodeURIComponent('epsg:4326'); //응답 결과의 좌표를 표시할때 어떤 좌표계로 표시할지를 나타냅니다.
        //기본으로 WGS84경위도를 사용합니다.
    let urls=ziourl+zioParams;
    https.get(urls,(apiRes)=>{ //HTTPS모듈로 api에 get요청을 보내비다.
        let data=''; //api호출 결과값을 받을 변수입니다.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk;
        });
        apiRes.on('end',async()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            try{
                const result=JSON.parse(data); //json방식으로 변경하여 객체로 생성해줍니다.
                console.log(result);
                const newZio= await Zio.create({
                    x:result.response.result.point.x,
                    y:result.response.result.point.y,
                    location:result.response.refined.text,
                });
                
                console.log(newZio);
                res.status(200).send({message:"저장이 완료되었습니다.",newZio});   //이후 변형된 객체를 정상작동인 200코드와 결과를 보내줍니다.
            }
            catch(error){
                console.log(error);
                res.status(500).send({error:'응답오류'});//그런데 만약 위 과정에서 오류가 있을시 에러메세지와 500코드를 전송해줍니다.
            }
             
        });
    });
});

module.exports=router; //이 파일에서 정의한 라우터를 모듈로써 사용하기 위해서 존재합니다.다른파일에서 라우터로 사용이 가능해 집니다.