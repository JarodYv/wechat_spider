'use strict';

const {
  getReadAndLikeNum,
  getPostBasicInfo,
  handlePostHtml,
  getComments,
  getProfileBasicInfo,
  getPostList,
  handleProfileHtml
} = require('./wechatRule');
const basicAuth = require('./basicAuth');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const url = require('url');
const models = require('../models');
const debug = require('../utils/debug')('rule index');

const { isReplaceImg } = config.rule;
let imgBuf;
if (isReplaceImg) imgBuf = fs.readFileSync(path.join(__dirname, './replaceImg.png'));

const sendResFns = [
  getReadAndLikeNum,  // 获取阅读数和点赞数
  getPostBasicInfo,   // 获取文章基础信息
  handlePostHtml,     // 向文章页面注入代码，发起中间人攻击，自动跳转到下一篇文章
  getComments,        // 获取评论数据
  getProfileBasicInfo,// 获取公众号基础信息
  getPostList,        // 获取公众号文章列表
  handleProfileHtml   // 向公号详情页注入js代码，发起中间人攻击，不断下滑加载历史文章
];

const rule = {
  // 模块介绍
  summary: 'The rule for wechat spider, written by Jarod Yv.',

  // AnyProxy向服务端发送请求前，会调用beforeSendRequest。
  // 这里可以做拦截处理，将想要拦截的请求拦截下来不发送给服务器，自行返回响应
  *beforeSendRequest(requestDetail) {
    const { requestOptions, url: link, requestData } = requestDetail;
    const { headers, method } = requestOptions;
    const { Accept } = headers;

    // Proxy-Authorization
    const authRes = basicAuth(headers);
    if (authRes) return authRes;

    // 处理图片返回，如果允许替换图片，则返回默认图片
    if (isReplaceImg && /^image/.test(Accept)) {
      return {
        response: {
          statusCode: 200,
          header: { 'content-type': 'image/png' },
          body: imgBuf
        }
      };
    }

    // 处理前端发来的公众号已经抓取至第一篇文章的消息
    if (link.indexOf('/ws/profiles/first_post') > -1 && method === 'POST') {
      const data = JSON.parse(String(requestData));
      const msgBiz = url.parse(data.link, true).query.__biz;
      yield models.Profile.findOneAndUpdate(
        { msgBiz },
        { firstPublishAt: new Date(data.publishAt) }
      );
      debug(msgBiz, '更新 firstPublishAt 成功');
      return {
        response: {
          statusCode: 200,
          header: { 'content-type': 'text/plain' },
          body: 'ok'
        }
      };
    }

    // 和历史消息页面交互，返回下一篇跳转的地址
    if (link.indexOf('/wx/profiles/next_link') > -1 && method === 'GET') {
      let nextLink;
      if (!config.rule.profile.disable) {
        nextLink = yield models.Profile.getNextProfileLink();
      }
      if (!nextLink) nextLink = '';
      debug('nextLink', nextLink);
      return {
        response: {
          statusCode: 200,
          header: { 'content-type': 'application/json' },
          body: JSON.stringify({
            data: nextLink
          })
        }
      };
    }
  },

  // AnyProxy向客户端发送响应前，会调用beforeSendResponse
  // 这里可以对返回数据进行操作
  *beforeSendResponse(requestDetail, responseDetail) {
    const fnLens = sendResFns.length;
    if (fnLens === 0) return;
    let i = 0;
    const ctx = { req: requestDetail, res: responseDetail };
    // 依次调用sendResFns列表中的处理函数，尝试对返回内容进行处理
    const handleFn = () => {
      const fn = sendResFns[i];
      return fn(ctx).then(res => {
        if (res) return res;
        i += 1;
        if (i >= fnLens) return;
        return handleFn();
      });
    };
    return handleFn().catch(e => {
      console.log('\nError:', e, '\n');
      throw e;
    });
  }

  // 是否处理https请求 已全局开启解析https请求 此处注释掉即可
  // *beforeDealHttpsRequest(requestDetail) { /* ... */ },

  // 请求出错的事件
  // *onError(requestDetail, error) { /* ... */ },

  // https连接服务器出错
  // *onConnectError(requestDetail, error) { /* ... */ }
};

module.exports = rule;
