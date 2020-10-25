const AWS = require('aws-sdk')

const s3 = new AWS.S3({ 
    signatureVersion: 'v4',
    region: '<AWS region>'
})

const bucketName = '<Bucket name>';
const signedUrlExpireSeconds = 300;

const generateSignedUrl = async (key) => {
    const myKey = key + '.json'

    const url = s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: myKey,
        Expires: signedUrlExpireSeconds
    })

    return url;
}

console.log(generateSignedUrl())