#!/bin/bash

set -eux

if ! test -d /docker-host/dist/ ; then
  echo 'Destination "/docker-host/dist/" folder not found';
  exit 1;
fi

python -m venv venv
source venv/bin/activate
pip install pyinstaller
pip install -r requirements-slim.txt

cp ./g4f/__main__.py .
sed -Eie 's#from \.#from g4f.#g' __main__.py

pyinstaller --onefile --path /app/venv/lib/python*/site-packages/ -w -F --add-data "g4f/gui/client/:client" __main__.py
cp ./dist/__main__ /docker-host/dist/server
