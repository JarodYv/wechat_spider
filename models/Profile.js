'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 数据结构：公众号账号
const Profile = new Schema({
  title: String,          // 公众号名称
  wechatId: String,
  desc: String,           // 公众号描述
  msgBiz: String,         // 公众号唯一标识
  headimg: String,        // 头像链接
  openHistoryPageAt: Date,// 打开时间（上次爬取时间）
  property: String        // 无关的字段，可忽略
});

Profile.plugin(require('motime'));

Profile.index({ msgBiz: 1 });

mongoose.model('Profile', Profile);
