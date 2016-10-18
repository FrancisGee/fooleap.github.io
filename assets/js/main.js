// timeago https://goo.gl/jlkyIS
function timeAgo(selector) {
    var templates = {
        prefix: '',
        suffix: '前',
        seconds: '几秒',
        minute: '1分钟',
        minutes: '%d分钟',
        hour: '1小时',
        hours: '%d小时',
        day: '1天',
        days: '%d天',
        month: '1个月',
        months: '%d个月',
        year: '1年',
        years: '%d年'
    };
    var template = function(t, n) {
        return templates[t] && templates[t].replace(/%d/i, Math.abs(Math.round(n)));
    };

    var timer = function(time) {
        if (!time) return;
        time = time.replace(/\.\d+/, '');
        time = time.replace(/-/, '/').replace(/-/, '/');
        time = time.replace(/T/, ' ').replace(/Z/, ' UTC');
        time = time.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
        time = new Date(time * 1000 || time);

        var now = new Date();
        var seconds = ((now.getTime() - time) * .001) >> 0;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;
        var years = days / 365;

        return templates.prefix + (
            seconds < 45 && template('seconds', seconds) || seconds < 90 && template('minute', 1) || minutes < 45 && template('minutes', minutes) || minutes < 90 && template('hour', 1) || hours < 24 && template('hours', hours) || hours < 42 && template('day', 1) || days < 30 && template('days', days) || days < 45 && template('month', 1) || days < 365 && template('months', days / 30) || years < 1.5 && template('year', 1) || template('years', years)) + templates.suffix;
    };

    var elements = document.querySelectorAll('.timeago');
    for (var i in elements) {
        var $this = elements[i];
        if (typeof $this === 'object') {
            $this.innerHTML = timer($this.getAttribute('title') || $this.getAttribute('datetime'));
        }
    }
    setTimeout(timeAgo, 60000);
}
timeAgo();

// 判断是否支持 Flash http://goo.gl/cg206i
function isFlashSupported() {
    if (window.ActiveXObject) {
        try {
            if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash'))
                return true;
        } catch (e) {}
    }
    return navigator.plugins['Shockwave Flash'] ? true : false;
}

// 菜单
var nav = document.getElementById('navigation');
var navList = document.querySelector('.navigation-list');
var menu = document.getElementById('menu');
var container = document.querySelector('.container');

function blogMenu() {
    if (navList.classList.contains('hide')) {
        navList.classList.remove('hide');
        menu.classList.remove('icon-menu');
        navList.classList.add('show');
        menu.classList.add('icon-cancel');
    } else {
        navList.classList.remove('show');
        menu.classList.remove('icon-cancel');
        navList.classList.add('hide');
        menu.classList.add('icon-menu');
    }
}

function hideMenu() {
    if (navList.classList.contains('show')) {
        navList.classList.remove('show');
        menu.classList.remove('icon-cancel');
        navList.classList.add('hide');
        menu.classList.add('icon-menu');
    }
}
if (document.addEventListener) {
    nav.addEventListener('click', blogMenu, false);
} else {
    nav.attachEvent('onclick', blogMenu);
}
if (document.addEventListener) {
    container.addEventListener('click', hideMenu, false);
} else {
    container.attachEvent('onclick', hideMenu)
}

var links = document.querySelectorAll('a');
var clientWidth = document.documentElement.clientWidth;
var clientHeight = document.documentElement.clientHeight;

// Vim 键绑定
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

// 返回顶部按钮
var backToTop = document.getElementById('backtotop');

function toggleToTop() {
    var pos = document.documentElement.scrollTop || document.body.scrollTop;
    if (pos > clientHeight) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
}

function scrollToTop() {
    window.scrollTo(0, 0)
}
if (document.addEventListener) {
    document.addEventListener('scroll', toggleToTop, false);
    backToTop.addEventListener('click', scrollToTop, false);
} else {
    window.onscroll = toggleToTop;
    backToTop.attachEvent('onclick', scrollToTop);
}

// 目录
var toc = document.getElementById('toc');
var subTitles = document.querySelectorAll('.main-content h2,h3');
var sectionIds = [];
var sections = [];
if (toc) {
    var tocFixed = clientWidth / 2 - 370 - toc.offsetWidth;
    if (tocFixed < 15) {
        toc.classList.add('hide');
    } else {
        toc.style.left = tocFixed + 'px';
    }
}

