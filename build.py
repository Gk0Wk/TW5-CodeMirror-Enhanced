# CodeMirror, copyright (c) by Marijn Haverbeke and others
# Distributed under an MIT license: https://codemirror.net/LICENSE
# Author: Gk0Wk (nmg_wk@yeah.net)
# Licence: MIT
import re
import os
import json
import shutil

SRC_DIR = './src'
DIST_DIR = './dist'


def gen_plugin_name(build_info):
    return re.sub('[^A-Za-z0-9_]', '', build_info['plugin.info']
                  ['name']) + '-' + build_info['plugin.info']['version']


def build_json_plugin(build_info):
    tiddlers = {}
    for tiddler_ in build_info['tiddlers']:
        tiddler = tiddler_['fields']
        file_path = os.path.join(SRC_DIR, tiddler_['src'])
        if os.path.exists(file_path) and os.path.isfile(file_path):
            with open(file_path, 'r') as ffp:
                tiddler['text'] = ffp.read()
        else:
            tiddler['text'] = ''
        tiddlers[tiddler['title']] = tiddler
    plugin = build_info['plugin.info']
    plugin['text'] = json.dumps({'tiddlers': tiddlers})
    os.makedirs(DIST_DIR, exist_ok=True)
    with open(os.path.join(DIST_DIR,
                           gen_plugin_name(build_info) + '.json'), 'w') as ffp:
        ffp.write(json.dumps([plugin]))


def build_node_plugin(build_info):
    os.makedirs(os.path.join(DIST_DIR, 'node'), exist_ok=True)
    with open(os.path.join(DIST_DIR, 'node', 'plugin.info'), 'w') as ffp:
        ffp.write(json.dumps(build_info['plugin.info'], indent=4))
    for tiddler in build_info['tiddlers']:
        src_path = os.path.join(SRC_DIR, tiddler['src'])
        if not os.path.exists(src_path) or not os.path.isfile(src_path):
            continue
        sub_dist_path = tiddler['dist'] if 'dist' in tiddler else tiddler[
            'fields']['title'].split('/', 4)[-1]
        dist_path = os.path.join(DIST_DIR, 'node', sub_dist_path)
        os.makedirs(os.path.split(dist_path)[0], exist_ok=True)
        shutil.copyfile(src_path, dist_path)
        del tiddler['src']
        if 'dist' in tiddler:
            del tiddler['dist']
        tiddler['file'] = sub_dist_path
    with open(os.path.join(DIST_DIR, 'node', 'tiddlywiki.files'), 'w') as ffp:
        ffp.write(json.dumps({'tiddlers': build_info['tiddlers']}, indent=4))
    shutil.make_archive(os.path.join(
        DIST_DIR,
        gen_plugin_name(build_info),
    ),
                        format="zip",
                        root_dir=os.path.join(DIST_DIR, 'node'))
    shutil.rmtree(os.path.join(DIST_DIR, 'node'))


if __name__ == '__main__':
    with open('build.json', 'r') as fp:
        build_info_str = fp.read()
    build_json_plugin(json.loads(build_info_str))
    build_node_plugin(json.loads(build_info_str))
