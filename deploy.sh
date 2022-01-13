#!/bin/bash

# clean public
hexo clean

# Build the project.
hexo g

# Go To Public folder
# cd public
# Add changes to git.
git add .

# Commit changes.
msg="rebuilding site `date`"
if [ $# -eq 1 ]
  then msg="$1"
fi
git commit -m "$msg"

# Push source and build repos.
git push origin main

# deploy to tencentCloud
cd public

# cp 
scp -r ./ tencent:/usr/share/nginx/html
cd ..