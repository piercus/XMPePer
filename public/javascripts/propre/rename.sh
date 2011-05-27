#!/bin/bash
for filename in *.fr
do
newname=`basename $filename .fr`;
mv $filename $newname;
done
