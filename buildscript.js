import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';

fs.readFile('./index.js', "utf8", function (err, data) {
    if (err) {
        console.error(err)
        return
    }
    var obfuscationResult = JavaScriptObfuscator.obfuscate(data,
        {
            compact: false,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
        }
    );
    fs.writeFile('./prod/index.js', obfuscationResult.getObfuscatedCode(), err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })
});

const minifyCss = async (data, ofile) => {
    const output = await postcss([cssnano, autoprefixer])
        .process(data);

    fs.writeFile(ofile, output.css, err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })
}

fs.readFile('./style.css', "utf8", function (err, data) {
    if (err) {
        console.error(err)
        return
    }
    minifyCss(data, './prod/style.css')
});

fs.readFile('./button.css', "utf8", function (err, data) {
    if (err) {
        console.error(err)
        return
    }
    minifyCss(data, './prod/button.css')
});