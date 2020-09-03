cp ./src/ima.js ./playkit-js-ima/src/ima-custom.js
cp ./src/index.js ./playkit-js-ima/src/index.js

cd playkit-js-ima
yarn build
cd ..

rm -Rf dist/*
mv playkit-js-ima/dist .

git submodule foreach --recursive git reset --hard
git submodule foreach --recursive git clean -f -d
