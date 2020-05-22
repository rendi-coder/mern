const {Router} = require('express')
const bcrypt= require('bcryptjs')
const config = require('config')
const jwt=require('jsonwebtoken')
const {check,validationResult} = require('express-validator')
const User=require('../models/User')
const router=Router();

// /api/auth/register
router.post(
    `/register`,
    [
        check('email','некоректный email').isEmail(),
        check('password','Минимальная длина пароля 6 символов').isLength({min:6})
    ],
    async (req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors:errors.array(),
                message:'Нкоректные данные при регистрации'
            })
        }
        
        const {email,password} = req.body

        const candidate=await User.findOne({email})
        if(candidate){
            res.status(400).json({message:'Такой пользователь уже существует'})
            return
        }
        
        const hashedPassword=await bcrypt.hash(password,12);
        const user=new User({email,password:hashedPassword})

        await user.save();

        res.status(201).json({message:'Пользователь создан'});

    }catch(e){
        res.status(500).json({message:'Что то не так'})
    }
})

// /api/auth/login
router.post(`/login`, 
    [
        check('email','Введите коректный email').normalizeEmail().isEmail(),
        check('password','Введите пароль').exists()
    ],
    async (req,res)=>{
        try{
            const errors=validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({
                    errors:errors.array(),
                    message:'Нкоректные данные при входе в систему'
                })
            }
            
            const {email,password}=req.body

            const user=await User.findOne({email})
            if(!user){
                return res.status(400).json({message:'Пользователь не нвйден'})
            }

            const isMatch= await bcrypt.compare(password,user.password) //сравниваем захешированные пароли
            if(!isMatch){
                return res.status(400).json({message:'Неверный пароль,попробуйте снова'})
            }

            //Создание токена
            const token=jwt.sign(
                {userId:user.id},
                config.get('jwtSecret'),
                {expiresIn:'1h'}
            )
            
            res.json({token,userId:user.id})


        }catch(e){
            res.status(500).json({message:'Что то не так'})
        }
})

module.exports=router