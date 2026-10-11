#!/bin/bash
f=$1; n=$(basename $f .txt)
extra="-i ../_refs/handstand.png"
case $n in 02*|04*) extra="-i ../_refs/golf-impact.png";; 05*|07*|08*) extra="-i ../_refs/handstand.png";; esac
cat $f | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra $extra -i ../../CLOUD-MOCKUPS/reference/beautiful-world-1.png - > p/$n.log 2>&1
