const {Schema,model,Types}=require('mongoose')

//Связка моделей пользователей и определенных записей в БД

const schema=new Schema({
   from:{type:String, required:true}, // откуда идет ссылка
   to:{type:String, required:true, unique:true}, //Куда введет ссылка
   code:{type:String, required:true, unique:true}, //
   date:{type:Date, default:Date.now}, //Дата когда создана ссылка
   clicks:{type:Number,default:0}, // количество кликов по ссылке
   owner:{type:Types.ObjectId,ref:'User'} //связка ссылки с пользователем который ее создал
})

module.exports=model('Link',schema)