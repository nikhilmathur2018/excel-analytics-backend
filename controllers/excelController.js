const xlsx = require('xlsx'); // Import the xlsx library for Excel file parsing
const UploadedFile = require('../models/UploadedFile'); // Import the Mongoose model for uploaded files
const fs = require('fs'); // Node.js file system module for handling temporary files
const asyncHandler = require('express-async-handler'); // For simplifying error handling in async functions

// Define functions as const variables
// This ensures they are properly scoped and can be exported as part of module.exports
const uploadExcel = asyncHandler(async (req, res) => {
    // 1. Check if a file was uploaded
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        // 2. Read the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetNames = workbook.SheetNames;

        const allSheetsData = {};
        const columnHeaders = {};

        // 3. Iterate through each sheet and parse data
        sheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(sheet);
            allSheetsData[sheetName] = jsonData;

            if (jsonData.length > 0) {
                columnHeaders[sheetName] = Object.keys(jsonData[0]);
            }
        });

        // 4. Clean up the temporary file
        fs.unlinkSync(req.file.path);

        // 5. Save the parsed data to MongoDB
        const newUpload = await UploadedFile.create({
            user: req.user._id, // User ID from protect middleware
            originalFileName: req.file.originalname,
            parsedData: allSheetsData,
            sheetNames: sheetNames,
            columnHeaders: columnHeaders,
            // uploadDate: new Date() // If your schema has `timestamps: true`, this is automatically added
        });

        // 6. Send success response
        res.status(201).json({ message: 'File uploaded and processed successfully', file: newUpload });

    } catch (error) {
        // Ensure the temporary file is deleted even if an error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        // Throw error for asyncHandler to catch and pass to error middleware
        throw new Error(`Error processing file: ${error.message}`);
    }
});

// Function to get upload history for the authenticated user
const getUploadHistory = asyncHandler(async (req, res) => {
    try {
        const history = await UploadedFile.find({ user: req.user._id })
            .select('originalFileName uploadDate sheetNames')
            .sort({ uploadDate: -1 }); // Sort by newest first

        res.json(history);
    } catch (error) {
        // asyncHandler will handle this error
        throw new Error(`Failed to fetch upload history: ${error.message}`);
    }
});

// Function to get parsed data for a specific uploaded file (used for charting)
const getParsedData = asyncHandler(async (req, res) => {
    try {
        const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user._id });
        if (!file) {
            res.status(404);
            throw new Error('File not found or unauthorized');
        }
        res.json({
            originalFileName: file.originalFileName,
            parsedData: file.parsedData,
            sheetNames: file.sheetNames,
            columnHeaders: file.columnHeaders,
        });
    } catch (error) {
        // asyncHandler will handle this error
        throw new Error(`Error fetching parsed data: ${error.message}`);
    }
});

// Function to delete an uploaded file
const deleteUploadedFile = asyncHandler(async (req, res) => {
    const fileId = req.params.id;

    const file = await UploadedFile.findById(fileId);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this file');
    }

    await file.deleteOne();

    res.status(200).json({ message: 'File deleted successfully', id: fileId });
});

// NEW: Function to delete a specific sheet from an uploaded file
const deleteSheetFromFile = asyncHandler(async (req, res) => {
    const { fileId, sheetName } = req.params;

    const file = await UploadedFile.findById(fileId);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    if (file.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to modify this file');
    }

    if (!file.sheetNames.includes(sheetName)) {
        res.status(404);
        throw new Error(`Sheet "${sheetName}" not found in this file.`);
    }

    const newParsedData = { ...file.parsedData };
    delete newParsedData[sheetName];

    const newSheetNames = file.sheetNames.filter(name => name !== sheetName);

    const newColumnHeaders = { ...file.columnHeaders };
    delete newColumnHeaders[sheetName];

    // If no sheets remain, delete the entire file document
    if (newSheetNames.length === 0) {
        await file.deleteOne();
        return res.status(200).json({ message: `Last sheet "${sheetName}" deleted. File ${file.originalFileName} removed.` });
    }

    file.parsedData = newParsedData;
    file.sheetNames = newSheetNames;
    file.columnHeaders = newColumnHeaders;
    await file.save();

    res.status(200).json({ message: `Sheet "${sheetName}" deleted successfully from ${file.originalFileName}.`, file });
});

// IMPORTANT: Export all functions that are used as route handlers
// This single module.exports object correctly exposes all the const-defined functions.
module.exports = {
    uploadExcel,
    getUploadHistory,
    getParsedData,
    deleteUploadedFile,
    deleteSheetFromFile // Ensure this is present and spelled correctly
};
