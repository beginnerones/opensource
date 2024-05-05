const Sequelize = require('sequelize');

class Zio extends Sequelize.Model{  //zio 데이터베이스와 연결된 모델입니다.
    static initiate(sequelize){ //이곳도 똑같이 스키마에 대한 정의와 모델 설정을 작성하여줍니다.
        Zio.init({
            x:{ //x좌표를 담는곳으로 소수점이 길어 double로 설정하였습니ㅏ.
                type:Sequelize.DOUBLE,
                allowNull:false, //비어있으면 안되서 false로 설정하였습니다.
            },
            y:{ //이곳은 y좌표를 담습니다.
                type:Sequelize.DOUBLE,
                allowNull:false,
            },
            location:{ //이곳은 x,y좌표에 대한 지역에 대한 정보로 string으로 받습니다.
                type:Sequelize.STRING(45),
                allowNull:true,
            },
            
        },{
            sequelize,
            timestamps: false,
            underscored:false,
            modelName:'Zio',
            tableName:'zio_up',
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associations(db){}
};

module.exports=Zio;