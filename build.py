# CodeMirror, copyright (c) by Marijn Haverbeke and others
# Distributed under an MIT license: https://codemirror.net/LICENSE
# Author: Gk0Wk (nmg_wk@yeah.net)
# Licence: MIT
"""
Build TiddlyWiki Plugin to JSON & NodeJS format with build.json
"""

import re
import os
import json
import shutil

SRC_DIR = 'src'
DIST_DIR = 'dist'
BUILD_DIR = 'dist/build'
PLUGIN_INFO_KEY = 'plugin.info'


def gen_plugin_name(build_info):
    """Generate plugin output name

    :param build_info: JSON object of build.json
    :type build_info: object
    :return: Output name of plugin
    :rtype: str
    """
    return re.sub('[^A-Za-z0-9_-]+', '-',
                  build_info[PLUGIN_INFO_KEY]['title'].split(
                      '/')[-1]) + '-' + build_info[PLUGIN_INFO_KEY]['version']


def minify_source_code(build_info):
    """Minify CSS and JS file and update build_info

    :param build_info: JSON object of build.json
    :type build_info: object
    :return: str
    :rtype: string of updated build.json
    """
    for tiddler in build_info['tiddlers']:
        if 'src' not in tiddler:
            continue
        snamepath, type_ = os.path.splitext(tiddler['src'])
        spath, sname = os.path.split(snamepath)
        type_ = type_.lower()
        if type_ == '.js':
            new_spath = os.path.join('..', BUILD_DIR, spath)
            new_src = os.path.join(new_spath, sname + '.min.js')
            src = os.path.join(SRC_DIR, tiddler['src'])
            dist = os.path.join(SRC_DIR, new_src)
            os.makedirs(os.path.join(SRC_DIR, new_spath), exist_ok=True)
            os.system(
                f'uglifyjs {src} -c -m --v8 --webkit --ie --output {dist}')
            tiddler['src'] = new_src
        elif type_ == '.css':
            new_spath = os.path.join('..', BUILD_DIR, spath)
            new_src = os.path.join(new_spath, sname + '.min.css')
            src = os.path.join(SRC_DIR, tiddler['src'])
            dist = os.path.join(SRC_DIR, new_src)
            os.makedirs(os.path.join(SRC_DIR, new_spath), exist_ok=True)
            os.system(f'cleancss {src} -o {dist}')
            tiddler['src'] = new_src
        else:
            continue
    return json.dumps(build_info)


def build_json_plugin(build_info):
    """Build JSON format TiddlyWiki5 plugin

    :param build_info: JSON object of build.json
    :type build_info: object
    """
    tiddlers = {}
    for tiddler_ in build_info['tiddlers']:
        tiddler = tiddler_['fields']
        if 'src' in tiddler_:
            file_path = os.path.join(SRC_DIR, tiddler_['src'])
            if os.path.exists(file_path) and os.path.isfile(file_path):
                with open(file_path, 'r') as ffp:
                    tiddler['text'] = ffp.read()
            else:
                tiddler['text'] = ''
        else:
            tiddler['text'] = tiddler_['text'] if 'text' in tiddler_ else ''
        tiddlers[tiddler['title']] = tiddler
    plugin = build_info[PLUGIN_INFO_KEY]
    plugin['text'] = json.dumps({'tiddlers': tiddlers})
    os.makedirs(DIST_DIR, exist_ok=True)
    with open(os.path.join(DIST_DIR,
                           gen_plugin_name(build_info) + '.json'), 'w') as ffp:
        ffp.write(json.dumps([plugin]))


def build_node_plugin(build_info):
    """Build NodeJS format TiddlyWiki5 plugin (compressed in zip file)

    :param build_info: JSON object of build.json
    :type build_info: object
    """
    NODE_DIST = os.path.join(
        DIST_DIR, 'plugins',
        re.sub(
            '[^A-Za-z0-9_-]+',
            '-',
            build_info[PLUGIN_INFO_KEY]['title'].split('/')[-2],
        ), build_info[PLUGIN_INFO_KEY]['title'].split('/')[-1])

    os.makedirs(NODE_DIST, exist_ok=True)
    with open(os.path.join(NODE_DIST, 'plugin.info'), 'w') as ffp:
        ffp.write(json.dumps(build_info[PLUGIN_INFO_KEY], indent=4))
    for tiddler in build_info['tiddlers']:
        sub_dist_path = tiddler['dist'] if 'dist' in tiddler else tiddler[
            'fields']['title'].split('/', 4)[-1]
        dist_path = os.path.join(NODE_DIST, sub_dist_path)
        os.makedirs(os.path.split(dist_path)[0], exist_ok=True)

        if 'src' in tiddler:
            src_path = os.path.join(SRC_DIR, tiddler['src'])
            if not os.path.exists(src_path) or not os.path.isfile(src_path):
                with open(dist_path, 'w') as ffp:
                    ffp.write('')
            shutil.copyfile(src_path, dist_path)
            del tiddler['src']
        else:
            with open(dist_path, 'w') as ffp:
                ffp.write(tiddler['text'] if 'text' in tiddler else '')
            if 'text' in tiddler:
                del tiddler['text']

        if 'dist' in tiddler:
            del tiddler['dist']
        tiddler['file'] = sub_dist_path
    with open(os.path.join(NODE_DIST, 'tiddlywiki.files'), 'w') as ffp:
        ffp.write(json.dumps({'tiddlers': build_info['tiddlers']}, indent=4))
    shutil.make_archive(os.path.join(DIST_DIR, gen_plugin_name(build_info)),
                        format="zip",
                        root_dir=os.path.join(DIST_DIR, 'plugins'))


def unpack_json_plugin(file, output):
    """unpack json plugin to node plugin

    :param file: path of json plugin
    :type file: str
    :param output: output dir
    :type output: str
    """
    with open(file, 'r') as ffp:
        obj = json.loads(ffp.read())[0]
    tiddlers_json = {'tiddlers': []}
    base_path = os.path.join(output, obj['title'].split('/', 2)[-1])
    os.makedirs(base_path, exist_ok=True)
    for tiddler_name, tiddler in json.loads(obj['text'])['tiddlers'].items():
        file_subpath = tiddler_name.split('/', 4)[-1]
        file_path = os.path.join(base_path, file_subpath)
        with open(file_path, 'w') as ffp:
            ffp.write(tiddler['text'])
        del tiddler['text']
        tiddlers_json['tiddlers'].append({
            'fields': tiddler,
            'file': file_subpath
        })
    with open(os.path.join(base_path, 'tiddlywiki.files'), 'w') as ffp:
        ffp.write(json.dumps(tiddlers_json))
    del obj['text']
    with open(os.path.join(base_path, 'plugin.info'), 'w') as ffp:
        ffp.write(json.dumps(obj))


if __name__ == '__main__':
    with open('build.json', 'r') as fp:
        build_info_str = fp.read()
    build_node_plugin(json.loads(build_info_str))
    build_info_str = minify_source_code(json.loads(build_info_str))
    build_json_plugin(json.loads(build_info_str))
    shutil.rmtree(BUILD_DIR)
    shutil.rmtree('dist/dist')
