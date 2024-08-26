const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: {
    type:String,
    default:'Гость',
  },
  title:{
    type:String,
    required:'true',
    minlength: 4,
    maxlength:1000,
  },
  date: {
    type:Date,
    default: Date.now,
  },
},{
  optimisticConcurrency:true,
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;