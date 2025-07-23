const mongoose=require('mongoose');
const uploadedFileSchema=mongoose.Schema(
  {
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    originalFileName:{type:String,required:true},
    uploadDate:{type:Date,default:Date.now},
    // Store parsed data directly if size is manageable, or reference another collection
    parsedData:{type:mongoose.Schema.Types.Mixed,required:true},// Array of objects
    sheetNames:{type:[String],required:true},
    columnHeaders:{type: mongoose.Schema.Types.Mixed,default:{}},
},
{timestamps:true}
);

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);
module.exports = UploadedFile;
