myApp.controller('queryCreateController',['$http','Upload',"toastr",function($http,Upload,toastr) {

    var main = this;

    
    ////////////////////////////////////////////////// function to call on form submit /////////////////////////////////////////////////

    this.submit = function(){ 

          if (main.upload_form.file.$valid && main.file) { //check if from is valid
              main.upload(main.file); //call upload function
          }else if(main.upload_form.file.$pristine){  // check if form is empty
            toastr.error("No file has been attached")
          }else{
            toastr.error("Seems like the file is not in zip format...or maybe the size of the file is greater than 1 GB.")
          }
      }
      

    /////////////////////////////////////////// function to upload the file //////////////////////////////////////////////

    this.upload = function (file) {

        Upload.upload({
            url: './api/v1/product/upload', //webAPI exposed to upload the file
            data:{
                file:file
              } //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise

            if(resp.data.error_code === 0){ //validate success
                
                toastr.success('Success ' + resp.config.data.file.name + ' uploaded.');
                window.location = "#/";
            } else {
                toastr.error(resp.data.err_desc);
            }
        }, function (resp) { //catch error
            console.log('Error status: ' + resp.status);
            toastr.error('Error status: ' + resp.status);
        }, function (evt) { 

            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            main.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };// function to uploaded a file less than 1 GB
    





}]); // end controller