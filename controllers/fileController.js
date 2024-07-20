const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const { sendJsonResponse } = require('../utils/response');

const renderHomePage = async (req, res) => {
    try {
        const files = await fs.readdir(config.filesDir);
        const deletedFiles = await fs.readdir(config.deletedFilesDir);
        res.render('index', { files, deletedFiles, error: null });
    } catch (err) {
        res.render('index', { files: [], deletedFiles: [], error: 'Could not list files or deleted files' });
    }
};

const getFile = async (req, res) => {
    const filePath = path.join(config.filesDir, req.params.filename);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        sendJsonResponse(res, 200, { content: data });
    } catch (err) {
        if (err.code === 'ENOENT') {
            sendJsonResponse(res, 404, { message: 'File not found' });
        } else {
            sendJsonResponse(res, 500, { message: 'Server error' });
        }
    }
};

const createFile = async (req, res) => {
    const filePath = path.join(config.filesDir, `${req.body.filename}.${req.body.filetype}`);
    const content = req.body.content;
    try {
        await fs.writeFile(filePath, content);
        res.redirect('/');
    } catch (err) {
        res.redirect('/?error=Could not create file');
    }
};

const deleteFile = async (req, res) => {
    const filePath = path.join(config.filesDir, req.params.filename);
    const deletedFilePath = path.join(config.deletedFilesDir, req.params.filename);
    try {
        await fs.rename(filePath, deletedFilePath);
        res.redirect('/');
    } catch (err) {
        res.redirect('/?error=Could not delete file');
    }
};

const restoreFile = async (req, res) => {
    const deletedFilePath = path.join(config.deletedFilesDir, req.params.filename);
    const filePath = path.join(config.filesDir, req.params.filename);
    try {
        await fs.rename(deletedFilePath, filePath);
        res.redirect('/');
    } catch (err) {
        res.redirect('/?error=Could not restore file');
    }
};

const permanentDeleteFile = async (req, res) => {
    const deletedFilePath = path.join(config.deletedFilesDir, req.params.filename);
    try {
        await fs.unlink(deletedFilePath);
        res.redirect('/');
    } catch (err) {
        res.redirect('/?error=Could not permanently delete file');
    }
};

module.exports = {
    renderHomePage,
    getFile,
    createFile,
    deleteFile,
    restoreFile,
    permanentDeleteFile
};
