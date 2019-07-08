
# Generate CSVs of all Open Source Licenses

rm -rf  ./licenses
mkdir -p licenses

npx license-checker --csv >> ./licenses/element-mono.csv

LERNA_PACKAGE_DIR="./packages/*"

for d in $LERNA_PACKAGE_DIR; do
    cd $d
    PACKAGE_NAME=$(cat package.json | jq ".name" | tr -d '"' | sed 's/@transmute//g')
    npx license-checker --csv > ../../licenses/$PACKAGE_NAME.csv
    cd ../..
done

echo "# Element Licenses Report \nDate: $(date)" > ./licenses/README.md