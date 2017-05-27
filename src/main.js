import './sass/style.scss'
import './sass/navigation.scss'
import './sass/lightbox.scss'
import './sass/github.scss'
import './sass/comment.scss'
import './sass/media.scss'
var wx = require('weixin-js-sdk');
var elementClosest = require('element-closest');
var timeago = require('timeago.js');
var coordtransform = require('coordtransform');
var raphael = require('webpack-raphael');
var flowchart = require('flowchart.js');
var loadingsvg = require('url-loader!./svg/loading.svg');

var ua = navigator.userAgent,
    head = document.head,
    site = {
        home: head.dataset.home,
        api: head.dataset.api,
        img: head.dataset.img,
        tongji: head.dataset.tongji,
        analytics: head.dataset.analytics,
        emoji: '//assets-cdn.github.com/images/icons/emoji/unicode'
    },
    page = { 
        layout: head.dataset.layout,
        title: document.title,
        url: location.pathname,
        desc: document.querySelector('[name="description"]').content,
        id: head.dataset.id,
        category: head.dataset.category,
        tags: head.dataset.tags.split(',')
    },
    browser = { 
        mobile: !!ua.match(/AppleWebKit.*Mobile.*/),
        wechat: ua.toLowerCase().match(/MicroMessenger/i) == 'micromessenger'
    };

