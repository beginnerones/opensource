const {createLogger,format,transports} = require("winston");

const logger = createLogger({  //이파일은 배포시 오류로그를 확인할수 없기에 오류 로그파일을 생성하여 그곳에서 확인할수 있게하는 파일입니다.
    level:'info',
    format:format.json(),
    transports:[
        new transports.File({filename:'combined.log'}),  //log 파일을 생성합니다
        new transports.File({filename:'error.log',level:'error'}), //에러를 확인하는오류로 에러를 저장하는 수준은 'error'입니다.
    ],
});

if(process.env.NODE_ENV !== 'production') {  //만약 배포하고 있지 않으면
    logger.add(new transports.Console({format:format.simple()}));

}
module.exports=logger;