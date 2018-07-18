#!/usr/bin/env bash

IMG_NAME=simple-frontend

if [[ "$(docker images -q $IMG_NAME 2> /dev/null)" == "" ]]; then
  docker build -t $IMG_NAME .
fi

if [[ "$(pgrep nfsd 2> /dev/null)" != "" ]]; then
	docker run \
	-it \
	-p 3000:3000 -p 3001:3001 \
	--mount 'type=volume,volume-driver=local,"volume-opt=o=addr=host.docker.internal,rw,nolock,hard,nointr,nfsvers=3",volume-opt=type=nfs,volume-opt=device=:'"$(pwd)"',dst=/home/node/code,src='"$IMG_NAME"'_volume' \
	$IMG_NAME bash
else
	docker run -it -p 3000:3000 -p 3001:3001 -v $(pwd):/home/node/code $IMG_NAME bash
fi


