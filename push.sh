#!/bin/bash

commitName=$1

git status
git add .
git commit -m ${commitName}
git push