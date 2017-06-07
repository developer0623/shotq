#!/bin/bash

export BUILDROOT=/mnt/Application
export BUILD_OUT=/mnt/build

echo "Creating local configstore..."
mkdir -p /root/.config/configstore
chmod g+rwx /root /root/.config /root/.config/configstore

echo "Running npm install in ${BUILDROOT}"
cd ${BUILDROOT} && \
npm install && \
npm install node-sass && \
npm install git+https://github.com/aslubsky/ng2-select.git

echo "Running npm install in ${BUILDROOT}/src/app/assets/theme"
cd ${BUILDROOT}/src/app/assets/theme && npm install

echo "Running npm run build:prod in ${BUILDROOT}"
cd ${BUILDROOT} && typings install && npm run build:prod

echo "Preparing build artifact..."

rm -fr ${BUILD_OUT}
mkdir ${BUILD_OUT}

cp -ar ${BUILDROOT}/dist/* ${BUILD_OUT}
mkdir /mnt/build/assets/theme
cp -ar ${BUILDROOT}/src/app/assets/theme/assets ${BUILD_OUT}/assets/theme/
sed -i "s@app/assets@assets@g" ${BUILD_OUT}/index.html
cp ${BUILDROOT}/src/index-styles.css ${BUILD_OUT}

echo "Syncing to s3://shootq-production-main/..."
s3-cli sync --delete-removed /mnt/build/ s3://shootq-production-main/