function tocShow() {
    if (toc) {
        for (var i = 0; i < subTitles.length; i++) {
            sectionIds.push(subTitles[i].getAttribute('id'));
            sections.push(subTitles[i].offsetTop);
        }
        if (document.addEventListener) {
            document.addEventListener('scroll', tocScroll, false);
        } else {
            window.onscroll = tocScroll;
        }
    }
}

function tocScroll() {
    var pos = document.documentElement.scrollTop || document.body.scrollTop;
    var lob = document.body.offsetHeight - subTitles[subTitles.length - 1].offsetTop;
    for (var i = 0; i < sections.length; i++) {
        if (i === subTitles.length - 1 && clientHeight > lob) {
            pos = pos + (clientHeight - lob);
        }
        if (sections[i] < pos && sections[i] < pos + clientHeight) {
            if (document.querySelector('.active')) {
                document.querySelector('.active').classList.remove('active');
            }
            document.querySelector('[href="#' + sectionIds[i] + '"').classList.add('active');
        }
    }
}

// 参考资料、站外链接
if (document.querySelectorAll('h2')[document.querySelectorAll('h2').length - 1].innerHTML === '参考资料') {
    document.querySelectorAll('h2')[document.querySelectorAll('h2').length - 1].insertAdjacentHTML('afterend', '<ol id="refs"></ol>');
}
for (var i = 0; i < links.length; i++) {
    if (links[i].hostname != location.hostname && /^javascript/.test(links[i].href) === false) {
        var numText = links[i].innerHTML;
        var num = numText.substring(1, numText.length - 1);
        if (!isNaN(num) && num) {
            var note = 'note-' + num;
            var ref = 'ref-' + num;
            var noteTitle = links[i].getAttribute('title');
            var noteHref = links[i].getAttribute('href');
            links[i].setAttribute('href', '#' + note);
            links[i].setAttribute('id', ref);
            links[i].setAttribute('class', 'ref');
            links[i].outerHTML = '<sup>' + links[i].outerHTML + '</sup>';
            document.getElementById('refs').insertAdjacentHTML('beforeend', '<li class="note"><a href="#' + ref + '">&and;</a> <a href="' + noteHref + '" title="' + noteTitle + '" id="' + note + '" class="exf-text" target="_blank">' + noteTitle + '</a></li>');
        } else {
            links[i].setAttribute('target', '_blank');
        }
    }
}
var noteLinks = document.querySelectorAll('a[href^="#note"], a[href^="#ref"]');

function linkFocus() {
    for (var i = 0; i < noteLinks.length; i++) {
        noteLinks[i].parentElement.style.backgroundColor = '';
    }
    var href = this.href.split('#')[1];
    document.getElementById(href).parentElement.style.backgroundColor = 'rgb(235, 235, 235)';
}
for (var i = 0; i < noteLinks.length; i++) {
    if (document.addEventListener) {
        noteLinks[i].addEventListener('click', linkFocus, false);
    } else {
        noteLinks[i].onclick = linkFocus;
    }
}

// Disqus 评论
// 评论计数
var commentLinks = document.querySelectorAll('.disqus-comment-count');
var commentLink = '';
if (commentLinks.length > 0) {
    for (var i = 0; i < commentLinks.length; i++) {
        if (i > 0) {
            commentLink += ',';
        }
        commentLink += commentLinks[i].getAttribute('data-disqus-url').slice(1);
    }
    var xhrCommentCount = new XMLHttpRequest();
    xhrCommentCount.open('GET', 'http://api.fooleap.org/disqus/list?link=' + commentLink, true);
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
}

var disqusShortName = "fooleap";
var disqusPublicKey = "xDtZqWt790WMwHgxhIYxG3V9RzvPXzFYZ7izdWDQUiGQ1O3UaNg0ONto85Le7rYN";
var windowWidth = window.innerWidth;
if (windowWidth < 414) {
    var postTitles = document.getElementsByClassName('post-title');
    var postWidth = windowWidth - 88;
    for (var i = 0; i < postTitles.length; i++) {
        postTitles[i].style.width = (postWidth + 'px');
    }
}

// 显示评论按钮
var commentBtn = document.querySelector('.show-comments');