document.addEventListener("DOMContentLoaded", function(event) { 
    'use strict';

    function getQuery(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
        return false;
    }

    var flowArr = document.getElementsByClassName('language-flow');
    if( flowArr.length > 0 ){

        [].forEach.call(flowArr, function(item,i){
            var flowId = 'flow-' + (i+1);
            var div = document.createElement('div');
            div.classList.add('flow');
            div.setAttribute('id', flowId);

            var pre = item.parentNode;
            pre.insertAdjacentElement('beforebegin', div);
            pre.style.display = 'none';

            var diagram = flowchart.parse(item.innerText);
            diagram.drawSVG(flowId,{
                'yes-text': '是',
                'no-text': '否',
            });
        })

        window.addEventListener('load', function(){
            var linkArr = document.querySelectorAll('.flow a');
            [].forEach.call(linkArr, function(link){
                if(/^#/i.test(link.getAttribute('href'))){
                    link.setAttribute('target', '_self');
                }
            })
        });
    }

    timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');

    if(browser.wechat && location.origin == site.home){
        var xhrwesign = new XMLHttpRequest();
        xhrwesign.onreadystatechange = function() {
            if (xhrwesign.readyState==4 && xhrwesign.status==200)
            {
                var signPackage = JSON.parse(xhrwesign.responseText);
                wx.config({
                    debug: false,
                    appId: signPackage.appId,
                    timestamp: signPackage.timestamp,
                    nonceStr: signPackage.nonceStr,
                    signature: signPackage.signature,
                    jsApiList: [
                        'chooseImage',
                        'previewImage'
                    ]
                });
            }
        }
        xhrwesign.open('GET', site.api + '/wechat/jssdk?url='+ location.href, true);
        xhrwesign.send();
        wx.ready(function () {
        });
    }

    function wxchoose(){
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'], 
            success: function (res) {
                var localIds = res.localIds; 
            }
        });
    }

    // 图片
    (function(){
        var imageArr = document.querySelectorAll('.post-content img:not([class="emoji"])')
        var image = {
            "src" : [],
            "thumb" : [],
            "title" : [],
            "coord": []
        };
        for(var i = 0; i < imageArr.length; i++){
            image.thumb[i] = imageArr[i].src;
            image.src[i] =  new RegExp('\^'+site.img,'i').test(imageArr[i].src) ? imageArr[i].src.split(/_|\?/)[0] : imageArr[i].src;
        }
        image.jpg = image.src.filter(function(item){
            return item.indexOf('.jpg') > -1 && new RegExp('\^'+site.img,'i').test(item);
        });
        [].forEach.call(imageArr, function(item, i){
            image.title[i] = item.title || item.parentElement.textContent.trim() || item.alt;
            item.title = image.title[i];
            item.classList.add('post-image');
            item.dataset.src = image.src[i];
            item.parentElement.outerHTML = item.parentElement.outerHTML.replace('<p>','<figure class="post-figure" data-index='+i+'>').replace('</p>','</figure>').replace(item.parentElement.textContent, '');
            var imgdom = document.querySelector('.post-image[data-src="'+image.src[i]+'"]');;
            imgdom.insertAdjacentHTML('afterend', '<figcaption class="post-figcaption">&#9650; '+ image.title[i] +'</figcaption>');

            if( browser.wechat && browser.mobile ){
                imgdom.addEventListener('click',function(){
                    wx.previewImage({
                        current: image.src[i], 
                        urls: image.src
                    });
                })
            } else {  
                imgdom.addEventListener('click', function(){
                    if( !!document.querySelector('.lightbox-container') ){
                        document.querySelector('.lightbox-container').style.display = 'block';
                        document.querySelector('.lightbox-list').style.transform = 'translateX(-' + i + '00%)';
                        var thumbArr  = document.querySelectorAll('.lightbox-thumb-item');
                        [].forEach.call(thumbArr, function(thumb){
                            thumb.style.opacity = .6;
                        })
                        var thumb = document.querySelector('.lightbox-thumb');
                        var thumbList = document.querySelector('.lightbox-thumb-list');
                        var mainWidth = thumb.clientWidth;
                        var thumbNum = parseInt( mainWidth / 80 );
                        thumbList.style.marginLeft = thumbNum % 2 == 0 ? -(i - .5) * 80 + 'px': -i * 80 + 'px';
                        thumbArr[i].style.opacity = 1;
                        return;
                    }
                    var lightboxHTML = '<div class="lightbox-container"><div class="lightbox">'+
                        '<div class="lightbox-main"><ul class="lightbox-list"></ul></div>'+
                        '<div class="lightbox-thumb"><ul class="lightbox-thumb-list"></ul></div>'+
                        '</div></div>';
                    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
                    var lightbox = document.querySelector('.lightbox-container');
                    var lightboxList = document.querySelector('.lightbox-list');
                    var thumbList = document.querySelector('.lightbox-thumb-list');
                    var thumb = document.querySelector('.lightbox-thumb');
                    var mainWidth = thumb.clientWidth;
                    var thumbNum = parseInt( mainWidth / 80 );
                    var intWidth =  thumbNum * 80;
                    thumb.style.width = intWidth + 'px';
                    thumb.style.left = (mainWidth - intWidth)/2 + 'px';
                    thumbList.style.marginLeft = thumbNum % 2 == 0 ? -(i - .5) * 80 + 'px': -i * 80 + 'px';
                    image.src.forEach(function(src, e){
                        lightboxList.insertAdjacentHTML('beforeend', '<li class="lightbox-item"><img class="lightbox-item-image" src="'+image.src[e]+'" alt="'+image.title[e]+'" title="'+image.title[e]+'"></li>');
                        thumbList.insertAdjacentHTML('beforeend', '<li class="lightbox-thumb-item" style="background-image:url('+image.thumb[e]+')"></li>');
                    })
                    lightboxList.style.transform = 'translateX(-' + i + '00%)';
                    lightbox.addEventListener('click', function(e){
                        e.currentTarget.style.display = e.target == e.currentTarget ? 'none' : 'block';
                    })
                    var thumbArr  = document.querySelectorAll('.lightbox-thumb-item');
                    thumbArr[i].style.opacity = 1;
                    [].forEach.call(thumbArr, function(item, m){
                        var index = m;
                        item.addEventListener('click', function(){
                            [].forEach.call(thumbArr, function(thumb){
                                thumb.style.opacity = .6;
                            })
                            this.style.opacity = 1;
                            thumbList.style.marginLeft = thumbNum % 2 == 0 ? -(index-.5) * 80 + 'px': -index * 80 + 'px';
                            lightboxList.style.transform = ' translateX(-' + index + '00%)';
                        }) 
                    })
                    lightboxList.classList.add('active');
                })
            }
        })


        //Exif
        image.jpg.forEach(function(item, i){
            var xhrExif = new XMLHttpRequest();
            xhrExif.open('GET', item + '?exif', true);
            xhrExif.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200)
                {
                    var data = JSON.parse(this.responseText);
                    if ( !!data.DateTimeOriginal ) {
                        var datetime = data.DateTimeOriginal.val.split(/\:|\s/);
                        var date = datetime[0] + '-' + datetime[1] + '-' + datetime[2] + ' ' + datetime[3] +':'+ datetime[4];
                        var model = data.Model ? data.Model.val : '无';
                        var fnum = data.FNumber ? data.FNumber.val.split(/\//)[1] : '无';
                        var extime = data.ExposureTime ? data.ExposureTime.val : '无';
                        var iso = data.ISOSpeedRatings ? data.ISOSpeedRatings.val.split(/,\s/)[0] : '无';
                        var flength = data.FocalLength ? data.FocalLength.val : '无';
                        document.querySelector('.post-image[data-src="' + item + '"] + .post-figcaption').dataset.exif = '时间: ' + date + ' 器材: ' + model + ' 光圈: ' + fnum + ' 快门: ' + extime + ' 感光度: ' + iso + ' 焦距: ' + flength;
                    }
                    if ( !!data.GPSLongitude ) {
                        var olat = data.GPSLatitude.val.split(', ');
                        var olng = data.GPSLongitude.val.split(', ');
                        var lat=0, lng=0;
                        for( var e = 0; e < olat.length; e++ ){
                            lat += olat[e] / Math.pow(60, e);
                            lng += olng[e] / Math.pow(60, e);
                        }
                        lat = data.GPSLatitudeRef.val == 'S' ? -lat: lat;
                        lng = data.GPSLongitudeRef.val == 'W' ? -lng: lng;
                        image.coord[i] = coordtransform.wgs84togcj02(lng, lat).join(',');
                    }
                    if (i == image.jpg.length -1){
                        var xhrRegeo = new XMLHttpRequest();
                        xhrRegeo.open('GET', '//restapi.amap.com/v3/geocode/regeo?key=890ae1502f6ab57aaa7d73d32f2c8cc1&batch=true&location='+image.coord.filter(function(){return true}).join('|'), true);
                        xhrRegeo.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200){
                                var data = JSON.parse(this.responseText);
                                if( data.info == 'OK' ){
                                    var address,city,dist,town;
                                    for (var m = 0, n = 0; m < image.jpg.length; m++) {
                                        address = data.regeocodes[n].addressComponent;
                                        if (typeof(image.coord[m])!='undefined' && address) {
                                            city = address.city ? address.city : '';
                                            dist = address.district ? address.district : '';
                                            town = address.township ? address.township : '';
                                            document.querySelector('[data-index="'+m+'"] .post-image').title = '摄于' + city + dist + town;
                                            n++;
                                        }
                                    }
                                }
                            }
                        }
                        xhrRegeo.send(null);
                    }
                }
            };
            xhrExif.send(null);
        })
    })();

    // Vim 键绑定
    /*
       var inCombo = false;
       var lineHeight = 20;
       var keys = [];
       var row = 0;

       function keysDown(event) {
       keys[event.keyCode] = true;
       if (keys[16] && keys[71]) {
       window.scrollTo(0, document.body.scrollHeight);
       }
       if (keys[71]) {
       if (!inCombo) {
       inCombo = true;
       setTimeout('inCombo = false;', 500);
       } else {
       window.scrollTo(0, 0);
       }
       }
       if (keys[74]) {
       if (row) {
       window.scrollBy(0, lineHeight * row);
       row = 0;
       } else {
       window.scrollBy(0, lineHeight);
       }
       }
       if (keys[75]) {
       if (row) {
       window.scrollBy(0, -lineHeight * row);
       row = 0;
       } else {
       window.scrollBy(0, -lineHeight);
       }
       }
       if (event.keyCode >= 48 && event.keyCode <= 57) {
       for (var i = 48; i <= 57; i++) {
       keys[i] = i - 48;
       }
       row = parseInt(row.toString() + keys[event.keyCode].toString());
       }
       }

       function keysUp(event) {
       keys[event.keyCode] = false;
       }
       window.addEventListener('keydown', keysDown, false);
       window.addEventListener('keyup', keysUp, false);

       if( browser.mobile && page.url == '/' ){
       var pageNum = 0;
       var postData;
       var xhrPosts = new XMLHttpRequest();
       xhrPosts.open('GET', '/posts.json', true);
       xhrPosts.onreadystatechange = function() {
       if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
       postData = JSON.parse(xhrPosts.responseText);
       document.addEventListener('scroll', loadMore, false);
       }
       }
       xhrPosts.send();
       function loadMore (){
       var pageMax = Math.ceil(postData.length/10);
       if(document.body.offsetHeight-(document.documentElement.clientHeight +(document.documentElement.scrollTop || document.body.scrollTop )) == 0 && pageNum < pageMax){
       pagination.classList.add('loading');
       setTimeout(function(){
       pageNum++;
       var postMin = pageNum * 10;
       var postMax = (pageNum + 1) * 10;
       var html = '';
       var commentArr = [];
    for( var i = postMin; i < postMax && i < postData.length; i++){
        html +='<article class="post-item">'+
            '<img class="post-item-thumb" src="'+postData[i].thumb+'" alt="'+postData[i].title+'">'+
            '<section class="post-item-summary">'+
            '<h3 class="post-item-title"><a class="post-item-link" href="'+postData[i].url+'" title="'+postData[i].title+'">'+postData[i].title+'</a></h3>'+
            '<abbr class="post-item-date timeago" datetime="'+postData[i].date+'"></abbr>'+
            '</section>'+
            '<a class="post-item-comment" title="查看评论" data-disqus-url="'+postData[i].url+'" href="'+postData[i].url+'#comments"></a>'+
            '</article>';
        commentArr.push(postData[i].url);
        }
    document.querySelector('.post-list').insertAdjacentHTML('beforeend', html);
    timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');
    comment.list(commentArr);
    pagination.classList.remove('loading');
},1000);
}
}
}
*/

    // 目录
    var toc = document.querySelector('.post-toc');
    var subTitles = document.querySelectorAll('.page-content h2,.page-content h3');
    var clientHeight = document.documentElement.clientHeight;
    if (toc) {
        function tocShow() {
            var clientWidth = document.documentElement.clientWidth;
            var tocFixed = clientWidth / 2 - 410 - toc.offsetWidth;
            if (tocFixed < 15) {
                toc.style.visibility = 'hidden';
            } else {
                toc.style.visibility = 'visible';
                toc.style.left = tocFixed + 'px';
            }
        }
        function tocScroll() {
            var sectionIds = [];
            var sections = [];
            for (var i = 0; i < subTitles.length; i++) {
                sectionIds.push(subTitles[i].getAttribute('id'));
                sections.push(subTitles[i].offsetTop);
            }
            var pos = document.documentElement.scrollTop || document.body.scrollTop;
            var lob = document.body.offsetHeight - subTitles[subTitles.length - 1].offsetTop;
            for (var i = 0; i < sections.length; i++) {
                if (i === subTitles.length - 1 && clientHeight > lob) {
                    pos = pos + (clientHeight - lob);
                }
                if (sections[i] <= pos && sections[i] < pos + clientHeight) {
                    if (document.querySelector('.active')) {
                        document.querySelector('.active').classList.remove('active');
                    }
                    document.querySelector('[href="#' + sectionIds[i] + '"]').classList.add('active');
                }
            }
        }
        document.addEventListener('scroll', tocScroll, false);
        window.addEventListener('resize', tocShow, false);
        tocShow();
    }


    // 参考资料、站外链接
    (function(){
        if (document.querySelectorAll('h2')[document.querySelectorAll('h2').length - 1].innerHTML === '参考资料') {
            document.querySelectorAll('h2')[document.querySelectorAll('h2').length - 1].insertAdjacentHTML('afterend', '<ol id="refs"></ol>');
        }
        var links = document.getElementsByTagName('a');
        var noteArr = [];
        for (var i = 0; i < links.length; i++) {
            if (links[i].hostname != location.hostname && /^javascript/.test(links[i].href) === false) {
                var numText = links[i].innerHTML;
                var num = numText.substring(1, numText.length - 1);
                if (!isNaN(num) && num) {
                    noteArr.push({
                        num: num,
                        title: links[i].getAttribute('title'),
                        href: links[i].getAttribute('href')
                    });
                    links[i].setAttribute('class', 'ref');
                    links[i].setAttribute('href', '#note-' + num);
                    links[i].setAttribute('id', 'ref-'+ num);
                } else {
                    links[i].setAttribute('target', '_blank');
                }
            }
        }
        noteArr = noteArr.sort(function (a, b) {
            return +(a.num > b.num) || +(a.num === b.num ) - 1;
        })
        for(var i = 0; i < noteArr.length; i++){
            document.getElementById('refs').insertAdjacentHTML('beforeend', '<li id="note-' + noteArr[i].num + '" class="note"><a href="#ref-' + noteArr[i].num + '">^</a> <a href="' + noteArr[i].href + '" title="' + noteArr[i].title + '" class="exf-text" target="_blank">' + noteArr[i].title + '</a></li>');
        }
    })();

    if ( page.layout == 'post' ) {

        // 相关文章
        var postData;
        var xhrPosts = new XMLHttpRequest();
        xhrPosts.open('GET', '/posts.json', true);
        xhrPosts.onreadystatechange = function() {
            if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
                postData = JSON.parse(xhrPosts.responseText);
                randomPosts(relatedPosts(page.tags, page.category));
            }
        }
        xhrPosts.send(null);

        function relatedPosts(tags, cat){
            var posts = [];
            var used = [];
            postData.forEach(function(item, i){
                if( item.tags.some(function(tag) {return tags.indexOf(tag) > -1;}) && item.url != location.pathname ){
                    posts.push(item);
                    used.push(i);
                }
            })
            while (posts.length < 5) {
                var index = Math.floor(Math.random() * postData.length);
                var item = postData[index];
                if( used.indexOf(index) == '-1' && item.category == cat && item.url != location.pathname ){
                    posts.push(item);
                    used.push(index);
                }
            }
            return posts;
        }

        function randomPosts(posts){
            var used = [];
            var counter = 0;
            var html = '';
            while (counter < 5 ) {
                var index = Math.floor(Math.random() * posts.length);
                if (used.indexOf(index) == '-1') {
                    html += '<li class="post-extend-item"><a class="post-extend-link" href="' + posts[index].url + '" title="' + posts[index].title + '">' + posts[index].title + '</a></li>\n';
                    used.push(index);
                    counter++;
                }
            }
            document.querySelector('#random-posts ul').insertAdjacentHTML('beforeend', html);
        }

        var xhrPopular = new XMLHttpRequest();
        xhrPopular.open('GET', site.api + '/disqus/popular', true);
        xhrPopular.onreadystatechange = function() {
            if (xhrPopular.readyState == 4 && xhrPopular.status == 200) {
                var data = JSON.parse(xhrPopular.responseText);
                if( data.code == 0){
                    var posts = data.response;
                    var popularPosts = document.querySelector('#popular-posts ul');
                    posts.forEach(function(item){
                        popularPosts.insertAdjacentHTML('beforeend', '<li class="post-extend-item"><a class="post-extend-link" href="' + item.link + '" title="' + item.title + '">' + item.title + '</a></li>\n');
                    })
                }
            }
        }
        xhrPopular.send();
    }

    // Disqus 事件绑定
    var disqus_loaded = false;
    window.disqus_config = function () {
        this.page.url = site.home + page.url;
        this.callbacks.onReady.push(function() {
            comment.current = 'disqus';
            disqus_loaded = true;
            var toggleBtn = document.getElementById('comment-toggle');
            if(!!toggleBtn){toggleBtn.checked = true;}
            document.querySelector('.comment').style.display = 'none';
            document.getElementById('comment').dataset.tips = '';
            document.querySelector('.disqus').style.display = 'block';
        });
    };

    // 访客信息
    function Guest() {
        this.init();
    }

    Guest.prototype = {

        // 初始化访客信息
        init: function(){
            this.load();
            var boxArr = document.getElementsByClassName('comment-box');
            var guest = this;
            if( guest.logged_in == 'true' ) {
                [].forEach.call(boxArr,function(item,i){
                    item.querySelector('.comment-form-wrapper').classList.add('logged-in');
                    item.querySelector('.comment-avatar-image').setAttribute('src', guest.avatar);
                    item.querySelector('.comment-form-name').value = guest.name;
                    item.querySelector('.comment-form-email').value = guest.email;
                    item.querySelector('.comment-form-url').value = guest.url;
                });
            } else {
                [].forEach.call(boxArr,function(item,i){
                    item.querySelector('.comment-form-wrapper').classList.remove('logged-in');
                });
                localStorage.setItem('logged_in', 'false');
            }
        },

        // 读取访客信息
        load: function(){
            this.name = localStorage.getItem('name');
            this.email = localStorage.getItem('email');
            this.url = localStorage.getItem('url');
            this.avatar = localStorage.getItem('avatar');
            this.logged_in = localStorage.getItem('logged_in');
        },

        // 清除访客信息
        clear: function(){
            localStorage.removeItem('name');
            localStorage.removeItem('email');
            localStorage.removeItem('url');
            localStorage.removeItem('avatar');
            localStorage.setItem('logged_in', 'false');
            guest.init()
        },

        // 提交访客信息
        submit: function(e){
            if( guest.logged_in == 'false' ){
                var item = e.currentTarget.closest('.comment-item') || e.currentTarget.closest('.comment-box');
                var name = item.querySelector('.comment-form-name').value,
                    email = item.querySelector('.comment-form-email').value,
                    avatar = item.querySelector('.comment-avatar-image').getAttribute('src'),
                    url = item.querySelector('.comment-form-url').value;
                if (/\S/i.test(name)  && /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i.test(email)){
                    localStorage.setItem('name', name);
                    localStorage.setItem('email', email);
                    localStorage.setItem('url', url);
                    localStorage.setItem('avatar', avatar);
                    localStorage.setItem('logged_in', 'true');
                } else {
                    alert('请正确填写必填项');
                    return;
                }
                guest.init();
            }
        }
    }


    function Comment () {
        this.imagesize = [];
        this.unload = [];
        this.next = '';
        this.current = 'comment';
        this.hasBox = !!document.querySelector('.comment-box');
        this.box = this.hasBox ? document.querySelector('.comment-box').outerHTML : '';
        this.init();

    }

    /* Disqus 评论 */
    Comment.prototype = {

        // 初始化
        init: function(){
            // 评论计数
            var countArr = document.querySelectorAll('[data-disqus-url]');
            if( countArr.length > 0 ){
                var commentArr = [];
                [].forEach.call(countArr, function(item,i){
                    commentArr[i] = item.dataset.disqusUrl;
                });
                this.list(commentArr);
            }

            var toggleBtn = document.getElementById('comment-toggle');
            if(!!toggleBtn){toggleBtn.addEventListener('click', this.toggle, false)}
            if(this.hasBox){
                this.current = 'comment';
                this.getlist();
                    this.disqus();
                if( site.home == location.origin ){
                    this.disqus();
                }
            }
        },

        // 评论计数
        list: function(commentArr){
            var commentLink = encodeURIComponent(commentArr.join(','));
            var xhrCommentCount = new XMLHttpRequest();
            xhrCommentCount.open('GET', site.api +'/disqus/list?link=' + commentLink, true);
            xhrCommentCount.send();
            xhrCommentCount.onreadystatechange = function() {
                if (xhrCommentCount.readyState == 4 && xhrCommentCount.status == 200) {
                    var data = JSON.parse(xhrCommentCount.responseText);
                    for (var i = 0; i < data.response.length; i++) {
                        var count = data.response[i].posts == 0 ? '' : data.response[i].posts;
                        document.querySelector('[data-disqus-url="' + data.response[i].link.slice(23) + '"]').innerHTML = count;
                    }
                }
            }
        },

        // 切换评论框
        toggle: function(){
            if( comment.current == 'disqus' ){
                comment.current = 'comment';
                comment.getlist();
            } else {
                comment.current = 'disqus';
                comment.disqus();
            }
        },

        // 加载 Disqus 评论
        disqus: function(){
            if(!disqus_loaded){
                var d = document,
                    s = d.createElement('script');
                s.src = '//fooleap.disqus.com/embed.js';
                s.setAttribute('data-timestamp', +new Date());
                (d.head || d.body).appendChild(s);
            } else {
                document.querySelector('.comment').style.display = 'none';
                document.querySelector('.disqus').style.display = 'block';
            }
        },

        // 评论表单事件绑定
        form: function(){

            // 加载表情
            var emojiList = '';
            comment.emoji.forEach(function(item,i){
                emojiList += '<li class="emojione-item" title="'+ item.title+'" data-code="'+item.code+'"><img class="emojione-item-image" src="'+item.url+'" /></li>';
            })
            var emojiListArr = document.getElementsByClassName('emojione-list');
            [].forEach.call(emojiListArr,function(item,i){
                item.innerHTML = emojiList;
            });

            // 表情点选
            var emojiArr = document.getElementsByClassName('emojione-item');
            [].forEach.call(emojiArr,function(item,i){
                item.addEventListener('click', comment.field, false);
            });

            // 激活列表回复按钮事件
            var replyArr = document.getElementsByClassName('comment-item-reply');
            [].forEach.call(replyArr,function(item,i){
                item.addEventListener('click', comment.show, false);
            });

            // 评论框焦点
            var textareaArr = document.getElementsByClassName('comment-form-textarea');
            [].forEach.call(textareaArr, function(item, i){
                item.addEventListener('focus', comment.focus, false);
                item.addEventListener('blur', comment.focus, false);
            })

            // 邮箱验证
            var emailArr = document.getElementsByClassName('comment-form-email');
            [].forEach.call(emailArr, function(item,i){
                item.addEventListener('blur', comment.verify, false);
            });

            // 重置访客信息
            var exitArr = document.getElementsByClassName('exit');
            [].forEach.call(exitArr,function(item,i){
                item.addEventListener('click', guest.clear, false);
            });

            // 提交按钮
            var submitArr = document.getElementsByClassName('comment-form-submit');
            [].forEach.call(submitArr,function(item,i){
                item.addEventListener('click', guest.submit, false);
                item.addEventListener('click', comment.post, false);
            });

            // 上传图片按钮
            var imgInputArr = document.getElementsByClassName('comment-image-input');
            [].forEach.call(imgInputArr, function(item,i){
                item.addEventListener('change', comment.upload, false);
            });

        },

        // 评论框焦点
        focus: function(e){
            var wrapper = e.currentTarget.closest('.comment-form-wrapper');
            wrapper.classList.add('editing');
            if (wrapper.classList.contains('focus')){
                wrapper.classList.remove('focus');
            } else{
                wrapper.classList.add('focus');
            }
        },

        //点选表情
        field: function(e){
            var item = e.currentTarget;
            var textarea = item.closest('.comment-form').querySelector('.comment-form-textarea');
            textarea.value += item.dataset.code;
            textarea.focus();
        },

        //emoji表情
        emoji: [
            {
                code:':smile:',
                title:'笑脸',
                url:site.emoji+'/1f604.png'
            },{
                code:':mask:',
                title:'生病',
                url:site.emoji+'/1f637.png'
            },{
                code:':joy:',
                title:'破涕为笑',
                url:site.emoji+'/1f602.png'
            },{
                code:':stuck_out_tongue_closed_eyes:',
                title:'吐舌',
                url:site.emoji+'/1f61d.png'
            },{
                code:':flushed:',
                title:'脸红',
                url:site.emoji+'/1f633.png'
            },{
                code:':scream:',
                title:'恐惧',
                url:site.emoji+'/1f631.png'
            },{
                code:':pensive:',
                title:'失望',
                url:site.emoji+'/1f614.png'
            },{
                code:':unamused:',
                title:'无语',
                url:site.emoji+'/1f612.png'
            },{
                code:':grin:',
                title:'露齿笑',
                url:site.emoji+'/1f601.png'
            },{
                code:':heart_eyes:',
                title:'色',
                url:site.emoji+'/1f60d.png'
            },{
                code:':sweat:',
                title:'汗',
                url:site.emoji+'/1f613.png'
            },{
                code:':smirk:',
                title:'得意',
                url:site.emoji+'/1f60f.png'
            },{
                code:':relieved:',
                title:'满意',
                url:site.emoji+'/1f60c.png'
            },{
                code:':rolling_eyes:',
                title:'翻白眼',
                url:site.emoji+'/1f644.png'
            },{
                code:':ok_hand:',
                title:'OK',
                url:site.emoji+'/1f44c.png'
            },{
                code:':v:',
                title:'胜利',
                url:site.emoji+'/270c.png'
            }
        ],

        // 邮箱验证
        verify: function(e){
            var email = e.currentTarget;
            var box  = email.closest('.comment-box');
            var avatar = box.querySelector('.comment-avatar-image');
            var name = box.querySelector('.comment-form-name');
            if (name.value != '' && /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i.test(email.value)) {
                var xhrGravatar = new XMLHttpRequest();
                xhrGravatar.open('GET', site.api + '/disqus/getgravatar?email=' + email.value + '&name=' + name.value, true);
                xhrGravatar.send();
                xhrGravatar.onreadystatechange = function() {
                    if (xhrGravatar.readyState == 4 && xhrGravatar.status == 200) {
                        if (xhrGravatar.responseText == 'false') {
                            alert('您所填写的邮箱地址有误！');
                        } else {
                            avatar.src = xhrGravatar.responseText;
                        }
                    }
                }
            }
        },

        // 发表/回复评论
        post: function(e){
            var item = e.currentTarget.closest('.comment-item') || e.currentTarget.closest('.comment-box');
            var message = item.querySelector('.comment-form-textarea').value.replace('+','&#43;');
            var parentId = !!item.dataset.id ? item.dataset.id : '';
            var time = (new Date()).toJSON();
            var imgArr = item.getElementsByClassName('comment-image-item');
            var media = [];
            var mediaStr = '';
            [].forEach.call(imgArr, function(image,i){
                media[i] = image.dataset.imageUrl;
                mediaStr += ' ' + image.dataset.imageUrl;
            });
            if( !guest.name && !guest.email ){
                return;
            }
            if( media.length == 0 && message == '' ){
                alert('无法发送空消息');
                item.querySelector('.comment-form-textarea').focus();
                return;
            };
            var preMessage = message;
            comment.emoji.forEach(function(item,i){
                preMessage = preMessage.replace(item.code, '<img class="emojione" src="' + item.url + '" />');
            });
            guest.url = !!guest.url ? guest.url : '';
            var post = {
                'url': guest.url,
                'name': guest.name,
                'avatar': guest.avatar,
                'id': 'preview',
                'parent': parentId,
                'createdAt': time,
                'message': '<p>' + preMessage + '</p>',
                'media': media
            };
            comment.load(post, comment.count);
            timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');

            message += mediaStr;

            comment.message = message;

            // 清空或移除评论框
            if( parentId ){
                item.querySelector('.comment-item-cancel').click();
            } else {
                item.querySelector('.comment-form-textarea').value = '';
                item.querySelector('.comment-image-list').innerHTML = '';
                item.querySelector('.comment-form-wrapper').classList.remove('expanded','editing');
            }

            // POST 操作
            var postQuery = 'thread=' + comment.thread + 
                '&parent=' + parentId + 
                '&message=' + encodeURIComponent(message) + 
                '&name=' + guest.name + 
                '&email=' + guest.email + 
                '&url=' + guest.url +
                '&link=' + page.url +
                '&title=' + page.title;
            var xhrPostComment = new XMLHttpRequest();
            xhrPostComment.open('POST', site.api + '/disqus/postcomment', true);
            xhrPostComment.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhrPostComment.send(postQuery);
            xhrPostComment.onreadystatechange = function() {
                if (xhrPostComment.readyState == 4 && xhrPostComment.status == 200) {
                    var res = JSON.parse(xhrPostComment.responseText);
                    if (res.code === 0) {
                        var preview = document.querySelector('.comment-item[data-id="preview"]');
                        preview.parentNode.removeChild(preview);
                        comment.count += 1;
                        document.getElementById('comment-count').innerHTML = comment.count + ' 条评论';
                        comment.load(res.response, comment.count);
                        timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');
                        comment.form();
                    } else if (res.code === 2) {
                        if (res.response.indexOf('email') > -1) {
                            alert('请输入正确的名字或邮箱！');
                            return;
                        } else if (res.response.indexOf('message') > -1) {
                            alert('评论不能为空！');
                            return;
                        }
                    }
                }
            }
        },

        // 读取评论
        load: function(post, i){

            var parent = !post.parent ? {
                'name': '',
                'dom': document.querySelector('.comment-list'),
                'insert': 'afterbegin'
            } : {
                'name': !!document.querySelector('.comment-item[data-id="'+post.parent+'"]') ? '<a class="at" href="#'+document.querySelector('.comment-item[data-id="'+post.parent+'"]').getAttribute('id')+'">@' + document.querySelector('.comment-item[data-id="'+post.parent+'"]').dataset.name + '</a>': '',
                'dom': document.querySelector('.comment-item[data-id="'+post.parent+'"] .comment-item-children'),
                'insert': 'beforeend'
            };

            var url = post.url ? post.url : 'javascript:;';
            var messageHTML = post.message.replace(/(.{3})/, '$1'+parent.name);
            var mediaHTML = '';
            post.media.forEach(function(item, e){
                mediaHTML += '<a class="comment-item-imagelink" target="_blank" href="' + item + '" ><img class="comment-item-image" src="' + item + '?imageView2/2/h/200"></a>';
            })
            mediaHTML = '<div class="comment-item-images">' + mediaHTML + '</div>';

            var html = '<li class="comment-item" data-index="'+(i+1)+'" data-id="'+post.id+'" data-name="'+ post.name+'" id="comment-' + post.id + '">';
            html += '<div class="comment-item-avatar"><img src="' + post.avatar + '"></div>';
            html += '<div class="comment-item-main">'
            html += '<div class="comment-item-header"><a class="comment-item-name" rel="nofollow" target="_blank" href="' + url + '">' + post.name + '</a><span class="comment-item-bullet"> • </span><span class="comment-item-time timeago" datetime="' + post.createdAt + '"></span><span class="comment-item-bullet"> • </span><a class="comment-item-reply" href="javascript:;">回复</a></div>';
            html += '<div class="comment-item-content">' + messageHTML + mediaHTML + '</div>';
            html += '<ul class="comment-item-children"></ul>';
            html += '</div>'
            html += '</li>';
            if (!!parent.dom) {
                parent.dom.insertAdjacentHTML(parent.insert, html);
            } else {
                comment.unload.push(post);
            }
        },

        // 获取评论列表
        getlist: function(){
            document.querySelector('.disqus').style.display = 'none';
            document.querySelector('.comment').style.display = 'block';
            if(!this.count || !!this.offsetTop){
                if(disqus_loaded){
                    document.getElementById('comment').dataset.tips = '正在加载简单评论框……';
                }
                var xhrListPosts = new XMLHttpRequest();
                xhrListPosts.open('GET', site.api + '/disqus/getcomments?link=' + encodeURIComponent(page.url) + '&cursor=' + this.next, true);
                xhrListPosts.send();
                xhrListPosts.onreadystatechange = function() {
                    if (xhrListPosts.readyState == 4 && xhrListPosts.status == 200) {
                        document.getElementById('comment').dataset.tips = '';
                        var res = JSON.parse(xhrListPosts.responseText);
                        if (res.code === 0) {
                            comment.thread = res.thread;
                            document.querySelector('.comment').classList.remove('loading')
                            document.querySelector('.comment-tips-link').setAttribute('href', res.link);
                            if (res.response == null) {
                                comment.count = res.posts;
                                return;
                            }
                            var posts = !!comment.unload ? res.response.concat(comment.unload) : res.response;
                            comment.root = [];
                            comment.unload = [];
                            posts.forEach(function(post, i){
                                comment.load(post,i);
                                if(!post.parent){
                                    comment.root.unshift(post.id);
                                }
                            });
                            // 兼容非首次获取
                            if( res.cursor.hasPrev ){
                                comment.root.forEach(function(item){
                                    document.querySelector('.comment-list').appendChild(document.getElementById('comment-' + item));
                                })
                                window.scrollTo(0, comment.offsetTop);
                                comment.offsetTop = undefined;
                            } else {
                                comment.count = res.posts;
                                document.getElementById('comment-count').innerHTML = res.posts + ' 条评论';
                            }

                            var loadmore = document.querySelector('.comment-loadmore');
                            comment.next = res.cursor.hasNext ? res.cursor.next : '';
                            if ( res.cursor.hasNext ){
                                if( !!loadmore ){
                                    loadmore.classList.remove('loading');
                                } else {
                                    document.querySelector('.comment').insertAdjacentHTML('beforeend', '<a href="javascript:;" class="comment-loadmore">加载更多</a>');
                                }
                                document.querySelector('.comment-loadmore').addEventListener('click', function(){
                                    this.classList.add('loading');
                                    comment.offsetTop = document.documentElement.scrollTop || document.body.scrollTop;
                                    comment.getlist();
                                }, { once: true });
                            } else {
                                if( !!loadmore ){
                                    loadmore.parentNode.removeChild(loadmore);
                                }
                            }

                            timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');
                            if (/^#disqus|^#comment/.test(location.hash) && !res.cursor.hasPrev ) {
                                window.scrollTo(0, document.querySelector(location.hash).offsetTop);
                            }
                        } else if ( res.code === 2){
                            var createHTML = '<div class="comment-header">';
                            createHTML += '    <span class="comment-header-item">创建 Thread<\/span>';
                            createHTML += '<\/div>';
                            createHTML += '<div class="comment-thread-form">';
                            createHTML += '<p>由于 Disqus 没有本文的相关 Thread，故需先创建 Thread<\/p>';
                            createHTML += '<div class="comment-form-item"><label class="comment-form-label">url:<\/label><input class="comment-form-input" id="thread-url" name="url" value="'+site.home+page.url+'" \/><\/div>';
                            createHTML += '<div class="comment-form-item"><label class="comment-form-label">title:<\/label><input class="comment-form-input" id="thread-title" name="title" value="'+page.title+'" \/><\/div>';
                            createHTML += '<div class="comment-form-item"><label class="comment-form-label">slug:<\/label><input class="comment-form-input" id="thread-slug" name="slug" placeholder="（别名，选填）" \/><\/div>';
                            createHTML += '<div class="comment-form-item"><label class="comment-form-label">message:<\/label><textarea class="comment-form-textarea" id="thread-message" name="message">'+page.desc+'<\/textarea><\/div>';
                            createHTML += '<button id="thread-submit" class="comment-form-submit">提交<\/button><\/div>'
                            document.querySelector('.comment').classList.remove('loading')
                            document.querySelector('.comment').innerHTML = createHTML;
                            document.getElementById('thread-submit').addEventListener('click',function(){
                                var threadQuery = 'url=' + document.getElementById('thread-url').value + '&title=' + document.getElementById('thread-title').value + '&slug=' + document.getElementById('thread-slug').value + '&message=' + document.getElementById('thread-message').value;
                                var xhrcreateThread = new XMLHttpRequest();
                                xhrcreateThread.open('POST', site.api + '/disqus/createthread', true);
                                xhrcreateThread.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                xhrcreateThread.send(threadQuery);
                                xhrcreateThread.onreadystatechange = function() {
                                    if (xhrcreateThread.readyState == 4 && xhrcreateThread.status == 200) {
                                        var resp = JSON.parse(xhrcreateThread.responseText);
                                        if( resp.code === 0 ) {
                                            alert('创建 Thread 成功！');
                                            location.reload();
                                        }
                                    }
                                }
                            },true);
                        }
                    }
                }
                xhrListPosts.onload = function(){
                    comment.form();
                }
            }

        },

        // 回复框
        show: function(e){

            // 移除已显示回复框
            var box = document.querySelector('.comment-item .comment-box');
            if( box ){
                box.parentNode.removeChild(box);
                var cancel = document.querySelector('.comment-item-cancel')
                cancel.outerHTML = cancel.outerHTML.replace('cancel','reply');
            }

            // 显示回复框
            var $this = e.currentTarget;
            var item = $this.closest('.comment-item');
            var parentId = item.dataset.id;
            var parentName = item.dataset.name;
            var commentBox = comment.box.replace(/emoji-input/g,'emoji-input-'+parentId).replace(/upload-input/g,'upload-input-'+parentId).replace(/加入讨论……|写条留言……/,'@'+parentName).replace(/加入讨论……|写条留言……/,'').replace(/<label class="comment-actions-label exit"(.|\n)*<\/label>\n/,'').replace(/<input id="tips-input"(.|\n)*<\/label>\n/,'');
            item.querySelector('.comment-item-main .comment-item-children').insertAdjacentHTML('beforebegin', commentBox);
            $this.outerHTML = $this.outerHTML.replace('reply','cancel');
            guest.init();


            // 取消回复
            item.querySelector('.comment-item-cancel').addEventListener('click', function(){
                var box = item.querySelector('.comment-box');
                box.parentNode.removeChild(box);
                this.outerHTML = this.outerHTML.replace('cancel','reply');
                comment.form();
            }, false);

            // 事件绑定
            comment.form();
        },

        // 上传图片
        upload: function(e){
            var file = e.currentTarget;
            var item = file.closest('.comment-box');
            var progress = item.querySelector('.comment-image-progress');
            var loaded = item.querySelector('.comment-image-loaded');
            var wrapper = item.querySelector('.comment-form-wrapper');
            if(file.files.length === 0){
                return;
            }

            //以文件大小识别是否为同张图片
            var size = file.files[0].size;
            if( comment.imagesize.indexOf(size) == -1 ){
                comment.imagesize.push(size);
                progress.style.width = '80px';
            } else {
                console.info('请勿选择已存在的图片！');
                return;
            }

            // 展开图片上传界面
            wrapper.classList.add('expanded');

            // 图片上传请求
            var data = new FormData();
            data.append('file', file.files[0] );
            var filename = file.files[0].name;

            var xhrUpload = new XMLHttpRequest();
            xhrUpload.onreadystatechange = function(){
                if(xhrUpload.readyState == 4 && xhrUpload.status == 200){
                    try {
                        var resp = JSON.parse(xhrUpload.responseText);
                        if( resp.code == 0 ){
                            var imageUrl = resp.response[filename].url;
                            var image = new Image();
                            image.src = resp.url+'?imageView2/2/h/200';
                            image.onload = function(){
                                item.querySelector('[data-image-size="'+size+'"] .comment-image-object').setAttribute('src', image.src);
                                item.querySelector('[data-image-size="'+size+'"]').dataset.imageUrl = imageUrl;
                                item.querySelector('[data-image-size="'+size+'"]').classList.remove('loading');
                                item.querySelector('[data-image-size="'+size+'"]').addEventListener('click', comment.remove, false);
                            }
                        }
                    } catch (e){
                        var resp = {
                            status: 'error',
                            data: 'Unknown error occurred: [' + xhrUpload.responseText + ']'
                        };
                    }
                }
            };

            // 上传进度条
            xhrUpload.upload.addEventListener('progress', function(e){
                loaded.style.width = Math.ceil((e.loaded/e.total) * 100)+ '%';
            }, false);

            // 上传完成
            xhrUpload.upload.addEventListener("load", function(e){
                loaded.style.width = 0;
                progress.style.width = 0;
                var imageItem = '<li class="comment-image-item loading" data-image-size="' + size + '"><img class="comment-image-object" src="'+loadingsvg+'" /></li>';
                item.querySelector('.comment-image-list').insertAdjacentHTML('beforeend', imageItem);
            }, false);

            xhrUpload.open('POST', site.api + '/disqus/upload', true);

            xhrUpload.send(data);
        },

        //移除图片
        remove: function(e){
            var item = e.currentTarget.closest('.comment-image-item');
            var wrapper = e.currentTarget.closest('.comment-form-wrapper');
            item.parentNode.removeChild(item);
            comment.imagesize = [];
            var imageArr = document.getElementsByClassName('comment-image-item');
            [].forEach.call(imageArr, function(item, i){
                comment.imagesize[i] = item.dataset.imageSize;
            });
            if(comment.imagesize.length == 0){
                wrapper.classList.remove('expanded');
            }
        }

    }

    var guest = new Guest();
    var comment =  new Comment();

    if ( page.url == '/archive.html' ){
        document.querySelector('.page-search-input').addEventListener('keyup',function(e){
            var archive = document.getElementsByClassName('archive-item-link');
            for (var i = 0; i < archive.length; i++){
                if( archive[i].title.toLowerCase().indexOf(this.value.toLowerCase()) > -1 ) {
                    archive[i].closest('li').style.display = 'block';
                } else {
                    archive[i].closest('li').style.display = 'none';
                }
            }
            if(e.keyCode == 13){
                location.href = '/search.html?keyword='+this.value;
            }
        })
    }

    if ( page.url == '/search.html' ){
        var keyword = getQuery('keyword');
        var searchData;
        var input = document.querySelector('.search-input');
        var result = document.querySelector('.search-result');
        var xhrSearch = new XMLHttpRequest();
        xhrSearch.open('GET', '/search.json', true);
        xhrSearch.onreadystatechange = function() {
            if (xhrSearch.readyState == 4 && xhrSearch.status == 200) {
                searchData = JSON.parse(xhrSearch.responseText);
                if( keyword ){
                    input.value = decodeURI(keyword);
                    search(decodeURI(keyword));
                }
                input.placeholder = "请输入关键词，回车搜索";
            }
        }
        xhrSearch.send(null);

        document.querySelector('.search-input').addEventListener('keyup',function(e){
            if(e.keyCode == 13){
                search(decodeURI(this.value));
            }
        })

        function search(keyword){
            result.innerHTML = '';
            var title = '搜索：' + keyword + ' | Fooleap\'s Blog';
            var url = '/search.html?keyword=' + keyword;
            var total = result.length;
            var html = '';
            searchData.forEach(function(item){
                var postContent = item.title + item.tags.join('') + item.content;
                if(postContent.toLowerCase().indexOf(keyword.toLowerCase()) > -1){
                    var index = item.content.toLowerCase().indexOf(keyword.toLowerCase());
                    var realKeyword = item.content.substr(index, keyword.length);
                    var first = index > 75 ? index - 75 : 0;
                    var last = first + 150;
                    html += '<div class="search-result-item">'+
                        '      <i class="search-result-thumb" data-src="'+item.thumb+'" style="background-image:url('+item.thumb+')"></i>'+
                        '      <div class="search-result-content">'+
                        '        <div class="search-result-header">'+
                        '           <div class="search-result-title"><a class="search-result-link" target="_blank" href="'+item.url+'">'+item.title+'</a></div>'+
                        '           <div class="search-result-comment"></div>'+
                        '        </div>'+
                        '        <div class="search-result-desc">'+item.content.slice(first,last).replace(new RegExp(realKeyword, 'g'),'<span class="search-result-highlight">'+realKeyword+'</span>')+'</div>'+
                        '      </div>'+
                        '    </div>';
                }
            })
            result.innerHTML = html;
            document.title = title;
            history.replaceState({ 
                "title": title,
                "url": url 
            }, title, url);
        }

    }


    if ( page.url == '/tags.html' ){
        var keyword = getQuery('keyword');
        var tagsData;
        var xhrPosts = new XMLHttpRequest();
        xhrPosts.open('GET', '/posts.json', true);
        xhrPosts.onreadystatechange = function() {
            if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
                tagsData = JSON.parse(xhrPosts.responseText);
                if(keyword){
                    tags(decodeURI(keyword));
                }
            }
        }
        xhrPosts.send(null);
        function tags (keyword){
            var title = '标签：' + keyword + ' | Fooleap\'s Blog';
            var url = '/tags.html?keyword=' + keyword;
            var tagsTable = document.getElementById('tags-table');
            tagsTable.style.display = 'table';
            tagsTable.querySelector('thead tr').innerHTML = '<th colspan=2>以下是标签为“'+keyword+'”的所有文章</th>';
            var html = '';
            tagsData.forEach(function(item){
                if( item.tags.indexOf(keyword) > -1){
                    var date = item.date.slice(0,10).split('-');
                    date = date[0] + ' 年 ' + date[1] + ' 月 ' + date[2] + ' 日';
                    html += '<tr><td><time>'+date+'</time></td><td><a href="'+item.url+'" title="'+item.title+'">'+item.title+'</a></td></tr>';
                }
            })
            tagsTable.getElementsByTagName('tbody')[0].innerHTML = html;
            document.title = title;
            history.replaceState({ 
                "title": title,
                "url": url 
            }, title, url);
        }
        var tagLinks = document.getElementsByClassName('post-tags-item');
        var tagCount = tagLinks.length;
        for (var i = 0; i < tagCount; i++){
            tagLinks[i].addEventListener('click', function(e){
                tags(e.currentTarget.title);
                e.preventDefault();
            }, false);
        }
    }

    if(page.url == '/tech.html' || page.url == '/life.html'){
        var pageNum = getQuery('page') ? parseInt(getQuery('page')) : 1;
        var postData, posts = [];
        var xhrPosts = new XMLHttpRequest();
        xhrPosts.open('GET', '/posts.json', true);
        xhrPosts.onreadystatechange = function() {
            if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
                var category = page.url.slice(1, 5);
                postData = JSON.parse(xhrPosts.responseText);
                postData.forEach(function(item){
                    if( item.category == category ){
                        posts.push(item);
                    }
                })
                turn(pageNum);
            }
        }
        xhrPosts.send(null);

        function turn(pageNum){
            var cat = page.url == '/tech.html' ? '技术' : '生活';
            var title = pageNum == 1 ? cat + ' | Fooleap\'s Blog' : cat + '：第' + pageNum + '页 | Fooleap\'s Blog';
            var url = pageNum == 1 ? page.url : page.url + '?page=' + pageNum;
            var html = '';
            var total = posts.length;
            var first = (pageNum - 1) * 10;
            var last = total > pageNum * 10 ? pageNum * 10 : total;
            for( var i = first; i < last; i++){
                var item = posts[i];
                html += '<article class="post-item">'+
                    '    <i class="post-item-thumb" data-src="'+item.thumb+'" style="background-image:url('+item.thumb+')"></i>'+
                    '    <section class="post-item-summary">'+
                    '    <h3 class="post-item-title"><a class="post-item-link" href="'+item.url+'" title="'+item.title+'">'+item.title+'</a></h3>'+
                    '    <abbr class="post-item-date timeago" datetime="'+item.date+'"></abbr>'+
                    '    </section>'+
                    '    <a class="post-item-comment" title="查看评论" data-disqus-url="'+item.url+'" href="'+item.url+'#comments"></a>'+
                    '</article>';
            }

            var totalPage = Math.ceil(total / 10);
            var prev = pageNum > 1 ? pageNum - 1 : 0;
            var next = pageNum < totalPage ? pageNum + 1 : 0;
            var prevLink = !!prev ? '<a class="pagination-item-link" href="'+page.url+'?page='+ prev +'" data-page="'+prev+'">&laquo; 较新文章</a>' : '';
            var nextLink = !!next ? '<a class="pagination-item-link" href="'+page.url+'?page='+ next +'" data-page="'+next+'">&laquo; 较旧文章</a>' : '';
            html+='<nav class="pagination">'+
                '<ul class="pagination-list">'+
                '<li class="pagination-item">'+nextLink+'</li>'+
                '<li class="pagination-item">'+pageNum+' / '+totalPage+'</li>'+
                '<li class="pagination-item">'+prevLink+'</li>'+
                '</ul>'+
                '</nav>';

            scrollTo(0, 0);
            document.querySelector('.post-list').innerHTML = (html);
            timeago().render(document.querySelectorAll('.timeago'), 'zh_CN');
            comment = new Comment();
            var link = document.getElementsByClassName('pagination-item-link');
            for( var i = 0; i < link.length; i++ ){
                link[i].addEventListener('click',function(e){
                    var pageNum = parseInt(e.currentTarget.dataset.page);
                    turn(pageNum);
                    e.preventDefault();
                })
            }
            document.title = title;
            history.replaceState({ 
                "title": title,
                "url": url 
            }, title, url);
        }
    }

});

// 统计
setTimeout(function() {
    if ( site.home === location.origin ) {
        var _hmt = _hmt || [];
        (function() {
            var hm = document.createElement('script');
            hm.src = '//hm.baidu.com/hm.js?'+site.tongji;
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        })();

        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', site.analytics, 'auto');
        ga('send', 'pageview');
    }
}, 1000);
