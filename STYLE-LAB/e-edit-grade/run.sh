#!/bin/bash
f=$1; n=$(basename $f .txt)
extra="-i ../_refs/handstand.png"
case $n in 02*|04*|22*) extra="-i ../_refs/golf-impact.png -i ../_refs/handstand.png -i ../../CLOUD-MOCKUPS/05-elemental-flow.png";; 2*) extra="-i ../_refs/handstand.png -i ../../CLOUD-MOCKUPS/05-elemental-flow.png";; esac
cat $f | codex exec --skip-git-repo-check --sandbox workspace-write -m gpt-5.6-terra $extra -i ../../CLOUD-MOCKUPS/reference/beautiful-world-1.png - > p/$n.log 2>&1
