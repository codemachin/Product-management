var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({

  SKU : {type:String,default:"",required:true,index:true,unique:true},
  imageName : {type:String,default:"",required:true},
  mainCategory : {type:String,default:"",required:true},
  color : {type:String,default:"",required:true},
  lotNo : {type:String,default:"",required:true},
  created : {type:Date,default:Date.now}

});

mongoose.model('Product',userSchema);