const config = require("./config");
const SinaCloud = require('scs-sdk');

var targetDir = process.argv[2];

//初始化 SinaCloud
var scConfig = new SinaCloud.Config({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    sslEnabled: false
});

//全局生效:
SinaCloud.config = scConfig;
var mybucket = new SinaCloud.S3({ params: { Bucket: config.bucket } });

mybucket.listObjects({ Prefix: targetDir }, function(err, data) {
    if (err) {
        console.log(err, err.stack); // an error occurred
        return;
    }
    let list = data.Contents;
    for (let i = 0; i < list.length; i++) {
        let fileStat = list[i];
        mybucket.deleteObject({ Key: fileStat.Key }, function(err, data) {
            if (err) {
                console.log("Error delete ", err); // an error occurred
            } else {
                console.log('Successfully deleted ', fileStat.Key); // successful response
            }
        })
    }
});