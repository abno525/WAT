#!/usr/bin/env bash 

# Arkadiusz Ostrzyżek 8

# debug set -x
# test  1 -gt 5


if [ ! -d "$1" ]; then
  exit 1
fi

if [ $# -lt 2 ]; then
    exit 1;
fi

exec > >(tee wynik.log)
rm $1/wynik.log

echo "PLIK : FRAZA" > $1/wynik.txt

for FILENAME in $1/$(ls -t | tail -n +2); do
    for ARG in "$@"; do
        if [ -f "$FILENAME" ]; then
            if grep -q "$ARG" "$FILENAME"; then 
                echo "$FILENAME : $ARG"
            fi
        fi
    done
done 