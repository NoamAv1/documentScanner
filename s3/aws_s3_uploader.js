const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY_ID,
    secretAccessKey: process.env.SECRETACCESS_KEY
});

module.exports = (data, attachment_id) => {
    const promise = new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: attachment_id + '.json',
            ContentType: 'application/json',
            Body: JSON.stringify(data, null, 2)
        };
    
        s3.upload(params, function (err, data) {
            if (err){
                reject(err);
            }
            else{
                resolve('done');
            }
        });
    })
    return promise;
}