function showComments() {
    (function() {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = 'https://' + disqusShortName + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
    commentBtn.parentNode.removeChild(commentBtn);
}
if (commentBtn) {
    if (document.addEventListener) {
        commentBtn.addEventListener('click', showComments, false);
    } else {
        commentBtn.attachEvent('onclick', showComments);
    }
}

//评论
function getComments(res) {
    if (res.code === 0) {
        if (res.response.length == 0) {
            document.getElementById('comments').className = '';
            return;
        }
        for (var i = 0; i < res.response.length; i++) {
            var post = res.response[i];
            var result = '';
            var profileUrl = post.author.profileUrl ? post.author.profileUrl : 'javascript:void(0);';
            var url = post.author.url ? post.author.url : profileUrl;
            var date = new Date(post.createdAt).getTime().toString().slice(0, -3);
            var image = '',
                imageList = '';
            var images = post.media;
            if (images.length > 0) {
                for (var i = 0; i < images.length; i++) {
                    image += '<a target="_blank" href="https:' + images[i].url + '" ><img src="https:' + images[i].thumbnailURL + '"></a>';
                }
                imageList = '<div class="post-image">' + image + '</div>';
            }
            var html = '<li class="comment-item" id="comment-' + post.id + '">';
            html += '<a target="_blank" class="avatar" href="' + url + '"><img src="' + post.author.avatar.cache + '"></a>';
            html += '<div class="post-header"><a target="_blank" href="' + url + '">' + post.author.name + '</a><span class="bullet"> • </span><span class="timeago" title="' + date + '">' + post.createdAt + '</span><span class="bullet"> • </span><a class="comment-reply" href="javascript:void(0)" onclick="showCommentForm(this)">回复</a></div>';
            html += '<div class="post-content">' + post.message + imageList + '</div>';
            html += '<div class="comment-form cf hide" data-parent="' + post.id + '" data-id="' + post.thread + '"><span class="avatar"><img src="http://gravatar.duoshuo.com/avatar/?d=a.disquscdn.com/images/noavatar92.png"></span><div class="textarea-wrapper"><textarea class="comment-form-textarea" placeholder="回复' + post.author.name + '…" onfocus="editComment(this)" onblur="editComment(this)"></textarea><div class="post-actions">' + document.querySelector('.post-actions').innerHTML + '</div></div><div class="comment-input-group"><input class="comment-form-input comment-form-name" type="text" placeholder="请输入您的名字（必填）"><input class="comment-form-input comment-form-email" type="email" placeholder="请输入您的邮箱（必填）" onblur="verifyEmail(this)"><input class="comment-form-input comment-form-url" type="text" placeholder="请输入您的网址（可选）"></div><button title="若有回复，您将得到邮件提醒" class="comment-form-submit" onclick="replyComment(this)"><i class="icon icon-proceed"></i></button><div class="comment-form-alert"></div></div>'
            html += '<ul class="post-children"></ul>';
            html += '</li>';
            result += html;
            document.getElementById('comments').className = '';
            if (post.parent == null) {
                document.getElementById('comments').insertAdjacentHTML('afterbegin', result);
            } else {
                if (document.querySelector('#comment-' + post.parent + ' .post-children')) {
                    document.querySelector('#comment-' + post.parent + ' .post-children').insertAdjacentHTML('beforeend', result);
                }
            }
        }
        timeAgo();
    } else {
        document.getElementById('comments').className = '';
        return;
    }
}

//获取文章评论
if (document.querySelector('#comments')) {
    var url = location.pathname.slice(1);
    var title = document.querySelector('title').innerText;
    var xhrDetails = new XMLHttpRequest();
    xhrDetails.open('GET', 'http://api.fooleap.org/disqus/getdetails?link=' + url, true);
    xhrDetails.send();
    xhrDetails.onreadystatechange = function() {
        if (xhrDetails.readyState == 4 && xhrDetails.status == 200) {
            var data = JSON.parse(xhrDetails.responseText);
            if (data.code == 0) {
                document.querySelector('.comment-form').setAttribute('data-id', data.response.id);
                document.querySelector('.comment-header-count').innerHTML = data.response.posts + ' comments';
            } else {
                //获取失败则创建 thread
                if (location.host == "blog.fooleap.org") {
                    var xhrcreateThread = new XMLHttpRequest();
                    xhrcreateThread.open('POST', 'http://api.fooleap.org/disqus/createthread?url=' + url + '&title=' + title, true);
                    xhrcreateThread.send();
                }
            }
        }
    }
    //获取评论列表
    var xhrComment = new XMLHttpRequest();
    xhrComment.open('GET', 'http://api.fooleap.org/disqus/getcomments?link=' + location.pathname.slice(1), true);
    xhrComment.send();
    xhrComment.onreadystatechange = function() {
        if (xhrComment.readyState == 4 && xhrComment.status == 200) {
            getComments(JSON.parse(xhrComment.responseText));
        }
    }
}

//验证邮箱
function verifyEmail(el) {
    var form = el.parentElement.parentElement;
    var avatar = form.querySelector('.avatar img');
    var name = form.querySelector('.comment-form-input');
    var alert = form.querySelector('.comment-form-alert');
    if (el.value != '') {
        if (/^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i.test(el.value)) {
            alert.innerHTML = '';
            var xhrGravatar = new XMLHttpRequest();
            xhrGravatar.open('GET', 'http://api.fooleap.org/disqus/getgravatar?email=' + el.value + '&name=' + name.value, true);
            xhrGravatar.send();
            xhrGravatar.onreadystatechange = function() {
                if (xhrGravatar.readyState == 4 && xhrGravatar.status == 200) {
                    avatar.src = xhrGravatar.responseText;
                }
            }
        } else {
            alert.innerHTML = '您所填写的邮箱地址有误！';
        }
    }
}

//编辑评论
function editComment(el) {
    el.className = 'comment-form-textarea noempty';
    //el.className = el.value != '' ? 'comment-form-textarea noempty' : 'comment-form-textarea';
    el.parentElement.className = el.parentElement.className == 'textarea-wrapper' ? 'textarea-wrapper focus' : 'textarea-wrapper'
}

//提交加载
function htmlComment(data) {
    var post = data.response;
    var url = post.author.url ? post.author.url : 'javascript:void(0);';
    var date = new Date(post.createdAt).getTime().toString().slice(0, -3);
    var html = '<li class="comment-item" id="comment-' + post.id + '">';
    html += '<a target="_blank" class="avatar" href="' + url + '"><img src="' + post.author.avatar.cache + '"></a>';
    html += '<div class="post-header"><a target="_blank" href="' + url + '">' + post.author.name + '</a><span class="bullet"> • </span><span class="timeago" title="' + date + '">' + post.createdAt + '</span><span class="bullet"> • </span><a class="comment-reply" href="javascript:void(0)" onclick="showCommentForm(this)">回复</a></div>';
    html += '<div class="post-content">' + post.message + '</div>';
    html += '<div class="comment-form cf hide" data-parent="' + post.id + '" data-id="' + post.thread + '"><span class="avatar"><img src="http://gravatar.duoshuo.com/avatar/?d=a.disquscdn.com/images/noavatar92.png"></span><div class="textarea-wrapper"><textarea class="comment-form-textarea" placeholder="回复' + post.author.name + '…" onfocus="editComment(this)" onblur="editComment(this)"></textarea><div class="post-actions">' + document.querySelector('.post-actions').innerHTML + '</div></div><div class="comment-input-group"><input class="comment-form-input comment-form-name" type="text" placeholder="请输入您的名字（必填）"><input class="comment-form-input comment-form-email" type="email" placeholder="请输入您的邮箱（必填）" onblur="verifyEmail(this)"><input class="comment-form-input comment-form-url" type="text" placeholder="请输入您的网址（可选）"></div><button title="若有回复，您将得到邮件提醒" class="comment-form-submit" onclick="replyComment(this)"><i class="icon icon-proceed"></i></button><div class="comment-form-alert"></div></div>'
    html += '<ul class="post-children"></ul>';
    html += '</li>';
    return html;
}

function removeComment() {
    var node = document.querySelector('.comment-item.transparent');
    node.parentNode.removeChild(node);
}

//发表预加载 
function previewComment(parent, avatar, name, message, url) {
    var url = url == '' ? 'javascript:void(0);' : url;
    var html = '<li class="comment-item transparent">';
    html += '<a target="_blank" class="avatar"><img src="' + avatar + '"></a>';
    html += '<div class="post-header"><a target="_blank" href="' + url + '">' + name + '</a><span class="bullet"> • </span><span class="timeago">几秒前</span><span class="bullet"> • </span><a class="comment-reply" href="javascript:void(0)" onclick="showCommentForm(this)">回复</a></div>';
    html += '<div class="post-content">' + message + '</div>';
    html += '<ul class="post-children"></ul>';
    html += '</li>';
    if (parent == null) {
        document.getElementById('comments').insertAdjacentHTML('afterbegin', html);
        document.getElementById('message').value = '';
    } else {
        document.querySelector('#comment-' + parent + ' .post-children').insertAdjacentHTML('beforeend', html);
        document.querySelector('#comment-' + parent + ' .comment-form-textarea').value = '';
    }
}

//发表评论
function postComment(parent) {
    var id = document.querySelector('.comment-form').getAttribute('data-id');
    var name = document.getElementById('author_name').value;
    var email = document.getElementById('author_email').value;
    var url = document.getElementById('author_url').value;
    var message = document.getElementById('message').value;
    var avatar = document.querySelector('.avatar img').src;
    var count = parseInt(document.querySelector('.comment-header-count').innerText.slice(0, 1)) + 1 + ' comments';
    previewComment(parent, avatar, name, message, url);

    var xhrPostComment = new XMLHttpRequest();
    xhrPostComment.open('POST', 'http://api.fooleap.org/disqus/postcomment', true);
    xhrPostComment.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhrPostComment.send('id=' + id + '&message=' + message + '&name=' + name + '&email=' + email + '&url=' + url);
    xhrPostComment.onreadystatechange = function() {
        if (xhrPostComment.readyState == 4 && xhrPostComment.status == 200) {
            var data = JSON.parse(xhrPostComment.responseText);
            if (data.code === 0) {
                var result = htmlComment(data);
                document.getElementById('comments').insertAdjacentHTML('afterbegin', result);
                document.querySelector('.comment-header-count').innerText = count;
                timeAgo();
                removeComment();
            } else if (data.code === 2) {
                if (data.response.indexOf('email') > -1) {
                    alert('请输入正确的名字或邮箱！');
                    removeComment();
                    document.getElementById('message').value = message;
                    return;
                } else if (data.response.indexOf('message') > -1) {
                    alert('评论不能为空！');
                    removeComment();
                    document.getElementById('message').value = message;
                    return;
                }
            }
        }
    }
}

//显示回复框
function showCommentForm(el) {
    var post = el.parentElement.parentElement;
    var commentForms = document.querySelectorAll('.comment-form');
    for (var i = 1; i < commentForms.length; i++) {
        commentForms[i].className = 'comment-form cf hide';
    }
    el.innerHTML = el.innerHTML == '回复' ? '取消回复' : '回复';
    if (el.innerHTML == '回复') {
        post.querySelector('.comment-form').className = 'comment-form cf hide';
    } else {
        post.querySelector('.comment-form').className = 'comment-form cf';
    }
    for (var i = 1; i < commentForms.length; i++) {
        if (commentForms[i].className == 'comment-form cf hide') {
            commentForms[i].parentElement.querySelector('.comment-reply').innerHTML = "回复";
        }
    }
}

/**   
 * 在光标的位置插入图片   
 * @param {Object} myField  textarea的Id 
 * @param {Object} myValue  插入的字符 
 */

function AddOnPos(myField, myValue) {
    myField = myField.parentElement.parentElement.parentElement.parentElement.querySelector('.comment-form-textarea');
    //IE support     
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        myValue = "{" + myValue + "}";
        sel.text = myValue;
        sel.select();
    }

    //MOZILLA/NETSCAPE support     
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        // save scrollTop before insert     
        var restoreTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        if (restoreTop > 0) {
            // restore previous scrollTop     
            myField.scrollTop = restoreTop;
        }
        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
        myField.focus();
    }
}

