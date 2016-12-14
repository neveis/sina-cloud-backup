上传文件至新浪云存储。会根据文件的修改时间，只上传有改修的文件。会自动遍历文件夹下所有文件夹及文件。

需要准备nodejs运行环境，以及新浪云存储账号。

需要对config文件进行配置。
假如上传文件的路径是: D:\abc\up

basicRoot: D:\abc

uploadDir: up

bucket、accessKeyId、secretAccessKey为新浪云存储相关（key注意保密）。

注：Windows下注意路径的填写，反斜杠为'\\'。

Windows下先运行init.cmd安装依赖。配置好config后，运行upload上传文件。

仅为切换电脑临时备份，不可靠！