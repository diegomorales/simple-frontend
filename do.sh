#!/usr/bin/env sh
# Do - The Simplest Build Tool on Earth.
# Documentation and examples see https://github.com/8gears/do

# Make nvm available
. ~/.nvm/nvm.sh
. ~/.bash_profile


#set -e -u # -e "Automatic exit from bash shell script on error"  -u "Treat unset variables and parameters as errors"
set -u # with -e nvm doesn't seem to work correctly

build() {
  nvm use
  npm run build
}

dev() {
  nvm use
  npm start
}

"$@" # <- execute the task

[ "$#" -gt 0 ] || printf "Usage:\n\t./do.sh %s\n" "($(compgen -A function | grep '^[^_]' | paste -sd '|' -))"
