window.addEvent("domready", function(){					
	var toggler = new Element("div",{id:"ktbguestToggler",class:"ktbToggler"});
		toggler.set("html","Chat Offline");
		toggler.setStyle("width",75);					
		toggler.inject($(document.body));
		toggler.set("opacity", 0.5).addEvents({
			mouseenter: function(){
				var myEffect = new Fx.Morph(this);			      
					myEffect.start({																	
						"width":[75,80],
						"opacity": [0,1],
						"color":["#E79D35","#000000"],
						"background-color": ["#ffffff","#E79D35"]  									
					});
				this.set("html","Login To Chat");
			},
			mouseleave: function(){									
				var myEffect = new Fx.Morph(this);											     
					myEffect.start({																	
						"width":[80,75],
						"opacity": [1,0.5],
						"color":["#E79D35","#000000"],
						"background-color": ["#E79D35","#ffffff"]   
					});
				this.set("html","Chat Offline");
			}
		});  	   
});
