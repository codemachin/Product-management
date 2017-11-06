var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({

  lotNo   : {type:String,default:"",required:true},
  created : {type:Date,default:Date.now}

});

mongoose.model('Lot',userSchema);