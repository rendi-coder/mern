const {Router} = require('express')
const config = require('config')
const shortid = require('shortid')
const Link = require('../models/Link')
const auth=require('../middleware/Auth.middleware')
const router = Router()

//генерация ссылки
router.post('/generate',auth, async(req,res)=>{
    try{
       const baseUrl=config.get('baseUrl')
       const {from}=req.body
        
       const code = shortid.generate()

       const existing = await Link.findOne({from})

       if(existing){
           return res.json({link:existing})
       }
       
       const to = baseUrl + '/t/' + code

       const link = new Link({
           code,to,from,owner:req.user.userId
       })

       await link.save()

       res.status(201).json({link})

    }catch(e){
        res.status(500).json({message:'Что то не так'})
    }
})

//get all links
router.get('/',auth,async (request,response)=>{
    try{
       const links=await Link.find({owner:request.user.userId})
       response.json(links)
    }catch(e){
        response.status(500).json({message:'Что то не так'})
    }
})

//get link by id
router.get('/:id',auth,async (request,response)=>{
    try{
        const links=await Link.findById(request.params.id)
        response.json(links)
    }catch(e){
        response.status(500).json({message:'Что то не так'})
    }
})

module.exports=router