//回复评论
function replyComment(el) {
    var form = el.parentElement;
    var id = form.getAttribute('data-id');
    var parent = form.getAttribute('data-parent');
    var name = form.querySelector('.comment-form-name').value;
    var email = form.querySelector('.comment-form-email').value;
    var url = form.querySelector('.comment-form-url').value;
    var message = form.querySelector('.comment-form-textarea').value;
    var avatar = form.querySelector('.avatar img').src;
    var title = document.querySelector('title').innerText;
    var link = location.pathname.slice(1);
    var count = parseInt(document.querySelector('.comment-header-count').innerText.slice(0, 1)) + 1 + ' comments';
    var xhrReplyComment = new XMLHttpRequest();
    previewComment(parent, avatar, name, message, url);
    xhrReplyComment.open('POST', 'http://api.fooleap.org/disqus/postcomment', true);
    xhrReplyComment.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhrReplyComment.send('id=' + id + '&parent=' + parent + '&message=' + message + '&name=' + name + '&email=' + email + '&url=' + url);
    xhrReplyComment.onreadystatechange = function() {
        if (xhrReplyComment.readyState == 4 && xhrReplyComment.status == 200) {
            var data = JSON.parse(xhrReplyComment.responseText);
            if (data.code === 0) {
                var result = htmlComment(data);
                form.className = 'comment-form cf hide';
                form.nextSibling.insertAdjacentHTML('beforeend', result);
                form.querySelector('.comment-form-textarea').value = '';
                var commentReplys = document.querySelectorAll('.comment-reply');
                for (var i = 0; i < commentReplys.length; i++) {
                    commentReplys[i].innerHTML = '回复';
                };
                var commentTextareas = document.querySelectorAll('.comment-form-textarea');
                for (var i = 0; i < commentTextareas.length; i++) {
                    commentTextareas[i].className = 'comment-form-textarea';
                };
                document.querySelector('.comment-header-count').innerText = count;
                timeAgo();
                removeComment();
            } else if (data.code === 2) {
                if (data.response.indexOf('email') > -1) {
                    alert('请输入正确的名字或邮箱！');
                    return;
                } else if (data.response.indexOf('message') > -1) {
                    alert('评论不能为空！');
                    return;
                }
            }
        }
    }
    var xhrSendEmail = new XMLHttpRequest();
    xhrSendEmail.open('POST', 'http://api.fooleap.org/disqus/sendemail', true);
    xhrSendEmail.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhrSendEmail.send('parent=' + parent + '&message=' + message + '&name=' + name + '&title=' + title + '&link=' + link);
}

