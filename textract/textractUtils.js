const lodash = require("lodash");
const aws = require("aws-sdk");

/**
* This module is doing the AWS Textract and
* Retuns the value is the scan results.
* @param params = the image as a buffer
*/

// updating the aws config
aws.config.update({
    accessKeyId: '<AWS access key>',
    secretAccessKey: '<AWS secret access key>',
    region: '<AWS region>'
});

const textract = new aws.Textract();

const getText = (result, blocksMap) => {
    let text = "";

    // checks if we have a relationship in the result
    if (lodash.has(result, "Relationships")) {
        result.Relationships.forEach(relationship => {
            // for each CHILD we take the WORD and add it to the text.
            if (relationship.Type === "CHILD") {
                relationship.Ids.forEach(childId => {
                    const word = blocksMap[childId];
                    if (word.BlockType === "WORD") {
                        text += `${word.Text} `;
                    }
                    // if the the BlockType is a selection element (buttons)
                    if (word.BlockType === "SELECTION_ELEMENT") {
                        if (word.SelectionStatus === "SELECTED") {
                            text += `Selected `;
                        }
                    }
                });
            }
        });
    }

    return text.trim();
};

// finds the VALUE block for the key
const findValueBlock = (keyBlock, valueMap) => {
    let valueBlock;
    keyBlock.Relationships.forEach(relationship => {
        if (relationship.Type === "VALUE") {
            relationship.Ids.every(valueId => {
                if (lodash.has(valueMap, valueId)) {
                    valueBlock = valueMap[valueId];
                    return false;
                }
            });
        }
    });

    return valueBlock;
};

// getting the key and values blocks
const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
    const keyValues = {};

    const keyMapValues = lodash.values(keyMap);

    keyMapValues.forEach(keyMapValue => {
        const valueBlock = findValueBlock(keyMapValue, valueMap);
        const key = getText(keyMapValue, blockMap);
        const value = getText(valueBlock, blockMap);
        keyValues[key] = value;
    });

    return keyValues;
};

// finds all the key and value for the blocks
const getKeyValueMap = blocks => {
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};

    let blockId;
    blocks.forEach(block => {
        blockId = block.Id;
        blockMap[blockId] = block;

        if (block.BlockType === "KEY_VALUE_SET") {
            if (lodash.includes(block.EntityTypes, "KEY")) {
                keyMap[blockId] = block;
            } else {
                valueMap[blockId] = block;
            }
        }
    });

    return { keyMap, valueMap, blockMap };
};

module.exports = async (buffer) => {
    const params = {
        Document: {
            /* required */
            Bytes: buffer
        },
        FeatureTypes: ["TABLES", "FORMS"]
    };

    const request = textract.analyzeDocument(params);
    const data = await request.promise();

    if (data && data.Blocks) {
        const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
        const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);

        return keyValues;
    }

    // in case no blocks are found return {}
    return {};
};
