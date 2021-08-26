all: build

build:
	python3 ./build.py

clean:
	rm -rf ./dist
