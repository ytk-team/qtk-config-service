const folder = process.argv[2];
try {
    console.log(JSON.stringify(require(folder)));
}
catch (err) {
    console.log(err);
}