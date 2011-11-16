/*Mooml Template Start*/

    Mooml.register('ktbContainer', function() {
		div({id: 'ktbBox'},
			div({id: 'ktbMyProfile',class:"ktbmyprofile ktbboxcommon"},
				div({id: 'itemImg',class:"itemimg"}),
				div({id: 'itemInfo',class:"iteminfo"},
					div({id: 'itemTop',class:"itemtop"},
						span({id: 'itemTopLeft',class:"itemtopleft"}),
						span({id: 'itemTopRight',class:"itemtopright"})
					),
					div({id: 'itemBot',class:"itembot"})	
				)
			),
			div({id: 'ktbTop',class:"ktbtop ktbboxcommon"}),
			div({id: 'ktbMed',class:"ktbmed ktbboxcommon"},
				div({id: 'ktbMedList',class:"ktbmedlist"}),
				div({id: 'ktbMedThumb',class:"ktbmedthumb"}),
				div({id: 'ktbMedLog',class:"ktbmedlog"})
			),
			div({id: 'ktbBot',class:"ktbbot ktbboxcommon"})
		);			
    });
    Mooml.register('profImg', function(params) {
		img({	
				width:params.size+"px",
				height:params.size+"px",
				id:"img-"+params.pubid,
				src:params.src,
				alt:params.title,
				title:params.title,
				class:params.class
			});
	});
	
	Mooml.register('sortLi', function(params) {
		div({id:"user-"+params.pubid,class:"ktbsortlist"},
			div({class:"userwrapper"},
				div({class:"userimg"},
					img({	
						width:params.size+"px",
						height:params.size+"px",				
						src:params.src,
						alt:params.title,
						title:params.title,
						class:params.class
					})
				),				
				div({id: params.titleId,class:"usertitle"},params.title)				
			),
			div({class:"userstatus"},params.status)
		)
	});

/*Mooml Template Ends*/

