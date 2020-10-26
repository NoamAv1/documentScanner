// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: process.env.REGION });

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const activateOCR = (url, key, MessageGroupId) => {
    const promise = new Promise((resolve, reject) => {
        const params = {
            QueueUrl: process.env.SQS_URL,
            MessageAttributes: {
                "Title": {
                    DataType: "String",
                    StringValue: "OCR start"
                }
            },

            MessageBody: url,
            MessageDeduplicationId: key,  // Required for FIFO queues
            MessageGroupId: MessageGroupId  // Required for FIFO queues
        };
        sqs.sendMessage(params, function (err, data) {
            if (err || !data) {
                reject ("Error", err);
            } else {
                resolve ("Success", data.MessageId);
            }
        });
    })
    return promise;
}

var url = '<URL Here>'
var id = '<the name of the file>';
activateOCR(url, id, '1').then(console.log).catch(console.log);