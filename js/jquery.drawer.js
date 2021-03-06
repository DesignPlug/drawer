(function($) {


    //the plugin object
    var Base;
    
    //cache body selector
    var Body = $('body');
    
    var Wrapper;
    
    //option vars

    var settings;
    
    //function vars
    
    var isOpen;
    var Open;
    var Close;
    var Cls;
    var Id;
    var NS;
    var GetAlignment;
    var Toggle;
    var Callback;
    var EL;
    var WrapContent;
    

    var methods = {
        init : function(options) {

            //init the plugin base object
            Base = $(this);

            //default settings
            settings = $.extend({
                swipeEnabled : true,    //if true, drawer can be opened using both slide and trigger
                namespace    : "plg-",  //name space for drawer css selectors
                open         : null,    //callback function fired when drawer is toggled open
                close        : null,    //callback function fired when drawer is toggled shut
                pushBody     : false,   //if true toggle trigger slides the whole body to expose collapsed menu
                inline       : false    //if true menu will have inline class by default, and drawer functionality won't work until set to false
            }, options);
            
           
            //set namespace helper
            NS = (function($selector){
                return settings.namespace + $selector;
            });

            //class selector helper
            
            Cls = (function($selector){
                return '.' + NS($selector);
            })
            
            //id selector helper
            
            Id = (function($selector){
                return '#' + NS($selector);
            });
            
            //check if menu is inline
            isInline = (function(){
                if(Base.hasClass(NS('inline'))) return true;
                else return false;
            });
            
            //set menu to inline if inline is set to true
            if(settings.inline === true) Base.addClass(NS('inline'));
            
            
            //callback helper
            Callback = (function($cb){
                if(typeof settings[$cb] === 'function') return settings[$cb]();
            });
            
            //get getAlignment method
            
            GetAlignment = (function(){
               if(Base.hasClass(NS("align-right"))) 
               {
                   return "right";
               }
               else
               {
                   return "left";
               }
            });
            
            WrapContent = (function(){
                if(settings.pushBody === true && !isInline())
                {
                    if(!Wrapper)
                    {
                        var alignCls = NS('align-' + GetAlignment() );

                        Body.wrapInner('<div class="' + NS('content-wrapper') + ' ' +  alignCls + '" />');
                        Wrapper = $(Cls('content-wrapper'));
                    }
                }
                else if(Wrapper)
                {
                    Wrapper.children().unwrap();
                    Wrapper = false;
                }
            });
            
            WrapContent();
            
            //ELement determine which object to apply collapse to on open call
            EL = (function(){
               if(settings.pushBody === true) return Wrapper;
               else return Base;
            });
            
            //set isOpen method
            
            isOpen = (function(){
                
                //check if drawer or body has the collapsed class,
                //and return true if so
                if(EL().hasClass(NS("collapsed")))
                {
                    return true;
                }
                
                //drawer is not collapsed, return false;
                else
                {
                    return false;    
                }
                
            });
            
            //set Open Method
            
            Open = (function(){
                //if not opened, open, and return true;
                if(!isOpen())
                {
                    EL().addClass(NS("collapsed"));
                    
                    //run callback if set
                    Callback("open");
                    
                    return true;
                }
                
                //otherwise return false, its already open
                else
                {
                    return false;
                }
            });
            
            //set Close Method
            
            Close = (function(){
                //if opened, close, and return true;
                if(isOpen())
                {
                    EL().removeClass(NS("collapsed"));
                    
                    //also close any nested collapsed nav items
                    Base.find('*').removeClass(NS('collapsed'));
                    Base.find('li ul').slideUp(200);
                    
                    //run callback if set
                    Callback("close");
                    
                    return true;
                }
                
                //otherwise return false, its already closed
                else
                {
                    return false;
                }
            });   
            
            
            //set Toggle Method
            
            Toggle = (function( ) {    
            
                if(!Open()) Close();
            
            });
            
            
            
            //drawer listeners
            
            //listen for swipe if swipe option is set to true
            
            if(settings.swipeEnabled === true)
            {
               //check if method exists, and
               //listen if true
                
                if(jQuery().swipe)
                {
                    
                    $(Cls('drawer-menu')).swipe({

                        swipe: function(e, dir, dist){
                            
                            //we have to figure out which direction the nav is aligned
                            //in order to determine which swipe action is appropriate
                            //ex: swipe right will close a right aligned nav, but open
                            //a left aligned nav

                            var align = GetAlignment();

                            if(dir === align && isOpen()) Close();
                            
                            else if(dir !== align  && !isOpen()) Open();
                            
                        },
                        distance: 0
                    });
                }
                
                //else log error
                else
                {
                    $.error( 'jquery.swipe plugin not loaded, cannot use swipe in PlugDrawerMenu without it' );
                }
            }
            
            //on drawer toggle click fire toggle method
            
            Base.find(Cls("drawer-toggle-trigger")).click(function(e){
                e.preventDefault();
                return Toggle();
            });
            
            //listen for sub menu items collapse trigger click
            
            Base.find(Cls('collapse-toggle')).click(function(e){
                $(this).closest('li').toggleClass(NS('collapsed'));
                $(this).parent('a').siblings('ul').slideToggle();
                e.preventDefault();
            });
            
        },
                
        //toggle drawer        
        toggle  : function() {    
            
            return Toggle();
            
        },
                
        //opens drawer if it is closed        
        open    : function() { 
            
            return Open();
            
        },
                
        //closes drawer if opened        
        close   : function() { 
            
            return Close();
            
        },
                
        //returns true if drawer is open, false if not        
        isOpen  : function() { 
            
            return isOpen();
            
        },
                
        options  : function($options){
    
            settings = $.extend(settings, $options);
            WrapContent();
        }
    };




    $.fn.PlugDrawerMenu = function( options ) {
        
        
        if ( typeof options === 'object' || ! options ) {
            
            // Default to "init" if object passed, or no args 
            return methods.init.apply( this, arguments );
            
        } 
        
        //if this is really a call to a Drawer method, then call the method
        else if ( methods[options] ) {
            
            return methods[ options ].apply( this, Array.prototype.slice.call( arguments, 1 ));
            
        }
            
        //otherwise this was a call to an undefined method, trigger error 
        else {
            
            $.error( 'No such method: ' +  options + ' does not exist on PlugDrawerMenu' );
            
        }    
    };
    
}(jQuery));