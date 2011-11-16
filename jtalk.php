<?php
defined('_JEXEC') or die;
jimport('joomla.plugin.plugin');
ini_set('display_errors',1);
class plgSystemJtalk extends JPlugin {
	var $jtalk_chan_name 	= 0;
	var $jtalk_dom_name 	= 0;
	var $jtalk_api_key 		= 0;
	var $jtalk_user_name 	= 0;
	var $jtalk_password 	= 0;
	var $jtalk_status 		= 0;
	var $jtalk_chat_type 	= 0;
	var $jtalk_name_type 	= 0;
	var $ktb_name 			= 0;
	var $ktb_userId 		= 0;
	var $ktb_sessId 		= 0;
	var $ktb_hashish 		= 0;		 		
	
	function __construct(&$subject, $config) {
		parent::__construct($subject, $config);
		$this->loadLanguage();							
	}
	
	public function onAfterDispatch() {	
		$app = JFactory::getApplication();		
		if ($app->getName() != 'site') {
			return true;
		}	
					
		$user =& JFactory::getUser();
		$document =& JFactory::getDocument();
		$cssPath = JURI::base().'plugins/system/jtalk/assets/killthebill.css'; 
		JHtml::stylesheet($cssPath);
			
		if(!$user->guest) {
			$this->_initParams();			
			$jsPath = JURI::base().'plugins/system/jtalk/assets/jLktb.js';
			$jsPath1 = JURI::base().'plugins/system/jtalk/assets/online/mooml.js';
			$jsPath2 = JURI::base().'plugins/system/jtalk/assets/online/extended.js';			
			$cssPath = JURI::base().'plugins/system/jtalk/assets/online/ktbonline.css';
			JHtml::stylesheet($cssPath);
			JHtml::script($jsPath,true);
			JHtml::script($jsPath1,true);
			JHtml::script($jsPath2,true);
			
			$js ='window.addEvent("domready", function(){ 
					var mainElm = new Element("div",{id:"ktbChat_main",class:"ktbChatMain ktbshown"});
						mainElm.inject($(document.body));					
						mainElm.set("html","Please Wait...");					
													
					var ktbChatClient = new APE.Ktbchat({
						container: 		$(mainElm),
						jtalk_home:		"'.JURI::base().'plugins/system/jtalk/",
						channel:		"'.$this->jtalk_chan_name.'",						
						statusMsg:		"'.$this->jtalk_status.'",
						chatType:		'.$this->jtalk_chat_type.',
						ktb_name:		"'.$this->ktb_name.'",
						ktb_userId:		'.$this->ktb_userId.',
						ktb_hashish:	"'.$this->ktb_hashish.'",
						ktb_sessId:		"'.$this->ktb_sessId.'"				
					});
					ktbChatClient.load({
						identifier: "'.$this->jtalk_chan_name.'"									
					}); 		      
				});';			
			$document->addScriptDeclaration($js);	
							
		} else {
			$jsPath = JURI::base().'plugins/system/jtalk/assets/offline/ktboffline.js';
			JHtml::script($jsPath,true);		
		}
		 		
	}
		
	private function _initParams(){
		$user = JFactory::getUser();		
		$this->jtalk_chan_name 	= $this->params->get('chan_name',0);
		$this->jtalk_dom_name 	= $this->params->get('dom_name',0);
		$this->jtalk_api_key 	= $this->params->get('api_key',0);
		$this->jtalk_user_name 	= $this->params->get('user_name',0);
		$this->jtalk_password 	= $this->params->get('password',0);
		$this->jtalk_status 	= $this->params->get('status',0);
		$this->jtalk_chat_type 	= $this->params->get('chat_type',0);
		$this->jtalk_name_type 	= $this->params->get('name_type',0);		
		$this->ktb_name			= $user->username;
		if($this->jtalk_name_type) {
			$this->ktb_name		= $user->name;
		}		
		$this->ktb_userId 		= $user->id;						
		$this->ktb_sessId 		= $this->_getKtbSessId();		
		$this->ktb_hashish		= $this->_getKtbHashish();
	}
	
	private function _getKtbSessId() {		
		$key	= 	$this->jtalk_dom_name.
					$this->jtalk_chan_name.
					$this->ktb_userId;								
		return hash_hmac('sha1', $key , $this->jtalk_password);		
	}
	
	private function _getKtbHashish() {							
		$key	=	$this->jtalk_api_key.
					$this->jtalk_user_name;				
		return hash_hmac('sha1', $key , $this->jtalk_password);		
	}
	
}//end of Class
