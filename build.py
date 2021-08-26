if __name__ == '__main__':
    import json
    import os

    with open('build.json', 'r') as fp:
        build_info = json.loads(fp.read())

    tiddlers = {}
    for tiddler_ in build_info['shadow-tiddlers']:
        tiddler = tiddler_['meta']
        if tiddler_['type'] == 'external':
            if os.path.exists(tiddler_['src']) and os.path.isfile(tiddler_['src']):
                with open(tiddler_['src'], 'r') as fp:
                    tiddler['text'] = fp.read()
            else:
                tiddler['text'] = ''
        tiddlers[tiddler['title']] = tiddler
    plugin = build_info['meta']
    plugin['text'] = json.dumps({'tiddlers': tiddlers})

    os.makedirs('./dist', exist_ok=True)
    import re
    with open('./dist/' +
              re.sub('[^A-Za-z0-9_]', '', build_info['meta']['name'])
              + '-' + build_info['meta']['version'] + '.json', 'w') as fp:
        fp.write(json.dumps([plugin]))
