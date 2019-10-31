#!/bin/bash

# 传入commit参数
# commitName=$1
# 判断参数
# 为空就传入默认commit
if [ ! -n "$1" ] ;then
  echo 'There is No Commit Message!'
  commitName="defaultCommit"
else
  commitName=$1
fi


git status
git add .
git commit -m ${commitName}
git push