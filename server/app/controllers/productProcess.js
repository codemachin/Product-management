var mongoose = require('mongoose');
var express = require('express');
var fs = require('fs');
var resolve = require('path').resolve;
var fs = require('fs');
var mkdirp = require('mkdirp');

// custom router
var productRouter  = express.Router();

// multer module for file upload
var multer = require('multer');

// models
var productModel = mongoose.model('Product');
var lotModel = mongoose.model('Lot');

// module to decompress files with .zip format
var extract = require('extract-zip')

// module to decompress files with .tar.gz format
var targz = require('targz');

// module to read xlsx data to be converted to JSON
var XLSX = require('xlsx');

// module to find extensions in complex file names
var replaceExt = require('replace-ext');

// library function to store product data and lot details to database
var store = require('./../../libs/store');





module.exports.controllerFunction = function(app) {

   
    //////////////////////////////////////////// multers disk storage settings //////////////////////////////////////

    var storage = multer.diskStorage({ 
        destination: function (req, file, cb) {
            var dest = './uploads/';
            mkdirp.sync(dest);
            cb(null, dest);
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            var nameFile = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]
            cb(null, nameFile);
        }
    });

    ///////////////////////////////////////////////// multer settings //////////////////////////////////////////////

    var upload = multer({ 
                    storage: storage
                }).single('file');

    /////////////////////////////////////// API path that will upload the files /////////////////////////////////////

    productRouter.post('/upload',function(req, res) {

          
        upload(req,res,function(err){

            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }

            //////////////////////////////////// Extracting the initial zip file //////////////////////////////////////

            extract('./uploads/'+req.file.filename, { dir: resolve('./output') }, function (err) {
               // handle err
               if(err){
                  console.log(err);
               }else{
                var fl = './output/'+req.file.originalname.replace('.zip',"")+"/image.tar.gz";
                // if file exists in storage
                if (fs.existsSync(fl)) {

                        ///////////////////////////// Extracting the image.tar.gz file ////////////////////////////////////

                        targz.decompress({src: fl, dest: resolve('./public/img/product') }, function (err) {
                          if(err){
                              console.log(err);
                           }else{

                                /////////////////////////// converting all files to same extension (jpg or jpeg etc..)//////////////////////////

                                fs.readdirSync('./public/img/product').forEach(function(file){

                                      var path = './public/img/product/'+file;
                                      var newPath = replaceExt(path, '.jpg');
                                      fs.renameSync(path,newPath,function(err){
                                        if(err){
                                          console.log(err)
                                        }
                                      })
                                       

                                });// end for each



                              if (fs.existsSync('./output/'+req.file.originalname.replace('.zip',"")+'/Mapping.xlsx')){

                                  ///////////////////////////// Reading from the excel file and converting to JSON //////////////////////////////

                                  var workbook = XLSX.readFile('./output/'+req.file.originalname.replace('.zip',"")+'/Mapping.xlsx');
                                  var sheet_name_list = workbook.SheetNames;
                                  var finalJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

                                  ///////////////////// Storing the Json Array to database using library function 'store' /////////////////////

                                  store.productStore(finalJson)
                                    .then(cat => {
                                      if(cat===false){
                                        res.json({error_code:0,err_desc:null,data:req.file.filename});
                                      }else{
                                        res.json({error_code:1,err_desc:"Please check your files, one or more files are duplicate"});
                                      }
                                    })
                                    .catch(err => {
                                      if(err){
                                        console.log(err);
                                      }
                                    })

                              }else{
                                  res.json({error_code:1,err_desc:"Excel data file not found"});
                              }
                           }
                         })
                 }else{
                    res.json({error_code:1,err_desc:"Image Zip file not found"});
                 }
               }
               
            })
             
        });

    });


///////////////////////////////// multer file upload for image edit functionality /////////////////////////////////


    var storage1 = multer.diskStorage({ 
        destination: function (req, file, cb) {
            cb(null, './public/img/product/');
        },
        filename: function (req, file, cb) {


            var nameFile = req.params.name + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]
            cb(null, nameFile);
        }
    });

    ///////////////////////////////////////////////// multer settings //////////////////////////////////////////////

    var upload1 = multer({ 
                    storage: storage1
                }).single('file');

    /////////////////////////////////////// API path that will upload the image /////////////////////////////////////

    productRouter.post('/upload/:name',function(req, res) {
          
        upload1(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
             res.json({error_code:0,err_desc:null,data:req.file.filename});
        });
    });




          
    //////////////////////////////////////////// api to get all product details //////////////////////////////////////

    productRouter.get('/all', function(req, res){
      
      productModel.find({},function(err,allProducts){
          if(err){                
                
                res.json({status:404,msg:err,data:null})
            }
            else{

                res.json({status:200,msg:"",data:allProducts})

            }
      })

    });


    /////////////////////////////////////////// Api to get all the lot details //////////////////////////////////////


    productRouter.get('/allLot', function(req, res){
      
      lotModel.find({},function(err,allLots){
          if(err){                
                
                res.json({status:404,msg:err,data:null})
            
            }
            else{

                res.json({status:200,msg:"",data:allLots})

            }
      })

    });


    //////////////////////////////////////////// Api to edit product details //////////////////////////////////////////

   productRouter.put('/:id/edit',function(req,res) {

      var update = req.body;

      productModel.findOneAndUpdate({'_id':req.params.id},update,{new:true,runSettersOnQuery : true,runValidators: true, context: 'query'},function(err,result){

          if(err){
              
              res.json({status:404,msg:err,data:null})
          }
          else{
              
              res.json({status:200,msg:"",data:result})
          }


      }); 

  });


   ////////////////////////////////////// Api to delete a certain product from database //////////////////////////////////

    productRouter.post('/:id/delete',function(req,res) {

        productModel.remove({'_id':req.params.id},function(err,result){

          if(err){
            res.json({status:404,msg:err,data:null})
            

          }
          else{
           
            res.json({status:200,msg:"",data:result})
          }


        });

    });


    ////////////////////////////////////////// setting the router middleware //////////////////////////////////////////

    app.use('/api/v1/product', productRouter);

}