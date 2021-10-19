import fs from 'fs';
import path from 'path';
import {
    execSync
} from 'child_process';

const repoFolder = path.join(path.dirname(__filename), '..');
const docsFolder = path.join(repoFolder, 'docs');
const folderToServe = path.join(repoFolder, 'public-dist');

// cross-env TIDDLYWIKI_PLUGIN_PATH='node_modules/tiddlywiki/plugins/published' TIDDLYWIKI_THEME_PATH='${wikiFolderName}/themes'
process.env.TIDDLYWIKI_PLUGIN_PATH = `${repoFolder}/dist/plugins`;
process.env.TIDDLYWIKI_THEME_PATH = `${docsFolder}/themes`;

const execAndLog = (command, options) => console.log(String(execSync(command, options)));

function build() {
    // npm run build:prepare
    execAndLog(`rm -rf ${folderToServe}`);
    // npm run build:public
    execAndLog(`cp -r ${docsFolder}/public/ ${folderToServe}`, {
        cwd: repoFolder
    });
    // try copy some static assets, don't cause error if some of them been removed by the user
    try {
        // npm run build:public
        execAndLog(`cp ${docsFolder}/tiddlers/favicon.ico ${folderToServe}/favicon.ico`, {
            cwd: repoFolder
        });
    } catch (error) {
        console.log(error);
    }
    // npm run build:nodejs2html
    execAndLog(`tiddlywiki ${docsFolder} --build externalimages`, {
        cwd: docsFolder
    });
    execAndLog(`tiddlywiki ${docsFolder} --build externaljs`, {
        cwd: docsFolder
    });
    // npm run build:sitemap
    execAndLog(`tiddlywiki ${docsFolder} --rendertiddler sitemap sitemap.xml text/plain && mkdir -p ${folderToServe} && cp -r ${docsFolder}/output/* ${folderToServe}/`, {
        cwd: docsFolder,
    });
    // npm run build:minifyHTML
    const htmlMinifyPath = `${docsFolder}/output/index-minify.html`;
    const htmlOutputPath = `${folderToServe}/index.html`;
    execAndLog(`html-minifier-terser -c ${docsFolder}/html-minifier-terser.config.json -o ${htmlMinifyPath} ${docsFolder}/output/index.html`, {
        cwd: repoFolder
    });
    // build dll.js and config tw to load it
    // original filename contains invalid char, will cause static server unable to load it
    const htmlContent = fs.readFileSync(htmlMinifyPath, 'utf-8');
    const htmlContentWithCorrectJsPath = htmlContent.replaceAll('%24%3A%2Fcore%2Ftemplates%2Ftiddlywiki5.js', 'tiddlywiki5.js');
    fs.writeFileSync(htmlOutputPath, htmlContentWithCorrectJsPath);
    execAndLog(`mv ${docsFolder}/output/tiddlywiki5.js ${folderToServe}/tiddlywiki5.js`, {
        cwd: repoFolder
    });
    // npm run build:precache
    execAndLog(`workbox injectManifest ${docsFolder}/workbox-config.js`, {
        cwd: docsFolder
    });
    // npm run build:clean
    // execAndLog(`rm -r ${docsFolder}/output`, { cwd: repoFolder });
    // npm run build:pluginLibrary
    execAndLog(`tiddlywiki ${docsFolder} --output ${folderToServe}/library --build library`, {
        cwd: repoFolder
    });
    execAndLog(`rm -rf ${docsFolder}/output/`, {
        cwd: docsFolder,
    });
}
build();
