@echo off
set/p option=删除的目录或文件名:
node ./delete.js "%option%"
pause