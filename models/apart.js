const Sequelize = require('sequelize');

class Apart extends Sequelize.Model{
    static initiate(sequelize){
        Apart.init({ //생성자로서 첫번째 인수로는 스키마를 정의합니다.
            apart_name:{
                type:Sequelize.STRING(45),
                allowNull:false,
            },
            buildyear:{
                type:Sequelize.INTEGER,
                allowNull:true,
            },
            amount:{
                type:Sequelize.INTEGER,
                allowNull:true,
            },
            location:{
                type:Sequelize.STRING(45),
                allowNull:true,
            },
            area:{
                type:Sequelize.FLOAT,
                allowNull:true,
            },

            
        },{ //두번째 인수로서 이 모델에 대한 설정사항들을 담아둡니다.
            sequelize,
            timestamps: false,
            underscored:false,
            modelName:'Apart',
            tableName:'apart_up',
            charset:'utf8', //한글을 사용시 이해할수 있게 utf8로 변경합니다.
            collate:'utf8_general_ci',
        });
    }
    static associations(db){} //외래키가 있을시 설정하지만,지금은 설정하지 않아서 넘어갑니다.
};

module.exports=Apart;