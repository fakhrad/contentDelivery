var mongoose = require('mongoose');
var sysfld = require('./sys');
var Status = require('./status');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
 
var request = new Schema({
    sys : {type : sysfld, required : true},
    title : {type : Object, required : true},
    description : {type : Object},
    longDesc : {type : Object},
    contentType : {type: Schema.Types.ObjectId, ref: 'ContentType' , required : true},
    category : {type: Schema.Types.ObjectId, ref: 'Category'},
    thumbnail : [Object],
    attachments : [Object],
    receiver : {type : String},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [Status],
    settings : {type : Object}
});

request.plugin(mongoosePaginate);
module.exports = mongoose.model("Request", request);