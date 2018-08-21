'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 数据结构：阅读数
const Monitor = new Schema({
    postId: { type: 'ObjectId', ref: 'Post' },  // 关联文章id
    updateAt: Date, // 更新时间
    readNum: Number,// 阅读数
    likeNum: Number,// 点赞数
});

Monitor.plugin(require('motime'));

Monitor.index({ updateAt: 1 });

mongoose.model('Monitor', Monitor);