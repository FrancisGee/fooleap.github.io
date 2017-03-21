---
layout: post
title: "使用的 Disqus API 上传图片"
description: "现 Disqus 上传图片 API，较之前有明显的区别，配合访客评论 API，可较完美地实现访客评论的上传图片功能。"
date: 2017-03-20 08:00:00+0800
category: tech
tags: ["Disqus", "Disqus API", "PHP", "cURL", "JavaScript"]
---

现 Disqus 上传图片 API，较之前有明显的区别，配合访客评论 API，可较完美地实现访客评论的上传图片功能。

此前 Disqus 评论框还能正常加载，也就没研究过 Disqus 的插图，故图片如何被上传、发表评论时如何携带图片已不得而知。

最近，为了完善评论框，本想使用七牛 API 实现上传图片功能。在此之前，研究了下 Disqus 的插图方式，对比了以前评论的内容及图片 URL，发现有相当明显的区别。现在 Disqus 保存已上传图片的方式，很合适配合访客评论的 API，实现完美插图。

目前，Disqus API 的传图流程大概是这样的：

```flow
st=>start: 开始
e=>end: 结束
op1=>operation: POST 请求:>#opera-1
op2=>operation: GET 请求:>#opera-2
cond1=>condition: 文件是否符合
cond2=>condition: 身份通过验证
io1=>inputoutput: 返回数据1
io2=>inputoutput: 返回数据2
io3=>inputoutput: 返回数据3

st->op1(right)->cond1
cond1(yes)->cond2
cond1(no)->e
cond2(no)->io1->e
cond2(yes)->io2->op2->io3->e
```

文件限制：

    类型及大小限制：JPEG, PNG or GIF and under 5MB

身份验证：

    Disqus 账号处于登录状态

数据1：
```json
{ 
    "code": 4, 
    "response": "You must be authenticated to perform this action"
}
```

数据2：
```json
{ 
    "code": 0, 
    "response": {
        "文件名": {
           "filename": "",
           "ok": true,
           "url": "https://uploads.disquscdn.com/images/"
        }
    }
}
```

```javascript
https://disqus.com/api/3.0/media/details.json
url
```
{:id="opera-2"}


```javascript

https://uploads.services.disqus.com/api/3.0/media/create.json

/* 发送 POST 请求 */

'参数' {
    upload: 文件 // 
    permanent: 1 //1->永久保存，0->临时保存，
    api_key: 公钥
}

'返回'
{
  code: 0 //上传成功
  response: [
    '原文件名':{
      filename:
      url:
    }
  ]
}

返回后，只要将图片地址放进 message，评论发表后，系统便会自动识别放进 media 数组，便可在评论列表中显示成图片。
```

大致了解这个过程之后的，我就直接把七牛上的图片地址放进 message，看看会不会自动识别成图片。结果可想而知，经过尝试，发现只有的少数 Disqus 家前缀的图片地址会生效。

还是那个方式，利用 PHP 搞个 API，在浏览器发送文件至这个 API，经 PHP 处理之后发送 POST 请求给 Disqus，返回填至 message。

为了拉取列表时能更快的显示图片，我还是打算将上传至 Disqus 的图片上传一份至七牛备份，列表显示时可直接显示成七牛上的图片即可，这样一来，就多出了一步。
