#!/bin/bash

# -----------------------------------------------------------------
#
# Sets up the and production configuration with env vars.
#
# -----------------------------------------------------------------
#
# REMEMBER: for setting up vars must be run as:
# 
#   . ./tmuxenv.sh
#
# When run with the -t modifier, will search for tmuxenv_template files
# for env vars substitution. Will create new files without the
# tmuxenv_template extension, adding them to the main project 
# .gitignore.
#
# -----------------------------------------------------------------


# Project's Env Variables, must start with TMUXENV_

export TMUXENV_REDIS_DEV_CONTAINER=rxredis-redis





# -------------------

# Help function

help(){
cat <<EOF

REMEMBER: must be run as ./tmuxenv.sh for env vars setting.

Sets tmux session env vars for project configuration. If run with the -t
flag, it also process substitutions at all .tmuxenv_template suffixed 
files in the directory tree. A new version of the substituted file is 
created with the same name and this file is also added to the main 
project's .gitignore.

  ./tmuxenv.sh -t -h

Usage:
  -t        Process templates.
  -h        This help.

EOF

return 0
}



# Function for processing templates

process_templates(){

  echo

  # For storing the substitutions to perform on the templates

  SUBSTITUTIONS=""

  # Create sed compatible substitutions for all env vars that starts
  # with the TMUXENV_ prefix

  for V in "${!TMUXENV_@}" ; do

    SUBSTITUTIONS="${SUBSTITUTIONS} s|###${V}###|${!V}|g; "

  done

  # The string to include at the end of the .gitignore

  FOR_GITIGNORE="# Added by tmuxenv.sh\n# -------------------"

  # Run SED substitutions on all template files in the folder tree
  # Creates a new file without the template suffix and updates the 
  # string to be added at the end of the .gitignore

  for T in $(find . -iname *.tmuxenv_template) ; do

    echo Processing template $T...

    NEW_FILE_NAME="${T%.*}"

    sed -e "${SUBSTITUTIONS}" $T > $NEW_FILE_NAME

    FOR_GITIGNORE="${FOR_GITIGNORE}\n${NEW_FILE_NAME#*/}"

  done

  echo Updating .gitignore...

  # Deletes all lines at .gitignore from the # Added by tmuxenv.sh
  # line to the end

  sed -n '/# Added by tmuxenv.sh/q;p' .gitignore > .gitignore-new

  # Process the new .gitignore

  rm .gitignore

  mv .gitignore-new .gitignore

  printf "${FOR_GITIGNORE}" >> .gitignore

  echo Done
  echo

  return 0

}



# Options processing

POS=0

while getopts th opt ; do
	case "$opt" in
	    h) help
	        ;;
	    t) process_templates
	        ;;
	    ?) help
	        ;;
	esac
done
