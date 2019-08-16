#!/bin/bash

#传入commit参数
commitName=$1

git status
git add .
git commit -m ${commitName}
git push