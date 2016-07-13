---
layout: page
permalink: /about.html
title: 关于
tags: [关于, 网志, fooleap, blog]
js: true
---

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" height="52" style="width:280px;margin:0;" src="http://music.163.com/outchain/player?type=2&id=165614&auto=0&height=32"></iframe>

好多年前，在某个网站听到这首曲子的背景音乐，听着有感觉，便将其扒了下来（[fmmusic.mid]({{ site.IMG_PATH }}/fmmusic.mid)，当年的文件，MIDI 格式的），听得多了，就感觉对自己来说有某种特殊的意义，后来才知道它的名字及由来。

* 网志网址：[http://blog.fooleap.org](http://blog.fooleap.org)
* Atom 订阅：[http://blog.fooleap.org/atom.xml](/atom.xml)

这是 fooleap 的个人网志，记录点滴。

自 2011 年 2 月 9 日起，本站已运行 <span id="days"></span> 天，截至 {% for post in site.posts | limit: 1 %}{{ post.date |  date: "%Y 年 %m 月 %d 日" }}{% endfor %}，共有文章 {{ site.posts | size }} 篇。

本网志采用 [Jekyll](http://jekyllrb.com/) 搭建，采用 [Markdown](http://daringfireball.net/projects/markdown/) 写作，托管于 [阿里云](http://www.aliyun.com) 和 [GitHub](https://github.com/fooleap/fooleap.github.io)，图片存储在[七牛](https://portal.qiniu.com/signup?code=3lmtscszx8zf4)。 

即日起，本网志的原创内容，均采用知识共享组织（Creative Commons）的“署名-非商业性使用 3.0 中国大陆”（[CC BY-NC 3.0 CN](http://creativecommons.org/licenses/by-nc/3.0/cn/)）许可。

## 博主

潮汕人，拖延症、强迫症患者，闲余喜欢喝茶、喜欢拍照、喜欢跑步、喜欢骑行。

## 联系方式

* Email: fooleap(at)gmail.com
* Nike+: @fooleap
* Twitter: [@fooleap](http://twitter.com/fooleap)
* V2EX: [@fooleap](http://www.v2ex.com/member/fooleap)
* Ruby China: [@fooleap](http://ruby-china.org/fooleap)
* 豆瓣: [@fooleap](http://douban.com/people/fooleap)
* 知乎: [@fooleap](http://zhihu.com/people/fooleap)

## 网志进程

* 2011-02-09 网志建立，名字为“Fooleap”
* 2011-10-28 网志网址改为二级域名 blog.fooleap.org ，主域做了重定向，网志改名为“Fooleap&#039;s Blog”
* 2012-03-18 网志从 WordPress 平台转到 Jekyll 平台，托管于 GitHub
* 2013-01-19 转移到 VPS 上
* 2014-01-10 所用的 Host700 卷铺走人，重新转移到 GitHub
* 2014-06-29 升级 Bootstrap 框架为 3.2 
* 2014-08-05 放弃 Bootstrap 框架
* 2015-05-23 增加远程 GitCafé 分支，DNSPod 设置国内访问 GitCafé，国外访问 GitHub。
* 2015-10-28 国内解析到阿里云虚拟主机

<!--<script>
  var birthDay = new Date('02/09/2011');
  var now = new Date();
  var duration = now.getTime() - birthDay.getTime();
  var total= Math.floor(duration / (1000 * 60 * 60 * 24));
  document.getElementById('days').innerHTML = total;
  </script>-->
