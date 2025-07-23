// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads/');
    },
    filename: function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});

const fileFilter=(req,file,cb)=>{
    console.log('--- File Filter Debug Info ---');
    console.log('File Original Name:', file.originalname);
    console.log('File MIME Type (received by server):', file.mimetype);
    console.log('File Extension (extracted by server):', path.extname(file.originalname).toLowerCase());
    console.log('------------------------------');

    // Corrected logic for allowed types
    const allowedExtensions = /xls|xlsx/; // Regex for file extensions
    const allowedMimeTypes = /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-excel/; // Regex for common Excel MIME types

    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype); // Now testing against the correct MIME type regex

    console.log('Result of Extname check:', extname);
    console.log('Result of Mimetype check:', mimetype); // This should now be true for .xlsx

    if(extname && mimetype){
        return cb(null,true);
    }else{
        cb('Error: Excel files only!');
    }
};

const upload=multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize:5*1024*1024},//5MB limit
});

module.exports=upload;