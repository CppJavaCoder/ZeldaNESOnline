import fse from 'fs-extra';

if (!fse.existsSync("./build/src/ZeldaNESOnline/libs")) {
    fse.mkdirSync("./build/src/ZeldaNESOnline/libs");
}
//fse.copySync("./libs/Z64Lib", "./build/src/ZeldaNESOnline/libs/Z64Lib", { dereference: true });
try {
    //fse.unlinkSync("./build/src/ZeldaNESOnline/libs/Z64Lib/icon.gif");
} catch (err) {
}
try {
    //fse.unlinkSync("./build/src/ZeldaNESOnline/libs/Z64Lib/icon.png");
} catch (err) {
}