const fs = require('fs');
const path = require("path");
const config = require("./config");
const SinaCloud = require('scs-sdk');


var getFileList = function(dirName, callback) {
    var record;

    if (fs.existsSync("./record.json")) {
        record = fs.readFileSync("./record.json", 'utf8');
        record = JSON.parse(record);
    } else {
        record = {};
    }

    var count = 0;
    var walk = function(dirName) {
        count++;
        fs.readdir(dirName, function(err, files) {
            if (err) {
                console.log(dirName, 'read error');
                return;
            }
            //空目录不上传
            if (files.length) {
                for (let i = 0; i < files.length; i++) {
                    //console.log(files[i]);
                    let filename = path.join(dirName, files[i]).replace(/\\/g, '/');
                    if (i === files.length - 1) {
                        fs.stat(filename, function(err, stats) {
                            if (err) {
                                console.log('stat read error')
                                return;
                            }
                            if (stats.isDirectory()) {
                                walk(filename);
                            } else {
                                let date = new Date(stats.mtime);
                                let time = date.getTime();
                                let fname = filename.substring(config.basicRoot.length);
                                if (fname in record) {
                                    if (record[fname].mtime === time) {
                                        record[fname].status = 0;
                                    } else {
                                        record[fname].mtime = time;
                                        record[fname].status = 1;
                                    }
                                } else {
                                    record[fname] = {
                                        mtime: time,
                                        status: 1
                                    }
                                }
                            }
                            count--;
                            console.log(count)
                            if (count === 0) {
                                console.log('over');
                                callback && callback(record);
                            }
                        });
                    } else {
                        fs.stat(filename, function(err, stats) {
                            if (err) {
                                console.log('stat read error')
                                return;
                            }
                            if (stats.isDirectory()) {
                                walk(filename);
                            } else {
                                let date = new Date(stats.mtime);
                                let time = date.getTime();
                                let fname = filename.substring(config.basicRoot.length);
                                if (fname in record) {
                                    if (record[fname].mtime === time) {
                                        record[fname].status = 0;
                                    } else {
                                        record[fname].mtime = time;
                                        record[fname].status = 1;
                                    }
                                } else {
                                    record[fname] = {
                                        mtime: time,
                                        status: 1
                                    }
                                }
                            }
                        });
                    }
                }
            } else {
                count--;
            }
        })
    };
    walk(dirName);
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

var dir = path.join(config.basicRoot, config.targetDir);

getFileList(dir, function(record) {
    for (fname in record) {
        if (record[fname].status === 0) {
            record[fname].status = 2;
        } else if (record[fname].status === 1) {
            //upload
            //转换为unix路径
            let uploadName = fname;
            fs.readFile(path.join(config.basicRoot, fname), function(err, fdata) {
                let data = { Key: uploadName, Body: fdata };
                mybucket.putObject(data, function(err, udata) {
                    if (err) {
                        console.log("Error uploading data: ", err);
                    } else {
                        console.log("Successfully uploaded data to myBucket/", data.Key);
                    }
                })
            })
            record[fname].status = 2;
            console.log('upload ', fname)
        } else {
            //delete
            let delName = fname;
            mybucket.deleteObject({ Key: delName }, function(err, data) {
                if (err) {
                    console.log("Error delete ", err); // an error occurred
                } else {
                    console.log('Successfully deleted ', delName); // successful response
                }
            });
            delete record[fname];
            console.log('delete ', fname);
        }
    }
    fs.writeFileSync('./record.json', JSON.stringify(record));
});