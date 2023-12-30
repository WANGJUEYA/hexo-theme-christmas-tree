/* global hexo */

'use strict';

const fs = require('fs');

const fileCode = async (data) => {
    let content = data.content
    const regExp = /\[@fileCode]\((.*)\)/g;
    let match = null;
    const matches = [];
    while ((match = regExp.exec(content)) !== null) {
        matches.push(match)
    }
    const readFiles = matches.map(item => {
        const file = item[1];
        const splits = file.split('.');
        const fileType = splits.length > 1 ? splits[splits.length - 1] : '';

        let path = 'source/' + data.source;
        path = path.replace('.md', '/' + file)
        let fileContent = path
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    console.error('读取文件错误', path);
                    resolve(path);
                } else {
                    fileContent = data.toString();
                    const res = '```' + fileType + '\n' + fileContent + '\n```\n';
                    content = content.replaceAll(item[0], res)
                    resolve(content);
                }
            });
        })
    });

    await Promise.all(readFiles);
    data.content = content

    return data
}

// https://hexo.io/zh-cn/api/filter
// https://www.jianshu.com/p/c8964c5ffd7a
hexo.extend.filter.register('before_post_render', async function (data) {
    const {config: themeCfg} = this.theme;
    if (themeCfg.fileCode.enable && data.fileCode) {
        return await fileCode(data);
    } else {
        return undefined;
    }
}, 9);
