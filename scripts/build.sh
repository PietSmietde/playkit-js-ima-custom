cp ./src/ima.js ./playkit-js-ima/src/ima-custom.js
cp ./src/index.js ./playkit-js-ima/src/index.js

cd playkit-js-ima

yarn build

cd ..

rm -R dist
mv playkit-js/dist .
