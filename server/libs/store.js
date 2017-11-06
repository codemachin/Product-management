var mongoose = require('mongoose');
var productModel = mongoose.model('Product');
var lotModel = mongoose.model('Lot');
var shortid = require("shortid");

//////////////////////////// function returns promise that checks if images all saved or duplicated or errors //////////////////////////

exports.productStore = function productStore(json){

      return new Promise((resolve, reject) => {

          ///////////////////////////////////// generate unique lot ids/////////////////////////////////

          var lotNo = shortid.generate();
          var catcerr=false;

          ///////////////////////////saving the lot and then saving all the product details to database //////////////////////////////

          var newLot = new lotModel({
              lotNo : lotNo
            })
          newLot.save(function(err){
            if(err){
              console.log(err)
            }else{
              for(let x in json){
                var newProduct = new productModel({
                        
                        SKU           : json[x].SKU,
                        imageName     : json[x].imageName,
                        mainCategory  : json[x].mainCategory,
                        color         : json[x].color,
                        lotNo         : lotNo

                    });// end new Product 

                newProduct.save(function(err){
                     if(err){

                            console.log("check is file is already in database");
                            catcerr= true;
                            return resolve(catcerr)
                           
                        }
                        else{
                      
                                console.log("done")
                                return resolve(catcerr);


                        }

                })
              }
              
            }
          })

      
      })
      
    }