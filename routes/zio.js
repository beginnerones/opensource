const express=require('express');  //이곳에서 익스프레스를 사용하기 위해서 작성해줍니다.
const http=require('http'); //http모듈을 불러와줍니다.
const https=require('https'); //api의 주소가 https이므로 https모듈도 불러와줍니다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const Zio=require('../models/zio');
const router=express.Router();  //이곳에서도 다른 라우터들과 마찬가지로 라우터 인스턴스를 생성해줍니다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.
let ziourl='https://api.vworld.kr/req/address'; //호출할 api주소입니다.
let zioParams='';

//이 곳은 주소를 입력시 해당 장소에 x,y좌표를 조회하여 줍니다.
router.get('/',(req,res,next)=>{ //이 라우터에 루트경로로 호출시 GET 요청을 처리해줍니다.
    let type=req.query.type; // 도로명주소로 작성할지 지번주소로 작성할지 선택합니다.
    if(type=='지번명'){ //지번명으로 입력시
        type=encodeURIComponent('PARCEL');
    }else if(type =='도로명'){ //도로명으로 입력시
        type=encodeURIComponent('ROAD');
    }else{ //기본값
        type=encodeURIComponent('PARCEL');
    }
    let adr=encodeURIComponent(req.query.address); //정보를 알고싶은 지역에 대해서 작성합니다.
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
    }).on('error',(err)=>{ //만약 http자체 불러오는데 오류가 존재시 에러처리 미들웨어로 보냅니다.
        next(err);
    });
});
//이 곳은 주소와 해당주소가 도로명인지,지번명인지를 작성시 그 장소에 x,y좌표를 저장하여 줍니다.
router.post('/select',(req,res,next)=>{ //원하는 지역에 x,y좌표를 저장.
    let {type,address}=req.body; //body부분을 각각 type,address에 저장하여 줍니다.
    if(type=='지번명'){  //지번명으로 입력시
        type=encodeURIComponent('PARCEL');
    }else if(type =='도로명'){ //도로명으로 입력시
        type=encodeURIComponent('ROAD');
    }else{  //기본값 입니다.
        type=encodeURIComponent('PARCEL');
    }
    zioParams='?'+encodeURIComponent('key')+'='+process.env.ZIO; //인증키를 의미합니다.
    zioParams+= '&' + encodeURIComponent('request')+'='+encodeURIComponent('GetCoord'); //요청 서비스 오퍼레이션 입니다.
    zioParams+= '&' + encodeURIComponent('service')+'='+encodeURIComponent('address'); //요청 서비스 명입니다.
    zioParams+= '&' + encodeURIComponent('format')+'='+encodeURIComponent('json'); //반환형태를 JSON으로 반환해줍니다.
    zioParams+= '&' + encodeURIComponent('type')+'='+type; //위에서 입력받은 변수를 입력해 줍니다.
    zioParams+= '&' + encodeURIComponent('address')+'='+address;  
    zioParams+= '&' + encodeURIComponent('crs')+'='+encodeURIComponent('epsg:4326'); //응답 결과의 좌표를 표시할때 어떤 좌표계로 표시할지를 나타냅니다.
        //기본으로 WGS84경위도를 사용합니다.
    let urls=ziourl+zioParams;  //api호출을 위해서 주소를 합쳐줍니다.
    https.get(urls,(apiRes)=>{ //HTTPS모듈로 api에 get요청을 보내비다.
        let data=''; //api호출 결과값을 받을 변수입니다.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk; 
        });
        apiRes.on('end',async()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            try{
                const result=JSON.parse(data); //json방식으로 변경하여 객체로 생성해줍니다.
                console.log(result);
                const newZio= await Zio.create({ //데이터베이스에 해당 api에 부분적인 결과를 저장합니다.
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
    }).on('error',(err)=>{ //만약 http자체 불러오는데 오류시 에러처리 미들웨어에서 처리합니다.
        next(err);
    });
});

router.get('/list',async(req,res,next)=>{ //이곳은 바로위에 post로 입력한 정보들을 조회할수 있게 해주는 부분입니다.
    const Zioall=await Zio.findAll({}); //zio db에 저장된 데이터를 불러옵니다.
    if(!Zioall) return res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."}); //만약 ziall이 비어있을시 데이터가 존재하지 않다고 알림
    res.status(200).send(Zioall); //저장된 지역에 x,y,지역이름을 응답해줍니다.
});

router.delete('/delete/:id',async(req,res,next)=>{  //db에서 삭제될 데이터를 라우터 매개변수를 통하여 호출합니다.
    try{
        const deletelist=await Zio.destroy({  //해당 삭제할 db를 id 매개변수로 접근합니다.
            where:{id:req.params.id},
        });
        if(!deletelist) res.status(404).send({message:"삭제할 데이터가 존재하지 않습니다."}); //만약 데이터가 존재하지 않을시 이렇게 반환합니다.
        res.status(202).send({message:"삭제 성공"}); //삭제 성공시 202코드와 메세지를 호출해 줍니다
    }catch(err){ //오류가 있을시 에러 처리 미들웨어가 처리해 줍니다.
        next(err);
    }
    
});

module.exports=router; //이 파일에서 정의한 라우터를 모듈로써 사용하기 위해서 존재합니다.다른파일에서 라우터로 사용이 가능해 집니다.