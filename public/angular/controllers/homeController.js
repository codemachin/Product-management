myApp.controller('homeController',['$scope','$http','Upload','productService',"toastr",function($scope,$http,Upload,productService,toastr) {

    var main = this;

    this.sku = "";
    
    /////////////////////////////////// function to reverse the array ///////////////////////////////////////

    this.sort = function(){ 

      main.items.reverse();
        
    }

    this.totalDisplayed = 21;

    /////////////////////// function to load only 20 items to dom at a time and loading more when button clicked/////////////////////
    /////////////////////// precautionary measure for situation when there are thousands of products /////////////////////////////////

    this.loadMore = function () {
      main.totalDisplayed += 21;  
    };
    

    this.allProducts = function(){
      
        ////////////////////////////////////// get all product details ////////////////////////////////////////

        productService.getAllProduct()
        .then(function successCallback(response) {

          if(response.data.status==200){

               main.items = response.data.data;

               //////////////////////// loop to convert color object which is a string to an object in proper format/////////////////////

               for(let x in main.items){
                  let coloro = main.items[x].color.replace('"{',"'{")
                  coloro = coloro.replace('}"',"}'").replace(/“/g,'"').replace(/”/g,'"')
                  var a = JSON.parse(coloro);
                  main.items[x]['color']=a;
                  
               }


               main.items.reverse();

            }else{
                toastr.error(response.data.msg)
            }
               
                            

            }, function errorCallback(response) {
              
                toastr.error("some error occurred. Check the console.");
                console.log(response);
            });
      
    }

    ////////////////////////////////////////////// get all the products just as the page is loaded //////////////////////////////////////

    this.allProducts();



    this.submit = function(name,id){ //function to call on form submit
          if (main.upload_form.file.$valid && main.file) { //check if from is valid
              main.upload(main.file,name,id); //call upload function
          }
      }
      
    this.upload = function (file,name,id) {

        Upload.upload({
            url: './api/v1/product/upload/'+name, //webAPI exposed to upload the file
            data:{
                file:file
              } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            if(resp.data.error_code === 0){ //validate success
                toastr.success('Success ' + resp.config.data.file.name + ' uploaded.');
                main.editProduct(id);
            } else {
                toastr.error('an error occured');
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            toastr.error('Error status: ' + resp.status);
        }, function (evt) { 
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            main.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };// function to uploaded a file less than 20 MB
    

    //////////////////////////////// checking if file attached to form during edit or form is without file //////////////////////////////

    this.run = function(id,name){

      /////////////////////////////////////// if form is in invalid state give warning //////////////////////////////////////////
      if (main.upload_form.file.$invalid){
        return toastr.error("please check that file is in jpg format or not. Only .jpg format will be accepted..")
      }
      if(main.file && main.imageName && main.sku){
        main.submit(name,id)
      }else{
        main.editProduct(id);
      }
    }

    ////////////////////////////////////////////////////// function to get all lots ///////////////////////////////////////////////

    this.allLots = function(){
      
        productService.getAllLot()
        .then(function successCallback(response) {
              
            if(response.data.status==200){
              main.lots = response.data.data;
            }else{
              toastr.error(response.data.msg)
            }
               
                            

            }, function errorCallback(response) {
              
                toastr.error("some error occurred. Check the console.");
                console.log(response);
            });
      
    }

    ////////////////////////////////////////////// get all lot just when the page has loaded ////////////////////////////////////////

    this.allLots();

    //////////////////////////// function to set models pointing to the same product in the array while edit called  ////////////////

    this.edit = function(item){

      main.index = main.items.indexOf(item);
      main.sku = main.items[main.index].SKU;
      main.imageName = main.items[main.index].imageName;
      main.color = main.items[main.index].color.name;
      main.mainCategory = main.items[main.index].mainCategory;
      main.id  =  main.items[main.index]._id;

      
    }

    //////////////////////////////////////////////////// function to adit the product //////////////////////////////////////////////

    this.editProduct = function(id){

      if(!main.sku || !main.imageName || !main.color || !main.mainCategory){
        return toastr.warning("All fields are required. You cannot leave any field empty.")
      }

      //////////////////////////////////// again converting the color object to the string it was before /////////////////////////////

      main.items[main.index].color.name = main.color;
      var colora = JSON.stringify(main.items[main.index].color);
      colora = colora.replace(/"/g,'”').replace('{”','{“');
      colora = colora.replace('}','}');


      var data= {
        SKU : main.sku,
        imageName : main.imageName,
        color : colora,
        mainCategory : main.mainCategory
      }

      productService.editProduct(id,data)
      .then(function successCallback(response) {

            if(response.data.status==200){

                main.items[main.index] = response.data.data;
                let coloro = main.items[main.index].color.replace('"{',"'{")
                coloro = coloro.replace('}"',"}'").replace(/“/g,'"').replace(/”/g,'"')
                var a = JSON.parse(coloro);
                main.items[main.index]['color']=a;

                toastr.success("product edited successfully")
                main.file = null;
                main.progress = "";

                //////////////////////////// dismiss the modal after product successfully edited and message is displayed   ////////////////

                setTimeout(function(){
                    $scope.dismiss();
                },700);


            }else{

                toastr.error(response.data.msg)
            }
            
            

          }, function errorCallback(response) {
            
              toastr.error("some error occurred. Check the console.");
              console.log(response);

          });
    }

    ////////////////////////////////////////////////// function to delete a product //////////////////////////////////////////////

    this.delete = function(id,item){

      productService.deleteProduct(id)
      .then(function successCallback(response) {

        if(response.data.status==200){
            
            toastr.success("Product successfully deleted") 
            let ind = main.items.indexOf(item)   
            main.items.splice(ind,1)  

        }  else{
            toastr.error(response.data.msg)
        }       

            
            

          }, function errorCallback(response) {
            
              toastr.error("some error occurred. Check the console.");
              console.log(response);

          });
    }


}]); // end controller