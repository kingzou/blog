
/**
 * blogList page
 *  
 */


define(function(require,exports){
	var blogTemp =  ['<div class="articleItem" articleId="<%=id %>">',
		'<div class="artItCnt">',
			'<% if(cover){ %>',
			'<div class="artItPic">',
				'<a href="/blog/<%=id %>" title="<%=title %>" lofox="true" target="_self" >',
					'<img src="<%=cover %>" alt="<%=title %>" />',
				'</a>',
			'</div>',
			'<% } %>',
			'<div class="artItCpt">',
				'<a href="/blog/<%=id %>" title="<%=title %>" lofox="true" target="_self" >',
					'<%=title %>',
				'</a>',
			'</div>',
			'<div class="artItInfo"><p><%=intro %></p></div>',
			'<div class="artItTime"><%=time_show %></div>',
		//	'<div class="artItTag">${it.tags}</div>',
		'</div>',
	'</div>'].join('');
	
	function LIST(dom){
		this.skip = 0;
		this.limit = 10;
		this.count = 0;
		this.dom = dom;
		this.onLoadStart = null;
		this.onLoaded = null;
	}
	LIST.prototype.render = L.tplEngine(blogTemp);
	LIST.prototype['more'] = function(){
		var me = this;
		this.onLoadStart && this.onLoadStart();
		$.ajax({
			'type' : 'GET' ,
			'url' : '/ajax/blog',
			'data' : {
				'act' : 'get_list',
				'skip' : this.skip,
				'limit' : this.limit
			},
			'success' :function(data){
				var count = data['count'],
					 list = data['list'];
				for(var i in list){
					var date = new Date(parseInt(list[i].time_show));
					list[i].time_show = (date.getYear()+1900)+'-'+(date.getMonth()+1)+'-'+ date.getDate();
					//使用七牛图床
					list[i].cover = L.qiniu(list[i].cover);
				}
				
				me.count = count;
				me.skip += me.limit;
				
				for(var i=0,total=list.length;i<total;i++){
					me.addItem(list[i]);
				}
				
				me.onLoaded && me.onLoaded.call(me);
			}
		});
	};
	LIST.prototype['addItem'] = function(item){
		var html = this.render(item);
		var this_dom = $(html).hide();
		
		this.dom.append(this_dom);
		this_dom.fadeIn(200);
		
		var img = this_dom.find('img')[0];
		if(img){
			img.onload = function(){
//				this_dom.css('max-width',this.width);
			}
		}else{
//			this_dom.css('max-width',500);
		}
	};
	
	return function(dom,param){
		dom.html(['<div class="articleListCnt">',
			'<div class="articleList"></div>',
			'<div class="blog_addMore">',
				'<a href="javascript:void(0)">加载更多</a>',
				'<span>正在加载……</span>',
			'</div>',
		'</div>'].join(''));
		
		var $list = dom.find('.articleList');
		var $addMore = dom.find('.blog_addMore');

		dom.on('click','.blog_addMore',function(){
			list.more();
		});
		
		var list = new LIST($list);
		list.more();
		list.onLoadStart = function(){
			$addMore.addClass('blog_addMore_loading');
		};
		
		
		list.onLoaded = function(){
			if(this.skip >= this.count){
				$addMore.hide();
			}else{
				$addMore.removeClass('blog_addMore_loading');
			}
		};
	};
});