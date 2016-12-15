const fs = require("fs");
const path = require("path");
const config = require("./config");
const SinaCloud = require('scs-sdk');

function writeFile(filePath, data) {
    //若路径不存在，递归创建目录并创建文件。
    mkdirs(path.dirname(filePath), function() {
        fs.writeFile(filePath, data, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Successfully download ", filePath);
        })
    })

}

//递归创建目录 异步方法
function mkdirs(dirname, callback) {
    fs.exists(dirname, function(exists) {
        if (exists) {
            callback();
        } else {
            console.log("created ", path.dirname(dirname));
            mkdirs(path.dirname(dirname), function() {
                fs.mkdir(dirname, callback);
            });
        }
    });
};

//初始化 SinaCloud
var scConfig = new SinaCloud.Config({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    sslEnabled: false
});

//全局生效:
SinaCloud.config = scConfig;
var mybucket = new SinaCloud.S3({ params: { Bucket: config.bucket } });

var dir = config.targetDir;
mybucket.listObjects({ Prefix: dir }, function(err, data) {
    if (err) {
        console.log(err, err.stack); // an error occurred
        return;
    }
    let list = data.Contents;
    for (let i = 0; i < list.length; i++) {
        let fileStat = list[i];
        mybucket.getObject({ Key: fileStat.Key }, function(err, data) {
            if (err) {
                console.log(err);
                return;
            }
            writeFile(path.join(config.basicRoot, fileStat.Key), data.Body)
        })
    }
});