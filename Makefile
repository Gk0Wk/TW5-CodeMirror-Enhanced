all: build

build:
	cd src/core && rollup -c && cd ../..
	python3 ./build.py

clean:
	rm -rf ./dist
