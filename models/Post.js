'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 数据结构：文章
const Post = new Schema({
  title: String,    // 标题
  copyright: String,// 是否原创，11为原创 100为无原创 101为转发
  author: String,   // 作者
  link: String,     // 文章永久链接
  publishAt: Date,  // 发布时间
  readNum: Number,  // 阅读数
  likeNum: Number,  // 点赞数
  msgBiz: String,   // 公众号唯一标识 !important
  msgMid: String,   // 图文消息id
  msgIdx: String,   // 文章发布位置，首条、二条等等(1代表头条位置消息)
  sourceUrl: String,// 文章阅读原文链接，若无则空
  cover: String,    // 文章封面图片链接
  digest: String,   // 文章摘要
  isFail: Boolean,  // 文章是否删除，如果删除改为1，下次就不再抓取
  wechatId: String, // 微信id
  updateNumAt: Date,// 更新时间
  content: String,  // 文章正文html代码
}, { toJSON: { virtuals: true } });

Post.plugin(require('motime'));

Post.virtual('profile', {
  ref: 'Profile',
  localField: 'msgBiz',
  foreignField: 'msgBiz',
  justOne: true
});

// 索引
Post.index({ publishAt: -1, msgIdx: 1 });
Post.index({ publishAt: 1, msgIdx: 1 });
Post.index({ updateNumAt: -1 });
Post.index({ updateNumAt: 1 });
Post.index({ msgBiz: 1, publishAt: 1, msgIdx: 1 });
Post.index({ msgBiz: 1, msgMid: 1, msgIdx: 1 });

mongoose.model('Post', Post);
