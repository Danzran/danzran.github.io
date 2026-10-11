#!/bin/bash
# usage: bash run.sh p/<name>.txt  (run from this folder)
f=$1; n=$(basename $f .txt)
R=../_refs; C=../../CLOUD-MOCKUPS
case $n in
  35*) extra="-i ../b-sakuga-impact/23-water-full-page.png";;
  36*) extra="-i ../h-cel-90s/2x-water-projects.png";;
  *)   extra="-i $R/handstand.png -i $C/05-elemental-flow.png";;
esac
cat $f | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra $extra - > p/$n.log 2>&1
echo "$n exit $?"