// 二维码 http://goo.gl/JzmGoq
var wechat = document.getElementById('wechat');
var qrcode = document.getElementById('qrcode');

function qrCode() {
    var qrcode = new QRCode('qrcode', {
        text: wechat.dataset.wechatUrl,
        width: 96,
        height: 96,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}
if (wechat) {
    var qrscript = document.createElement('script');
    qrscript.type = 'text/javascript';
    qrscript.src = 'http://' + location.host + '/assets/js/qrcode.min.js';
    document.getElementsByTagName('head')[0].appendChild(qrscript);

    function qrShow() {
        if (qrcode.classList.contains('show')) {
            qrcode.classList.remove('show');
            wechat.classList.remove('light');
        } else {
            qrcode.classList.add('show');
            wechat.classList.add('light');
        }
    }
    if (document.addEventListener) {
        wechat.addEventListener('click', qrShow, false);
    } else {
        wechat.attachEvent('onclick', qrShow);
    }
}

// 相关文章
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/ ) {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;
        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

function randomPosts(count, post) {
    var postsCount = count;
    var posts = post;
    var randomIndexUsed = [];
    var counter = 0;
    var numberOfPosts = 5;
    var RandomPosts = document.querySelector('#random-posts ul');
    while (counter < numberOfPosts) {
        var randomIndex = Math.floor(Math.random() * postsCount);
        if (randomIndexUsed.indexOf(randomIndex) == '-1') {
            var postHref = posts[randomIndex].href;
            var postTitle = posts[randomIndex].title;
            RandomPosts.insertAdjacentHTML('beforeend', '<li><a href="' + postHref + '" title="' + postTitle + '">' + postTitle + '</a></li>\n');
            randomIndexUsed.push(randomIndex);
            counter++;
        }
    }
}
var info = document.getElementById('info');

function random(data) {
    if (info.classList.contains('tech')) {
        var count = data.tech.length;
        var post = data.tech;
        randomPosts(count, post);
    } else if (info.classList.contains('life')) {
        var count = data.life.length;
        var post = data.life;
        randomPosts(count, post);
    }
}
if (info) {
    if (info.classList.contains('tech') || info.classList.contains('life')) {
        var postsJson = 'http://' + location.host + '/assets/js/posts.json';
        var xhrPosts = new XMLHttpRequest();
        xhrPosts.open('GET', postsJson, true);
        xhrPosts.send();
        xhrPosts.onreadystatechange = function() {
            if (xhrPosts.readyState == 4 && xhrPosts.status == 200) {
                var posts = JSON.parse(xhrPosts.responseText);
                random(posts);
            }
        }
    }
}

// 查看源码
var postContent = document.querySelector('.post-content');
var mainContent = document.querySelector('.main-content');
var sourceView = document.querySelector('.view-code a');

function showSource() {
    var source = document.getElementById('source');
    if (source) {
        mainContent.classList.remove('hide');
        if (toc) {
            toc.classList.remove('hide');
        }
        source.parentNode.removeChild(source);
        sourceView.innerHTML = '<i class="icon-file-code"></i>源码';
        sourceView.setAttribute('title', '查看内容源码');
        window.scrollTo(0, sourceView.offsetTop);
    } else {
        mainContent.classList.add('hide');
        if (toc) {
            toc.classList.add('hide');
        }
        postContent.insertAdjacentHTML('afterbegin', '<textarea id="source" readonly>读取中……</textarea>');
        var source = document.getElementById('source');
        var mdSource = sourceView.getAttribute('data-md');
        var xhrSource = new XMLHttpRequest();
        xhrSource.open("GET", mdSource, true);
        xhrSource.send();
        xhrSource.onreadystatechange = function() {
            if (xhrSource.readyState == 4 && xhrSource.status == 200) {
                source.innerHTML = xhrSource.responseText;
            }
        }
        sourceView.innerHTML = '<i class="icon-doc-text"></i>内容';
        sourceView.setAttribute('title', '返回文章内容');
    }
}
if (sourceView) {
    if (document.addEventListener) {
        sourceView.addEventListener('click', showSource, false);
    } else {
        sourceView.attachEvent('onclick', showSource);
    }
}

// 图片
var postImages = document.querySelectorAll('.main-content img');
var realImages = [];
(function imageSize() {
    for (var i = 0; i < postImages.length; i++) {
        var imageSrc;
        var realImage = new Image();
        realImage.src = postImages[i].src;
        realImages.push(realImage);
        imageSrc = realImage.src.split(/(\?|\_)/)[0];
        postImages[i].parentElement.classList.add('image');
        postImages[i].setAttribute('data-jslghtbx-caption', postImages[i].getAttribute('alt'));
        postImages[i].setAttribute('data-jslghtbx', imageSrc);
        postImages[i].setAttribute('data-jslghtbx-group', 'lightbox');
        postImages[i].outerHTML = '<figure>' + postImages[i].outerHTML + '</figure>';
    }
})();

function exifShow() {
    var exifInfo = this.querySelector('.exif');
    var thisImage = this.querySelector('img');
    var exifUrl = this.querySelector('img').src.split(/(\?|\_)/)[0] + '\?exif';
    if (exifUrl.indexOf('jpg') >= 0 && clientWidth >= 555 && !exifInfo) {
        var xhrExif = new XMLHttpRequest();
        xhrExif.open('GET', exifUrl, false);
        xhrExif.send(null);
        var exif = JSON.parse(xhrExif.responseText);
        if (xhrExif.readyState == 4 && xhrExif.status == 200) {
            if (exif.DateTimeOriginal) {
                datetime = exif.DateTimeOriginal.val.split(/\:|\s/);
                date = datetime[0] + '-' + datetime[1] + '-' + datetime[2];
                model = (exif.Model) ? (exif.Model.val) : '无';
                fnum = (exif.FNumber) ? (exif.FNumber.val.split(/\//)[1]) : '无';
                extime = (exif.ExposureTime) ? (exif.ExposureTime.val) : '无';
                iso = (exif.ISOSpeedRatings) ? (exif.ISOSpeedRatings.val.split(/,\s/)[0]) : '无';
                flength = (exif.FocalLength) ? (exif.FocalLength.val) : '无';
                thisImage.insertAdjacentHTML('afterend', '<figcaption class="exif show">日期: ' + date + ' 器材: ' + model + ' 光圈: ' + fnum + ' 快门: ' + extime + ' 感光度: ' + iso + ' 焦距: ' + flength + '</figcaption>');
            }
        }
    }
    if (exifInfo) {
        exifInfo.classList.add('show');
    }
}

function exifHide() {
    var exifInfo = this.querySelector('.exif')
    if (exifInfo) {
        exifInfo.classList.remove('show');
    }
}

function exifLoad() {
    var figure = document.querySelectorAll('figure');
    for (var i = 0; i < figure.length; i++) {
        figure[i].addEventListener('mouseover', exifShow, false);
        figure[i].addEventListener('mouseout', exifHide, false);
    }
}
// lightbox http://goo.gl/aA9Y5K
(function lightbox() {
    if (document.querySelectorAll('.image') && clientWidth > 640) {
        var lbscript = document.createElement('script');
        lbscript.type = 'text/javascript';
        lbscript.src = 'http://' + location.host + '/assets/js/lightbox.min.js';
        document.getElementsByTagName('BODY')[0].appendChild(lbscript);
    }
})();

// 标签云 http://goo.gl/OAvhn3
var tagCanvas = document.getElementById('tag-canvas');
if (tagCanvas) {
    if (clientWidth < 640) {
        tagCanvas.setAttribute('width', clientWidth);
        tagCanvas.setAttribute('height', clientWidth * 2 / 3);
    }
    var tagscript = document.createElement('script');
    tagscript.type = 'text/javascript';
    tagscript.src = 'http://' + location.host + '/assets/js/tagcanvas.min.js';
    document.getElementsByTagName('head')[0].appendChild(tagscript);
}

function tagCloud() {
    TagCanvas.Start('tag-canvas', 'tags', {
        textHeight: 25,
        textColour: null,
        textFont: 'RobotoDraft, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", "SimSun", sans-serif',
        outlineColour: 'rgba(225, 225, 225, .3)',
        outlineMethod: 'block',
        bgRadius: 5,
        reverse: true,
        depth: 0.8,
        Zoom: 1.5,
        weight: true,
        weightSizeMin: 10,
        weightSizeMax: 40,
        wheelZoom: false
    });
    var tagLinks = document.querySelectorAll('a[class^="tag"]');
    var hidePosts = document.querySelectorAll('.post-list');

    function tagShow() {
        for (var i = 0; i < hidePosts.length; i++) {
            hidePosts[i].style.display = 'none';
        }
        var href = decodeURIComponent(this.href.split('#')[1]);
        document.querySelector('h1').innerHTML = '“' + href + '”的相关文章';
        document.getElementById(href).removeAttribute('style');
        setTimeout(function() { window.scrollTo(0, 0); }, 1);
    }
    for (var i = 0; i < tagLinks.length; i++) {
        if (document.addEventListener) {
            tagLinks[i].addEventListener('click', tagShow, false);
        } else {
            tagLinks[i].onclick = tagShow;
        }
    }
    if (location.hash) {
        document.querySelector('[href="' + decodeURIComponent(location.hash) + '"]').click();
        setTimeout(function() { window.scrollTo(0, 0); }, 1);
    }
}

setTimeout(function() {
    if (location.hostname === 'blog.fooleap.org') {
        var _hmt = _hmt || [];
        (function() {
            var hm = document.createElement('script');
            hm.src = '//hm.baidu.com/hm.js?fa7ec982118ebd236663169678264582';
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

        ga('create', 'UA-16717905-7', 'auto');
        ga('send', 'pageview');
    }
}, 1000);

window.onload = function() {
    tocShow();
    if (wechat) {
        qrCode();
    }
    if (window.addEventListener) {
        exifLoad();
        window.addEventListener('keydown', keysDown, false);
        window.addEventListener('keyup', keysUp, false);
    } else if (document.attachEvent) {
        document.attachEvent('onkeydown', keysDown);
        document.attachEvent('onkeyup', keysUp);
    } else {
        document.addEventListener('keydown', keysDown, false);
        document.addEventListener('keyup', keysUp, false);
    }
    if (document.querySelectorAll('.image') && clientWidth > 640) {
        var lightbox = new Lightbox();
        var lightBoxOptions = {
            boxId: false,
            dimensions: true,
            captions: true,
            prevImg: false,
            nextImg: false,
            hideCloseBtn: true,
            closeOnClick: true,
            loadingAnimation: 100,
            animElCount: 4,
            preload: true,
            carousel: true,
            animation: 400,
            nextOnClick: false,
            responsive: true,
            maxImgSize: .9,
        }
        lightbox.load(lightBoxOptions);
    }
    if (tagCanvas) {
        tagCloud();
    }
    if (/^#disqus|^#comment/.test(location.hash)) {
        showComments();
    }
}
