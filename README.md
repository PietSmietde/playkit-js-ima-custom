## Initial

```
cd playkit-js-ima && yarn install && cd ..
```

## Build

```
sh scripts/build.sh
```

## Reset submodule

````
git submodule foreach --recursive git reset --hard
git submodule foreach --recursive git clean -f -d
````
