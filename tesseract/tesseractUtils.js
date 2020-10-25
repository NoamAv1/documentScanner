const { createWorker } = require('tesseract.js');
const path = require('path');

module.exports = async (file_path) => {
    const worker = createWorker({
        cachePath: path.join('/tmp'),
    });
    let file = '';
    return new Promise(async (resolve, reject) => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(file_path);

        file = text;
        await worker.terminate();
        resolve(file);
    })
}