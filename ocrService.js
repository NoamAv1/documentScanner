const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const fetch = require('node-fetch');
const download = require('download');
const s3Uploader = require('./s3/aws_s3_uploader.js');
const textractScan = require('./textract/textractUtils.js');
const tesseractScan = require('./tesseract/tesseractUtils.js');

module.exports = async function ({ local_file, external_file, attachment_id }) {
    let file_path;
    if (local_file !== undefined && (typeof local_file !== 'object' || !local_file)) {
        file_path = local_file;
    }
    else if (external_file !== undefined && (typeof external_file !== 'object' || !external_file)) {

        const response = await fetch(external_file);
        const extn = '.' + (await FileType.fromStream(response.body)).ext;

        const dir = path.join('/tmp');
        file_path = path.join('/tmp', 'image' + extn);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(file_path, await download(external_file));
    }
    else {
        return ('Invalid input in the scan func');
    }

    const data = fs.readFileSync(file_path);
    let textract;
    let tesseract;
    [textract, tesseract] = await Promise.all([
        textractScan(data),
        tesseractScan(file_path),
    ])

    const obj = {
        Textract: textract,
        Tesseract: tesseract,
    };

    await s3Uploader(obj, attachment_id)

    return "OCR done and sent SQS";
}