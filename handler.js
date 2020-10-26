'use strict';
const scanner = require('./ocrService.js');

module.exports.scan = async (event) => {
  let message;
  for (var i = 0; i < event.Records.length; i++) {
    const { body, attributes } = event.Records[i];
    const { MessageDeduplicationId } = attributes

    message = await scanner({ external_file: body, attachment_id: MessageDeduplicationId })
  };

  return {message};
};
