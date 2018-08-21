'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
  postId: { type: 'ObjectId', ref: 'Post' },  // 关联文章id
  contentId: String,  // 评论id
  nickName: String,   // 评论个人昵称
  logoUrl: String,    // 头像logo
  content: String,    // 评论内容
  createTime: Date,   // 评论时间
  likeNum: Number,    // 点赞数
  replies: [{
    content: String,  // 回复内容
    createTime: Date, // 回复时间
    likeNum: Number   // 点赞数
  }]
});

Comment.plugin(require('motime'));

Comment.index({ contentId: 1 });

mongoose.model('Comment', Comment);