/*Main Class*/
APE.Ktbchat = new Class({	
	Extends: APE.Client,	
	Implements: Options,	
	options: {
		container:		null,
		jtalk_home:		null,		
		channel:		null,		
		statusMsg:		null,
		chatType:		null,
		ktb_name:		null,
		ktb_userId:		null,
		ktb_hashish:	null,
		ktb_sessId: 	null				
	},
	
	initialize: function(options){
		
		this.setOptions(options);			
		this.container 		= $(this.options.container) || document.body;
		this.jtalk_home		= this.options.jtalk_home;
		this.channel 		= this.options.channel;		
		this.statusMsg 		= this.options.statusMsg || "Hi, There";
		this.chatType 		= this.options.chatType || 0;
				
		this.ktb_name 		= this.options.ktb_name;
		this.ktb_userId 	= this.options.ktb_userId;
		this.ktb_hashish 	= this.options.ktb_hashish;
		this.ktb_sessId 	= this.options.ktb_sessId;
		
		this.ktbBox			= {};		
		this.ktbChannelId = null;
		this.ktbDragger = null;
		
		this.currentUser = {};
		this.addEvent('load',this.ktbStart);
		this.addEvent('ready', this.ktbReady);
		this.addEvent('multiPipeCreate', this.ktbMulti);
		this.addEvent('userJoin', this.ktbUserJoin);		
		this.addEvent('uniPipeCreate', this.ktbUni);		
		this.addEvent('userLeft', this.ktbUserLeft);
		this.onRaw('data', this.ktbData);
		this.onCmd('send', this.ktbSend);
		this.onError('004', this.KtbReset);
		this.onError('250', this.KtbReconn);
		this.onRaw('OUCH', this.Kouch);		
	},
	
	ktbStart: function(core){
                console.log('ktbStart');                                            
		/*if(this.core.options.restore) {
			this.core.start();
		 } else {*/
		   this.core.start({
								'name': 		this.ktb_name,
								'id':			this.ktb_userId, 	
								'chan':			this.channel,							
								'statusMsg': 	this.statusMsg,
								'sid': 			this.ktb_sessId,
								'hashish': 		this.ktb_hashish									
							});
		// }
	},

	ktbReady: function(){
		console.log('ktbReady');		
		this.core.join(this.channel);
		this.ktbBox = Mooml.render('ktbContainer');							
	},	

	ktbMulti: function(pipe, options){			
		console.log('ktbMulti');			
		this.container.empty();		
		this.ktbBox.inject(this.container);
		this.ktbBoxToggle("hide");	
		this.ktbDragger  = this.ktbDragMe().detach();
		this.container.setStyle("position","fixed");	
		this.ktbToggle();			
		this.ktbChannelId= pipe.pipe.pubid;	
		this.ktbCreateHelpImg();
		
	},

	ktbUserJoin: function(user, pipe){								
		if(pipe.pipe.pubid === this.ktbChannelId){
			var o = {},a = null;
				o.pubid = user.pubid;
				o.title = user.properties.displayName;		
			var n = this.ktbParse(user.properties.displayName);
			var s = this.ktbParse(user.properties.statusMsg);			
			
			if(user.pubid === this.core.user.pubid){
				console.log('my Joining Event');				
				$("itemTopLeft").set("html",n).set("title",n);
				$("itemBot").set("html",s).set("title",s);
				o.size = 48;
				o.src = "me";
				o.class = "default";						
				a = this.ktbCreateImg(o)			
				a.inject($("itemImg"));
				a.addEvent("click",this.ktbChangeImg);
					$("itemBot").addEvent("click",this.ktbChangeStatus);
				var a1 = Mooml.render('sortLi',
					{ 
						pubid:pipe.pipe.pubid,
						title:"Public Room",
						size:18,
						src:this.jtalk_home+"assets/images/public.png",
						class:o.class,
						status:"This is your Open Chat Room",
						titleId:pipe.pipe.properties.name					
					});
				a1.inject($("ktbMedList"),"top");																
			} else {
				console.log('others Joining Event');
				o.size = 18;
				o.class = "default";
				o.src = this.jtalk_home+"assets/images/user.png";
				o.status = s;				
				a = Mooml.render('sortLi',
					{ 
						pubid:o.pubid,
						title:n,
						size:18,
						src:o.src,
						class:o.class,
						status:s,
						titleId:user.properties.name					
					});				  
				if( $(user.properties.name) && $(user.properties.name).getParent("div.ktboffline") ){
				      a.replaces($(user.properties.name).getParent("div.ktboffline"));
				  }	else{
					a.inject($("ktbMedList"));			
				  }			
				 
			}
		}	
	},

	ktbUni: function(pipe, options){			
		console.log('ktbUni');		
	},

	ktbUserLeft: function(user, pipe){			
		console.log('ktbUserLeft');	
		if($("user-"+user.pubid)){
			var el = $("user-"+user.pubid);	
			el.addClass("ktboffline");
			el.getChildren("div.userstatus").set("html","Went Offline");		
		}	
	},

	ktbData: function(raw, pipe){			
		console.log('ktbData');		
	},

	ktbSend: function(data, pipe){			
		console.log('ktbSend');		
	},

	KtbReset: function(){		
		this.core.clearSession();		
		this.core.initialize(this.core.options);
	},
	
	KtbReconn: function(err){
		console.log(err);		
	},

	Kouch: function(err){		
		console.log(err);		
		this.core.quit();	

	},
	
	ktbParse: function(msg){		
		return decodeURIComponent(msg);
	},
	
	ktbCreateImg: function(params){	
		if(params.src == "me" || params.src == "you"){
			params.src = this.jtalk_home+"assets/images/"+params.src+".png";
		}
		return Mooml.render('profImg',
				{ 
					pubid:params.pubid,
					title:this.ktbParse(params.title),
					src:params.src,
					size:params.size,
					class:params.class
				});
	},
	
	ktbCreateHelpImg: function(){	
		var a = null;
		var ths = this;		
		var assetPath = ths.jtalk_home+"assets/images/";		
		var c =	[	{id: 'ktbTogg',title:'Toggle',src:"down.png"},
					{id: 'ktbDrag',title:'Drag',src:"drag.png"}, 
					{id: 'ktbHelp',title:'Help',src:"help.png"}
				];
		for(var i=0;i<3;i++){					
			a = Mooml.render('profImg',
				{ 
					pubid:c[i].id,
					title:c[i].title,
					size:18,
					src:assetPath+c[i].src,
					class:'ktbhelp'					
				});				
			a.inject($("itemTopRight"));
				
		}
		
		$('itemTopRight').addEvents({
				'mouseenter:relay(img)': function(event){
					this.morph({
						'background-color': '#eee'					
					});
				},
				'mouseleave:relay(img)': function(event){
					if(this.hasClass("selected") == false){
						this.morph({
							'background-color': '#666'						
						});
					}
				},
				'click:relay(img)': function(event){
					event.preventDefault();						
					if(this.hasClass("selected") == false){
						this.setStyle("background","#eee");
						this.addClass("selected");
						if(this.id == "img-ktbDrag"){
							ths.ktbDragger.attach();
							//ths.container.setStyle("position","absolute");								
						}							
					} else {
						this.setStyle("background","#666");
						this.removeClass("selected");
						if(this.id == "img-ktbDrag"){
							ths.ktbDragger.detach();
							ths.container.setStyle("position","fixed");									
						}						
					}
					if(this.id == "img-ktbTogg"){						
						if(this.get("src") == assetPath+"up.png"){
						    this.set("src",assetPath+"down.png");
						    ths.ktbBoxToggle("close");
						} else {
							this.set("src",assetPath+"up.png");						
							ths.ktbBoxToggle("open");
						}
					}			
				}

		});		
	},
	ktbBoxToggle: function(type){		
		var ktbTop = new Fx.Morph($('ktbTop'));
		var ktbMed = new Fx.Morph($('ktbMed'));
		var ktbBot = new Fx.Morph($('ktbBot'));
		var ktbBox = new Fx.Morph($('ktbBox'));		;
		
		if(type == "close"){
			ktbBot.start({
				'height': [73, 0],				
				'border': ["1px solid #000","0px solid #000"]				
			});			
			ktbMed.start({
				'height': [326, 0],
				'margin': ["0 0 5px 0", "0 0 0 0"],
				'border': ["1px solid #000","0px solid #000"]				
			});
			ktbTop.start({
				'height': [33, 0],
				'margin': ["0 0 5px 0", "0 0 0 0"],
				'border': ["1px solid #000","0px solid #000"]				
			});			
			ktbBox.start({
				'height': [508, 0]							
			});
			$("ktbMyProfile").setStyle("margin","0");
		} 
		if(type == "open"){
			ktbTop.start({
				'height': [0, 33],
				'margin': ["0 0 0 0", "0 0 5px 0"],
				'border': ["0px solid #000","1px solid #000"]				
			});
			ktbMed.start({
				'height': [0, 326],
				'margin': ["0 0 0 0", "0 0 5px 0"],
				'border': ["0px solid #000","1px solid #000"]				
			});
			ktbBot.start({
				'height': [0, 73],				
				'border': ["0px solid #000","1px solid #000"]				
			});
			
			ktbBox.start({
				'height': [0, 508]							
			});
			$("ktbMyProfile").setStyle("margin","0 0 5px 0");
			$("ktbMedList").setStyles({						
						margin: 0,
						height:326
						
			});
		} 
		if(type == "hide"){
			$('ktbBox').setStyle("height","0");
			$("ktbMyProfile").setStyle("margin","0");
			$("ktbMedList").setStyles({						
						margin: 0,
						height:0
						
			});
		}
			
	},
	
	ktbChangeImg: function(e){
		console.log("change Img");
	},
	
	ktbChangeStatus: function(e){
		console.log("change Status");
	},	
	
	ktbToggle: function(){
		var ths = this.container;
		window.addEvent("keydown", function(event){
			// S = show(83), H = hide(72)
			if (event.control && event.alt){
				if(event.code == 83) {
					ths.setPosition({x:0,y:0});
					ths.removeClass("ktbhidden").addClass("ktbshown");								
				}
				if(event.code == 72) {
					ths.setPosition({x:-450,y:-650});
					ths.removeClass("ktbshown").addClass("ktbhidden");
				}
			}
		});			
	},
	
	ktbDragMe: function(){
		if(typeOf(Drag.Move) == "class"){
			this.container.setStyle("position","absolute");							
			return new Drag.Move(this.container, {				
					snap: 0,
					onSnap: function(el){
						el.addClass('dragging');
					},
					onComplete: function(el){
						el.removeClass('dragging');
					}
			});
		}	
	}
		

	
});
