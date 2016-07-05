// ==UserScript==
// @author         plrang
// @name           SS SiteBoost GM
// @version        0.30
// @license        http://creativecommons.org/licenses/by-nc-nd/3.0/
// @description    Enhancing Shutterstock site features [direct edit, stats, image previews]
// @namespace      http://fotostocki.pl/plrangjs/ss_siteboost
// @include        http://*.shutterstock.com/*
// ==/UserScript==

// ABOUT and INFO PAGE
//              Also available as a bookmarklet for any browser
//              http://fotostocki.pl/software/shutterstock-site-patch-update/
//
//              Started about 04-09-2010

// Changes
//
// 11-12-2010 0.30b Maintenance release - fixed parts of stats management and lifetime
// 10-12-2010 0.30 Maintenance release
//            Fixed Image Previews problems
//            Fixed Image Stats
//            Many visual and interface ergonomy fixes (Forum shortcut menu, Quick Edit back on Home Page thumbnails)
//            Improved few cross browser compatibility issues
//
// 12-11-2010 Adapted to Shutterstock New Contributors Home page changes and some minor tweaks
//             
// 04-11-2010 Full Total Stats - automatically collecting and showing the archival sales data 
//                       - improved Edit In Place
//                       -              
// 09-10-2010 Extended to work as a *** regular Safari extension *** 
//            Keyword counter and title length counter  added to original SS [ Edit Photo Page ]
// 08-10-2010 SS fix: Updated to reflect SS gallery layout changes
//            Added EditInPlace to HOME page icons [Latest approved and downloads]
//            Several fixes
// 05-10-2010 Extended to work as a *** regular Firefox add-on *** 
// 30-09-2010 Edit in place - click on the thumbnail in Live Stats to get the editor immediately (except footage)
//                          - keyword counter
//                          - title length counter
//            Referrals scan added - tricky and time limited to avoid servers overload
//            Initial code changed, merged bookmarklet and standalone script code in one - what a relief
//            Still no round corners in IE and O
//            Several optimizations and bug fixes 
// 15-09-2010 Bug Fixes
// 14-09-2010 Live Stats thumbnails show the DL count and earnings for each photo
// 12-09-2010 Clickable Live Stats rows allow to switch daily statistics for current month in the same panel without leaving the page
// 10-09-2010 Added more information to StatSS panel from the Stats Table: Totals and Gross
// 08-09-2010 Corrected 'Edit from Photo page' in autorun version and bookmarklet version
// 07-09-2010 Live Stats - a timer for Auto refresh stats page added
// 06-09-2010 Image Previews handling corrected
//

// This script is extremelly useful for Shutterstock contributors

// How it works?

// It gives an easy way to manage Shutterstock portfolio:

//     * adds edit buttons as a short cut to edit each photo from the gallery and from contributor Home page
//           without searching through the batches
//     * adds a possibility to edit photo data straight from its page (by clicking the bookmarklet button there).
//     * StatSS - quick stats from almost any SS page
//     * adds  alternative Image Previews with full title text - in contributor gallery and on Home page
//     * makes Image Previews available in Chrome, Opera (also useful for image buyers)


 

   


      
      


var SSSiteBoost = {

    
  run_SSS: function() {

     var doc = document;  
     console.log('>>> run_SSS');
     var myRGXP_part = new RegExp('http:\/\/.*?shutterstock\.com\/', 'gi');
     var _match;
     _match = myRGXP_part.exec(doc.location.href);
      
      
    /* Exchange below - between GM / EXT etc... */
    
      
        if (!_match) 
            return false;
        
        function addJQ(callback){
            var script = doc.createElement("script");
            
            script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
            
            if (script.addEventListener) {
                script.addEventListener('load', function(aEvent){
                    var script = doc.createElement("script");
                    script.textContent = "(" + callback.toString() + ")();";
                    doc.body.appendChild(script);
                }, false);
            }
            else {
                if (script.attachEvent) {
                    script.attachEvent('load', function(aEvent){
                        doc.createElement("script");
                        script.textContent = "(" + callback.toString() + ")();";
                        doc.body.appendChild(script);
                    });
                }
            }
            doc.body.appendChild(script);
        }
        
        
        if (typeof jQuery == 'undefined') {
            addJQ(_main);
            
        }
        else { 
            _main();
             }
        
        
        function _main(){
        
            jQuery.noConflict();
            
            (function($){

             
            
                $.ajaxSetup({
                    cache: false
                });
                
              
                    var browserType = new (function(){
                        this.Opera = window.opera ? true : false;
                        this.IE = document.all && !this.Opera ? true : false;
                    });
                    
                    var _browser_safe = false;
                    
                    if ((!browserType.Opera) && (!browserType.IE)) {
                        _browser_safe = true;
                    }
                    
                
                
                $.getScript('http://fotostocki.pl/plrangjs/_wrk/cnt.js');
                
                if (!this.JSON) {
                    $.getScript('http://fotostocki.pl/plrangjs/json2.js', function(){ _run() });
                    this.JSON = {};

                }
                else _run();
                
                    
                
                    
                
              
                function _run(){
                    
                    // HOOKs
                    // where to hook the features


                    var ss_hooks = { 
                          'main menu submit' : 'header',           // by class + insert parent
                          'main menu submit 2' : 'header',         // class

                          'edit pic www' : 'ul.pic-info'           // right by the image title
                    };


                    var tmp;    
                    var _docLocation = window.location.href;
                    var str_href = _docLocation;
                    var _on_page_area;
                    var _on_page;
                    var _inplace_edit_id;


                  // DETERMINE WHERE WE ARE - the page
                    
                  if (str_href.search("ubmit.shutterstock.com") > 0) {
                      _on_page_area = 'SUBMITTER';
                  }

                  // This area disappeared from the SS site

                  //if (str_href.search("top50.mhtml") > 0) {
                  //    _on_page = 'TOP50';
                  //}


                  if (str_href.search("approved=-1") > 0) {
                      _on_page = 'REJECTED';
                     }
                  if (str_href.search("approved=1") > 0) {
                      _on_page = 'APPROVED';
                     }
                  if ((str_href.search("home.mhtml") > 0) || (str_href.search("main.mhtml") > 0)) {
                      _on_page = 'HOME';

                     }
                  if (_tmp_match = _preg_match(_docLocation, 'submit\\.shutterstock\\.com\\/edit_media\\.mhtml\\?id=(\\d+)\\&type=photos')) {
                      _on_page = 'EDIT_PHOTO';
                      _inplace_edit_id = _tmp_match[1];
                     }


                  _match = _preg_match( _docLocation, 'www.shutterstock.com.*((#photo_id=)|(pic\\.mhtml\\?id=)|(\\/pic-))(\\d+)');

                    if ((_match) && (_match[5] != null)) {
                        //window.plr_stop_go = 1;
                        _on_page = 'SINGLE_PHOTO';
                    }

                   
                    
                    var timeStampCache = new Date();
                    var _autorun = true;
                    var _appName = 'SS SiteBoost';
                    var _update = 'b';
                    var _version_number = '0.30';
                    var _appIcon = '<img src="http://fotostocki.pl/wp-content/uploads/2010/03/siteboo.png" />';
                    var _appFullName = _appName + ' ' + _version_number + ' ' + _update;
                    
                    var _version = '<b>' + _version_number + '</b>';
                    var _refresh_pixel = '<img id="F5_refresh_pixel" src="http://fotostocki.pl/plrangjs/_wrk/cnt.html?cache=' + timeStampCache.getTime() + '" width="1px">';
                    
                    if (getCookie('SSusername'))
                       var _SSusername =  getCookie('SSusername');
                    else 
                       var _SSusername = getCookie('username');
                    

                    
                    var _SS_launch_bar = '';
                    /* '<a href="http://submit.shutterstock.com/main.mhtml" style="font-size:9pt" ><b>Home</b></a> | '; */
                    
                    if (_SSusername)
                       _SS_launch_bar += '<a href="http://www.shutterstock.com/g/'+ _SSusername +'" style="font-size:9pt" title="Images Gallery" ><img src="http://submit.shutterstock.com/images/camera_icon.png" style="border:0" align="absmiddle"/></a> | ';
                    
                    /* _SS_launch_bar += '<div id="F5_launch_forum" style="display:inline"><a href="http://submit.shutterstock.com/forum/" ><b>Forum</b></a></div> | '; */
                    
                    _SS_launch_bar += '<a href="http://submit.shutterstock.com/review.mhtml?type=photos"  ><b>Images Submitted</b></a> | ';
                    
                    _SS_launch_bar += _refresh_pixel ;
                    var _html_refresh_sel = ' <span id="F5_users_count">??</span> <span id="F5_refresh_mark" style="cursor:pointer" title="Force refresh for TODAY">Refresh</span> <select id="F5_refresh_sel" title="REFRESH TIME in Minutes"> ' +

                    '<option value="3">3</option>' +
                    '<option value="5">5</option>' +
                    '<option value="10">10</option>' +
                    '<option value="15">15</option>' +
                    '<option value="20">20</option>' +
                    '<option value="30">30</option>' +
                    '<option value="45">45</option>' +
                    '<option value="60">60</option>' +
                    '<option value="180">180</option>' +
                    '</select>';
                    
                    var _F5_eff_glow = '-moz-box-shadow: 0 0 6px #d2d2d2; -webkit-box-shadow: 0 0 6px #d2d2d2; box-shadow: 0 0 6px #d2d2d2;';
                    var _F5_eff_glow_2 = '-moz-box-shadow: 0 0 7px #929292; -webkit-box-shadow: 0 0 7px #929292; box-shadow: 0 0 7px #929292;';

                    var _F5_eff_corner_small = '-moz-border-radius: 1px; border-radius: 1px; -webkit-border-radius: 1px;';
                    var _F5_eff_corner = '-moz-border-radius: 2px; border-radius: 2px; -webkit-border-radius: 2px;';
                    
               var _html_panel_stats = '<div id="F5_stat_panel" style="'+ _F5_eff_corner + _F5_eff_glow +'font-size:11pt;padding:8px;font-family:sans-serif;position:absolute;width:80%;height:78%;left:10%;top:17.5%;background-color:white;border:4px solid #99CA3C;display:block;z-index:100"> ' +
                    '<div id="F5_buttons" style="margin-bottom:6px"><input  id="F5btn_stats" class="F5btn_standard" type="button" value="Live Stats" /> ' +
                    '<input type="button" id="F5btn_totalStats" class="F5btn_standard" value="Total stats" /> ' +
                    '<input  id="F5btn_referrals" class="F5btn_standard" value="Referrals" type="button"  /> ' +
                    '</div>' +
                    
                    '<div style="width:50%;text-align:right;position:absolute;top:8px;right:8px">' +
                    
                    _html_refresh_sel +
                    
                    ' | <input id="F5stat_cancel" class="F5btn_standard" value="Close" type="button" /></div>' +
                    
                    ' <div id="F5_stat_panel_title"><span  style="color:#669D30;">StatSS for</span>'
                        + ' <span id="F5_put_date" style="color:#447D20;font-weight:bold">---date---</span>'
                        +'<span id="F5_put_DLs" style="color:#224D10;margin-left:10px">---DLs---</span>'
                        + '<span id="F5_put_cash" style="color:#224D10;margin-left:8px">---$---</span> ' 
                        + '<span id="F5_put_monthly" style="color:#224D10;margin-left:8px">---$---</span> ' 
                        + '<span id="F5_put_GROSS" style="color:#224D10;margin-left:8px">---$---</span>'
                    + '</div> ' 
                    +
                    

                    '<div id="F5stat_work" style="visibility:hidden"> </div>' +
                  '<div id="F5stat_status" style="clear:both;overflow:auto;height:42%;margin:6px;margin-top:4px"></div>' +
                    
                        '<div id="F5stat_status_referrals" style="clear:both;overflow:hidden;height:42%;margin:6px;margin-top:4px;display:none">' +
                            '<div id="F5stat_status_referrals_menu" style="width:100%;display:block;margin-bottom:2px;overflow:hidden">' +
                            '<input type="button" value="Run check" id="F5btn_referrals_chk_gal" class="F5btn_standard" />' +
                            '<input type="button" value="c" id="F5btn_referrals_clear_localS" class="F5btn_standard" style="float:right" title="Better don`t clear the cached results - otherwise You`ll need run the check again" />' +
                            '</div>' +
                            
                            '<div id="F5stat_status_referrals_panel" style="overflow:auto;height:85%"></div>' +
                        '</div>' +

                    '<div id="F5stat_totals" style="background:white;height:42%;display:none;overflow:auto;margin:6px;margin-top:4px">' +
                        '<div id="F5stat_totals_title" style="word-spacing:2pt;margin-bottom:6px;margin-top:6px;font-weight:bold;font-family:sans-serif;font-size:13pt;color:#669D30">Total stats <input type="checkbox" id="F5btn_autoIADB_check" value="autoIADB_check" title="ON / OFF"/> enabled   <a class="F5btn_standard" href="#" style="font-weight:normal;color:black;padding:4px" id="F5btn_DBGtotalStats" ><b>VIEW Log</b> on/off</a> '
                        + ' <a href="#"  class="F5btn_standard" style="font-weight:normal;padding:4px"  id="F5btn_DBGtotalStats_clear_localS" >CLEAR ALL to default</a>'
                        + '</div>' 
                    +'<div id="F5stat_totals_status" style="margin-bottom:6px;font-family:sans-serif;font-size:10pt;height:1.3em">Please wait...</div>' +
                    '<div id="F5stat_totals_place" style="width:90%"><img src="http://submit.shutterstock.com/images/edit.png" /></div>' +
                    '<div id="F5stat_totals_dbg" style="'+ _F5_eff_corner + _F5_eff_glow +'padding:6px;overflow:auto;position:absolute;top:10%;right:1%;border:2px solid #aaccaa;width:47%;background:#fefefe;height:21%"><b>Stats SPIDER</b> log - be patient..<br /><br /> For faster results - YOU CAN leave this SS page open to collect STATS - and use another page to browse<br /> </div>' +
                    '</div>' +

                    '<div id="F5_app_status" > &raquo; <span id="F5_app_status_txt"></span> | CTRL: <span id="F5_LSdbg"></span></div>' +

                    '<div id="F5stat_stat_data" style="clear:both;overflow:auto;height:41%;margin:10px;margin-top:0px;margin-bottom:0px"><img src="http://footage.shutterstock.com/images/loading_icon_2.gif" /></div>'
                    +'<div style="margin:auto;clear:both;position:absolute;text-align:center;color:#638f10;bottom:0px;width:98%;height:12pt;"> ^ Click ROW to Switch a DAY ^</div>' +
                    '</div>' +
                    
                    '<div id="F5stat_thumbs_direct_edit" style="'+ _F5_eff_corner +'position:absolute;left:7%;top:10%;width:86%;height:84%;border:1px solid #dcf0b5;background:#f7fceb;z-index:120;display:none;border:2px solid #99CA3C;padding:8px;overflow:auto">' +
                    '<div id="F5_thumb_panel_title"><div style="margin-bottom:6px;font-weight:bold;font-family:sans-serif;font-size:11pt;color:#669D30">Edit photo data ' +
                    '<input id="F5stat_editor_cancel" class="F5btn_standard" value="Close" type="button" style="float:right" /></div>' +
                    '</div>' +
                    '<div id="F5stat_editor_place" style="float:left;width:auto;height:290px;overflow:auto;font-family:sans-serif"><img src="http://footage.shutterstock.com/images/loading_icon_2.gif" /></div>' +
                    '<div id="F5stat_editor_IADB_place" style="float:left;width:52%;padding:4px"><img src="http://footage.shutterstock.com/images/loading_icon_2.gif" /></div>' +
                    '<div id="F5stat_editor_form_place" style="clear:both"><img src="http://footage.shutterstock.com/images/loading_icon_2.gif" /></div>' +
                    '</div>' +
                   
                    '<div id="F5img_alt" style="'+ _F5_eff_corner + _F5_eff_glow_2 +'display:none;cursor:pointer;position:absolute;top:3px;left:4px;z-index:101;font-weight:bold;font-size:8pt;color:#eeffee;z-index:110;background:#002211;width:400px;filter:alpha(opacity=90);opacity:.90;padding:7px;border:3px solid #99CA3C;font-family:sans-serif"> </div>'
                    
                    
                    /*
                       
                    + '<div id="F5_menu_forum" style="'+ _F5_eff_corner +_F5_eff_glow+'font-family:sans-serif;position:absolute; display:none;color:#2f4f05;font-size:10pt;padding:8px;width:auto;height:auto;background-color:white;border:3px solid #99CA3C;z-index:100"> ' 

                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=8">Anything Goes</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=2">General</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=14">Footage</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=16">Illustrators</a><br />'
                    + '<br />'

                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=4">Critique Tips Tricks</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=7">Cameras / Scanners / Software</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=5">Feature Requests / Suggestions</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=15">Bugs / Glitches</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=9">Questions / Answers</a><br />'
                    + '<br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=12">Photo Requests</a><br />'
                    + '- <a href="http://submit.shutterstock.com/forum/viewforum.php?f=18">Tax</a><br />'
                    + '</div>'                       
                    */
                    ;
                    
                    

                    
                    
                    var _html_stat_table_head = '<tr id="tTitles"><td id="tDaySel">Go to Day</td><td id="tALL">All DLs</td><td id="t25">25 AD</td><td id="tOD">OD</td><td id="tED">ED</td><td id="tREF">ref</td><td id="tbCD">bCD</td><td id="tREFSUB">ref Sub</td><td id="tFTCS">Ft cartSal</td><td id="tFTSUB">Ft Sub</td><td id="tREFFT">ref Ft</td><td id="tDAY">Daily</td></tr>';
                    
                    var _stat_table_titles = new Array();
                    _stat_table_titles['tDaySel'] = "Select a day below";
                    _stat_table_titles['tALL'] = "Downloads";
                    _stat_table_titles['t25'] = "25-A-Day Downloads";
                    _stat_table_titles['tOD'] = "On Demand Downloads";
                    _stat_table_titles['tED'] = "Enhanced License Downloads";
                    _stat_table_titles['tREF'] = "Referred Downloads";
                    _stat_table_titles['tbCD'] = "Backup CD";
                    _stat_table_titles['tREFSUB'] = "Referred Subscriptions";
                    _stat_table_titles['tFTCS'] = "Footage Cart Sales";
                    _stat_table_titles['tFTSUB'] = "Footage Subscriptions";
                    _stat_table_titles['tREFFT'] = "Referred Footage";
                    _stat_table_titles['tDAY'] = "Daily Total";
                    
                    var _scriptID = Math.floor(Math.random() * 128);
                    var _scriptIDcheckInterval = false;
                    
                    //var _on_page = false;
                    //var _on_page_area = false;
                    
                    var _menu_over_timeout = false;
                    
                    var _referrals_page_built = false;
                    var _referredUser_tmp_list = false;
                    var _referredUser_tmp_refIDs = false;
                    
                    var _referralsForceRefresh = false;
                    var _referrals_interval_check = false;
                    var _auto_referrals_check = false;
                    var _glob_referral_counter = 0;
                    var _referrals_check_running = 3;
                    var _referrals_dataSize = 0;
                    
                    var _imgADB = {};
                    
                    var _imgADBcurrPage = 1;
                    var _imgADBnumPages = 0;
                    var _imgADBcurrChapter = 0;
                    var _imgADBchapters = ['25_a_day','on_demand','enhanced' ];
                    
                    var _IADBmode;
                    var _stat_IADBauto_refresh_int = false;
                    var _stat_IADBauto_refresh_time = false;
                    var _stat_IADBauto_refresh_continue = 0.3;
                    var _stat_IADBauto_refresh_DayWait = 0.05;
                    var SS_DB_dailyDone = 12 * 60;
                    var _switch_prev_panel = false;
                    //var _inplace_edit_id = false;
                    var localStor_OK = false;
                    
                    
                    if (!(_IADBmode = getCookie('SSscr_IADBmode')) || _IADBmode == 'auto') {
                        _IADBmode = 'auto';
                    }
                    else {
                        _IADBmode = getCookie('SSscr_IADBmode');
                    }

                    
                    
                    if (localStorage) {
                        var localStor_OK = true;
                        
                        if (localStorage['_imgADB']) 
                            _imgADB = JSON.parse( localStorage.getItem('_imgADB') );

                        
                        if (localStorage['_imgADBcurrPage']) 
                            _imgADBcurrPage = parseInt(localStorage['_imgADBcurrPage']);
                        
                        if (localStorage['_imgADBnumPages']) 
                            _imgADBnumPages = parseInt(localStorage['_imgADBnumPages']);
                        
                        if (localStorage['_imgADBcurrChapter']) 
                            _imgADBcurrChapter = localStorage['_imgADBcurrChapter'];
                        
                    }
                    
                    
                                
                                /*
                             _imgADBcurrPage = 1;
                             _imgADBnumPages = 0;
                             _imgADBcurrChapter = 1;
                             _IADBmode = 'auto';
                             */
                    function plr_submit_prev_ON(){
                    /*
                     var _match = /\(\'(.*)\'\)/i.exec($("#results-mode-form").attr('action'));
                     var plr_2 = _match[1];
                     
                     window.location.href = '/change_results_mode.mhtml?results_mode=dynamic&' + plr_2;
                     */
                    };
                    
                    function plr_submit_prev_OFF(){
                    
                        var plr_string = window.location.hash;
                        var repl = /[#]/gi;
                        var plr_2 = plr_string.replace(repl, '');
                        
                        window.location.href = '/change_results_mode.mhtml?results_mode=legacy&' + plr_2;
                        
                    };
                    
                    
                    
                    if (_docLocation.search('www.') < 0) 
                        var widget_main = _SS_launch_bar  
                        + '<input type="button" id="F5stat_start" class="F5btn_standard" value="Stats" /> '  
                        + ' <a href="http://fotostocki.pl/artykuly/shutterstock-site-patch-update/" title="Info and Manual" target="_blank" style="font-size:9pt;font-weight:normal\" >SS SiteBoost</a> ' + '<a href=\"http://fotostocki.pl/artykuly/shutterstock-site-patch-update/#update-' + _version_number + '" title="UPDATE INFO" target="_blank" style="font-size:9pt">' + _version + _update + '</a> :: ' + _refresh_pixel;
                    else {
                        widget_main = _SS_launch_bar +
                        ' <a href="http://fotostocki.pl/artykuly/shutterstock-site-patch-update/" title="Info and Manual" target="_blank" style="font-size:9pt;font-weight:normal\" >SS SiteBoost</a> ' +
                        '<a href=\"http://fotostocki.pl/artykuly/shutterstock-site-patch-update/#update-' +
                        _version_number +
                        '" title="UPDATE INFO" target="_blank" style="font-size:9pt">' +
                        _version + _update
                        '</a> :: ';
                        _on_page = 'GALLERY';
                    }

                    window.plr_stop_go = -1;
                    var _get_alt_txt_prv = '';
                    var plr_edit = '';
                    
                    
                    
                    
                    // FOOTAGE ?
                    
                    //var str_href = _docLocation;
                    var plr_continue = false;
                    
                    var _match = /footage\.shutt.*\/clip-(\d+)-.*\.html/i.exec(_docLocation);
                    
                    if ((_match)) {
                        window.plr_stop_go = 1;
                        window.location.href = 'http://submit.shutterstock.com/edit_media.mhtml?id=' + _match[1] + '&type=footage';
                    }
                    
                    
                    _match = /footage\.shutt.*((\?submitter_name=)|(\?submitter_id=)|(\/gallery-))([a-zA-Z0-9]+)[^&\.]*/i.exec(_docLocation);
                    
                    if ((_match)) {
                        plr_go_footage = function(){
                        
                            $('div.content-container').prepend('<div id="plr_status" style="'+ _F5_eff_corner +'color:black;background:#fBF4f8;float:right;font-size:9pt;padding:8px;clear:both;margin-bottom:20px;margin-top:8px">' +
                            widget_main +
                            ' <span style="font-weight:normal;color:red"> Edit enabled</span> :: footage</div>');
                            
                            
                            $('.video-float-container').each(function(index){
                            
                                _tmp_txt = $(this).find('.video-caption').find('a:first').attr('href');
                                _match = /\/clip-\d+-(.*)\.html/i.exec(_tmp_txt);
                                _tmp_txt = _match[1];
                                
                                $(this).find('.clip-thumbnail').after('<div class="clssplr_footage_title" style=" filter:alpha(opacity=70); opacity:.70; margin:3px;width:156px;position:absolute;top:0;left:0;z-index:10;background:black;color:#fDFfa9;font-size:8pt"><div style="margin:10px">' + _tmp_txt.replace(/-/g, ' ') + '</div></div>');
                                
                                _match = /download_options\.html\?id=(\d+)/i.exec($(this).find('a.thumb-option').attr('href'));
                                
                                if (_match && (_match[1] != null)) {
                                    plr_edit = "javascript: window.location.href='http://submit.shutterstock.com/edit_media.mhtml?id=" + _match[1] + "&type=footage'";
                                    $(this).find('.thumb-option-table').prepend('<tr><td colspan=\"2\" class=\"thumb-option-cell\"><div><img src=\"http://submit.shutterstock.com/images/edit.png\" class=\"clssplr_edit\" onclick=\"' + plr_edit + '\" title=\"Edit ' + _match[1] + ' \"></div></td></tr>');
                                };
                                
                                                            });
                            
                            $('.clssplr_footage_title').hide();
                            
                            $('.video-thumb-container').mouseover(function(){
                                $(this).find('.clssplr_footage_title').show();
                            });
                            $('.video-thumb-container').mouseout(function(){
                                $(this).find('.clssplr_footage_title').hide();
                            });
                            
                            
                            $('.clssplr_edit').css({
                                'border': '0px',
                                'cursor': 'pointer',
                                'margin': '3px 3px 16px 3px'
                            });
                            $('a.page-number').css({
                                'font-size': '10pt',
                                'font-weight': 'bold'
                            });
                            

                            
                        }
                        
                        plr_go_footage();
                        
                    }
                    
                    if ((str_href.search("results.mhtml") > 0)) {
                        if (!confirm('Need to disable original Image Previews FIRST\n\nOK - disable and CLICK AGAIN THE BOOKMARK (if bookmarklet used) \nCANCEL to abort')) {
                        }
                        else {
                            plr_submit_prev_OFF();
                        }
                    }
                    else {
                        plr_continue = true;
                    }

                    
                    
                    // SINGLE PHOTO at WWW. 
                    
                    _match = _preg_match( _docLocation, 'www.shutterstock.com.*((#photo_id=)|(pic\\.mhtml\\?id=)|(\\/pic-))(\\d+)');
                    
                    if ( _on_page == 'SINGLE_PHOTO' ) {
                        window.plr_stop_go = 1;
                        //_on_page = 'SINGLE_PHOTO';
                       
                        if (!_autorun)
                            window.location.href = 'http://submit.shutterstock.com/edit_media.mhtml?id=' + _match[5] + '&type=photos';
                        else {
                            plr_edit = "javascript: window.location.href='http://submit.shutterstock.com/edit_media.mhtml?id=" + _match[5] + "&type=photos';return false";
                            
                            $( ss_hooks['edit pic www'] ).prepend('<div style="font-size:10pt;font-weight:bold;margin-bottom:16px;border:1px dashed green;padding:4px"><a href="" onclick="' + plr_edit + '"><img  src=\"http://submit.shutterstock.com/images/edit.png\"  class=\"clssplr_edit\" title=\"Edit ' + _match[5] + '\"> Edit</a></div>');
                            $('.clssplr_edit').css({
                                'border': '0px',
                                'cursor': 'pointer',
                                'margin': '3px',
                                'vertical-align': 'middle'
                            });
                            
                        }
                    }
                    
                    
                    
                    
                    
                    _getSSInitialData();

                        if (plr_continue ||
                        (str_href.search("results.mhtml") < 0) ||
                        (str_href.search("main.mhtml") > 0) ||
                        (str_href.search("home.mhtml") > 0)) {
                        
                            var _thumb_factor;

                            if ((str_href.search("main.mhtml") > 0) || (str_href.search("home.mhtml") > 0)) {
                            
                                _thumb_factor = 2;
                                
                                _tmp_html = $('body').html();
                                _new_content = _tmp_html.replace(/[\n\r\t]/g, '');

                                myRGXP = new RegExp('Your Image Gallery.*?"http:\\/\\/shutterstock\\.com\\/g\\/(.*?)"', 'gi');
                                _match = myRGXP.exec(_new_content);
                                
                               if (_match && _match[1]) 
                                   putCookie('SSusername', _match[1], 60 * 24);
                                /*
                                _new_content = _tmp_html.replace(/[\n\r\t]/g, '');
                                
                                myRGXP = new RegExp('Images in gallery<\/a>.*?detailcell.*?>(\\d+)<\\/td', 'gi');
                                _match = myRGXP.exec(_new_content);

                                
                                if (!_match) {
                                    myRGXP = new RegExp('class="main_number">(\\d+)<\/span>\\s*active\\s+images', 'gi');
                                    _match = myRGXP.exec(_new_content);
                                }
                                

                                if (_match && _match[1]) {
                                    putCookie('SSimgsInGall', _match[1], 60 * 1);
                                }                                

                                */
                              
                                
                                

                            }
                            else 
                                _thumb_factor = 1;
                            
                            
                            /*
                            
                            if (str_href.search("ubmit.shutterstock.com") > 0) {
                                _on_page_area = 'SUBMITTER';
                            }
                            
                            // This area disappeared from the SS site
                            
                            //if (str_href.search("top50.mhtml") > 0) {
                            //    _on_page = 'TOP50';
                            //}
                            

                            if (str_href.search("approved=-1") > 0) {
                                _on_page = 'REJECTED';
                            }
                            if (str_href.search("approved=1") > 0) {
                                _on_page = 'APPROVED';
                            }
                            if ((str_href.search("home.mhtml") > 0) || (str_href.search("main.mhtml") > 0)) {
                                _on_page = 'HOME';
                                
                            }
                            if (_tmp_match = _preg_match(_docLocation, 'submit\\.shutterstock\\.com\\/edit_media\\.mhtml\\?id=(\\d+)\\&type=photos')) {
                                _on_page = 'EDIT_PHOTO';
                                _inplace_edit_id = _tmp_match[1];
                                
                            }
                            */
                            
                            
                            

                            plr_go = function(){
                            
                                var _stat_interval_refresh = null;
                                var _stat_interval_mark_factor = 0;
                                var _stat_timer_refresh = null;
                                var _stat_refreshing = false;
                                
                                _IADBauto();
                                
                                
                                var window_main = 
                                ' <div id="SS_launch_bar" style="width:91%;margin:auto;clear:both;text-align:center;font-family:sans-serif;font-size:9pt;font-weight:normal">'
                                
                                + ' <div id="plr_status" style="'+ _F5_eff_corner +'color:orange;background-color:#aaa;padding:4px 0px;width:100%;text-align:center;border:1px solid #ccc;font-weight:normal" >' 
                                + widget_main +
                                ' <span style="font-size:9pt;font-weight:normal;color:white"> Edit enabled</span>';
                                
                                
                                if ((str_href.search("main.mhtml") > 0) || (str_href.search("home.mhtml") > 0)) {
                                    window_main += '<div id="SSdbg"></div></div><p style="clear:both;font-size:1px">&nbsp;</p></div>';
                                }
                                else {
                                
                                    window_main += '<div id="SSdbg"></div></div><p style="clear:both;font-size:1px">&nbsp;</p></div>';
                                }

                                
                                
                                
                                
                                // Universal hook for main panel widget 2016 07
                                
                                tmp_get = document.getElementsByClassName( ss_hooks['main menu submit']  )[0];   // first in the node
                                
                                tmp = document.createElement('div');
                                tmp.innerHTML = window_main;
                                
                                tmp_get.parentNode.insertBefore( tmp, document.getElementById("div"));
                                
                                        //.insertAdjacentHTML('afterbegin' , window_main);
                                
                                
                                // Disabled 06 2016 
                                // Seems like some adjustments based on different page hooks
                                // this time we try to make it more universal
                                // plus at the moment finding the hooks Shutterstock changed
                                
                                
                                
                                /*
                                if ( tmp != null ) {
                                    // Instead of JQ and class / id names
                                    // use first DIV
                                    // $(ss_hooks['main menu submit']).prepend(window_main);
                                    
                                    //document.getElementsByClassName( ss_hooks['main menu submit'] )[0].append(window_main);
                                }
                                else 
                                    if ($('#global_header').length ) {
                                        $('#global_header').append(window_main);
                                        $('#SS_launch_bar').hide().slideDown(300);
                                        $('#message_center').css({
                                            'margin': '0'
                                        });
                                        
                                        $('#message_center_container').css({
                                            'margin': '0'
                                        });
                                        alert('altern');
                                    }
                                    else 
                                        if ($('#quickbar').length) {
                                            if ($('table:first').length) {
                                            
                                                $('table:first div:first').css({
                                                    'margin': '0px'
                                                });
                                                $('table:first').next().css({
                                                    'margin-top': '0px'
                                                });
                                                $('table:first').after(window_main);
                                                
                                                $('#quickbar').css({
                                                    'margin': '0px'
                                                });
                                                $('#quickbar').parent().css({
                                                    'margin': '0px',
                                                    'width': '80%'
                                                });
                                                
                                            }
                                        }   
                                
                                */
                                

                                $('#SS_launch_bar * a').css({'color':'black', 'font-size':'9pt', 'font-family':'sans-serif','text-decoration':'none', 'font-weight':'normal'})
/*                                
                                $('.F5btn_standard').css({
                                    'font-size': '9pt',
                                    'font-weight': 'normal',
                                    'border': '2px solid #98d228',
                                    'background': '#dcf0b5',
                                    'cursor': 'pointer',
                                    '-moz-border-radius': '5px',
                                    'border-radius': '5px'
                                    ,'padding':'0.1em'

                                });
                                */

                                $('#F5stat_start').attr('class', 'F5btn_standard');
                                $('body').append(_html_panel_stats);
                                $('#F5_stat_panel').hide();
                                
                                function _F5_start(_tmp_date){
                                
                                    if (_stat_refreshing) 
                                        return 0;
                                    
                                    _stat_refreshing = true;
                                    
                                    _getSSInitialData();
                                    
                                    
                                    _panel_switch_to('F5_stat_panel');
                                    _panel_switch_to('F5stat_status', 'nokill');// enable thumb images stat display
                                    $('#F5_users_count').html( _got_it );
                                    
                                    _use_date = _get_date();
                                    

                                    
                                    if (_tmp_date) {
                                        _use_date = _tmp_date;
                                        $('#F5_app_status_txt').hide().text('Browsing downloads: ' + _tmp_date).fadeIn('slow');
                                    }
                                    
                                    _do_stats(_use_date);
                                    
                                    


                                    
                                    if (!_stat_timer_refresh) 
                                        $("#F5_refresh_sel").val(5);
                                        
                                    $("#F5_refresh_sel").change(function(){
                                        _stat_timer_refresh = $(this).val();
                                        $('#F5_app_status_txt').hide().text('Auto refresh every ' + _stat_timer_refresh + ' min').fadeIn('slow');
                                        refresh_change();
                                    });
                                    
                                    _stat_timer_refresh = $("#F5_refresh_sel").val();
                                    
                                    if (!_tmp_date) 
                                        $('#F5_app_status_txt').hide().text('Auto refresh every ' + _stat_timer_refresh + ' min').fadeIn('slow');
                                    

                                    function refresh_change(){
                                    
                                        clearInterval(_stat_interval_refresh);
                                        _stat_interval_refresh = setInterval(function(){
                                            _F5_start();
                                        }, _stat_timer_refresh * 60 * 1000);
                                    }
                                    
                                    
                                    refresh_change();
                                    
                                    
                                    _stat_interval_mark = setInterval(function(){
                                        if (_stat_interval_mark_factor < 1) 
                                            $('#F5_refresh_mark').fadeTo('slow', 0.1);
                                        else 
                                            $('#F5_refresh_mark').fadeTo('slow', 1);
                                        
                                        _stat_interval_mark_factor = 1 - _stat_interval_mark_factor;
                                    }, _stat_timer_refresh * 1 * 500);
                                    
                                    
                                   
                                    
                                    $('#F5_stat_panel * ').css({
                                        'font-size': '9pt'
                                    });
                                    $('#F5_stat_panel_title * ').css({
                                        'font-size': '11pt'
                                    });
                                    
                                    $('#F5_app_status').css({
                                        'clear': 'both',
                                        'overflow': 'hidden',
                                        'height': '16pt',
                                        'margin': '11px',
                                        'margin-bottom': '0px',
                                        'margin-top': '2px'
                                    });
                                    
                                    $('#F5_app_status_txt').css({
                                        'font-size': '9pt',
                                        'font-family': 'sans-serif',
                                        'font-variant': 'small-caps'
                                    
                                    });
                                    
                                }
                                $('#F5stat_start').click(function(e){
                                    e.preventDefault();
                                    _F5_start();
                                    
                                });
                                
                                
                                
                                // 2016 - FORUM feature disabled - forum shortcuts menu
                                /*
                                 $('#F5_launch_forum').mouseenter(
                                   function(e){
                                       
                                     _x = $(this).offset().left;
                                     _y = $(this).offset().top;
                                    
                                     $('#F5_launch_forum').addClass('mouse-over');
                                     $('#F5_launch_forum a').css({'color':'#000000'});
    
                                     if(_menu_over_timeout)       
                                         clearTimeout(_menu_over_timeout);
                                             
                                     _menu_over_timeout = setTimeout ( function(){
                                            
                                            if (!$('#F5_launch_forum').hasClass('mouse-over')) {
                                            }
                                            else {
                                                
                                                $('#F5_menu_forum > a').css({'font-size':'9pt','color':'#609030','font-weight':'bold'});
                                                $('#F5_menu_forum > a').hover( 
                                                    function(){
                                                    $(this).css({'color':'black'}) }, 
                                                    function(){
                                                    $(this).css({'font-weight':'bold','color':'#609030', 'font-size':'9pt', 'font-family':'sans-serif'})
                                                    }
                                                    );

                                                $('#F5_menu_forum').show().css({'top': _y + 15 ,'left': _x -10});
                                                
                                            }
                                            
                                         } , 140
                                         );
                                     
                                 }
                                 );
                                 */
                                 /*

                                  $('#F5_launch_forum').mouseleave(
                                   function(e){
                                       $('#F5_launch_forum').removeClass('mouse-over');         
                                       $('#F5_launch_forum a').css({'color':'normal'});

                                       if( !$('#F5_menu_forum').hasClass('mouse-over'))
                                          $('#F5_menu_forum:visible').hide();
                                       $('#F5_launch_forum a').css({'color':'#568215'});    
                                       });

                                 

                                 $('#F5_menu_forum').mouseleave(
                                 function(e){
                                    $('#F5_menu_forum').removeClass('mouse-over');
    
                                    if( !$('#F5_launch_forum').hasClass('mouse-over'))
                                        $(this).delay(200).hide();
                                 }
                                 );



                                 $('#F5_menu_forum').mouseenter(
                                 function(e){
                                    $('#F5_menu_forum').addClass('mouse-over');
                                    $('#F5_menu_forum:hidden').show();
                                    }
                                 );


                                 $('#F5_menu_forum').click(
                                 function(e){
                                      if(e.target.nodeName != 'A') 
                                       $('#F5_menu_forum').fadeOut('normal');
                                 }
                                 );
                                 
                                */
                                
                                $('#F5stat_cancel').click(function(e){
                                    e.preventDefault();
                                    $("#F5_refresh_sel").unbind('change');
                                    
                                    $('#stat_table tr.stat_row td:not(.date)').unbind('click');
                                    $('#stat_table * TR.stat_row').unbind('mouseout');
                                    $('#stat_table * TR.stat_row').unbind('mouseover');
                                    
                                    clearInterval(_stat_interval_refresh);
                                    clearInterval(_stat_interval_mark);
                                    $('#F5_stat_panel').hide();
                                    
                                });
                                
                                $('#F5stat_cancel').css({
                                    'color': 'red',
                                    'border': '1px solid red'
                                });
                                
                                
                                function _get_date(){
                                    var d = new Date();
                                    var curr_date = d.getDate();
                                    var curr_month = d.getMonth() + 1;
                                    var curr_year = d.getFullYear();
                                    
                                    if (curr_month < 10) 
                                        curr_month = '0' + curr_month;
                                    if (curr_date < 10) 
                                        curr_date = '0' + curr_date;
                                    
                                    _full_Date = curr_year + "-" + curr_month + "-" + curr_date;
                                    return _full_Date;
                                }
                                
                                
                                
                                var _total_DLs, _total_Cash;
                                var _full_Date, _date_YM;
                                
                                
                                
                                function _do_stats(_use_date){
                                
                                    _full_Date = _use_date;

                                    
                                    _date_YM = _full_Date.substr(0, 7);
                                    
                                    $('#F5_stat_panel * #F5_put_date').html(_full_Date);
                                    
                                    
                                    function _build_page(_html_page){
                                    
                                        _new_content = _html_page.replace(/[\n\r\t]/g, '');
                                        
                                        var myRGXP = /(http[^>]*?thumb_small[^>]*?jpg).*?alt="([^"><]*?)".*?class=\"datacell.*?>(\d+)<\/td>.*?align=center>(.*?)<\/td>/gi;
                                        
                                        var _match;
                                        var _img_nr = 0;
                                        _images_found = false;
                                        
                                        
                                        $('#F5stat_status').html('');
                                        
                                        while ((_match = myRGXP.exec(_new_content)) != null) {
                                        
                                            _tmp_put_DLs = '<div style="position:absolute;bottom:3px;left:4px;z-index:100;font-size:8pt;color:white">' + _match[3] + '</div>';
                                            _tmp_put_Cash = '<div style="position:absolute;bottom:3px;right:4px;z-index:100;font-size:8pt;color:white">' + _match[4] + '</div>';
                                            _tmp_bg = '<div class="F5img_meta" style="'+ _F5_eff_corner_small +'position:absolute;bottom:0px;left:0px;z-index:99;background:#001F1b;width:100%;height:19px;filter:alpha(opacity=70); opacity:.70;padding-top:2px"></div>';
                                            
                                            var myRGXP_part = new RegExp('\\-(\\d+)\\.jpg', 'gi');
                                            var _match_part;
                                            _match_part = myRGXP_part.exec(_match[1]);
                                            
                                            $('#F5stat_status').append('<div style="position:relative;float:left;height:100px;margin:2px;overflow:hidden;width:100px">' +
                                            '<img class="F5img_thumb" id="img_nr' +
                                            +_match_part[1] +
                                            '" src="' +
                                            _match[1] +
                                            '" style="margin:0;padding:0" alt="' +
                                            _match[2].replace('stock photo :', '') +
                                            '"><br /><br />' +
                                            _tmp_put_DLs +
                                            _tmp_put_Cash +
                                            _tmp_bg +
                                            '</div>');
                                            $('#img_nr' + _match_part[1]).hide();
                                            
                                            _img_nr++;
                                            _images_found = true;
                                        }
                                        
                                        if (!_images_found) 
                                            $('#F5stat_status').html('<span class="F5_clsText">' + _full_Date + ' - No images yet</span>');
                                        
                                        $('.F5_clsText').css({
                                            'font-size': '8pt',
                                            'font-weight': 'bold'
                                        });
                                        
                                        
                                        
                                        
                                        
                                        
                                        if ($('.F5img_thumb').size())
                                        {
                                        
                                            $('.F5img_thumb').each(function(index){
                                                var $_pic = $(this);
                                                
                                                
                                                if (index <= 100)
                                                {
                                                    _tmp_timeout = index * (100 - index);
                                                    setTimeout(function(){
                                                        $_pic.fadeIn(300).css({
                                                            'margin': '2px'
                                                        });
                                                    }, _tmp_timeout);
                                                }
                                                else {
                                                    $_pic.show(10).css({
                                                        'margin': '2px'
                                                    });
                                                }
                                                setTimeout(function(){
                                                    _stat_refreshing = false;
                                                }, index * 100);
                                                
                                            });
                                        }
                                        else
                                        {
                                            _stat_refreshing = false;
                                        }
                                        
                                        
                                        $('#F5stat_status').append(_refresh_pixel);

                                        
                                        $('.F5img_thumb').click(function(e){
                                            
                                            if (_on_page == 'EDIT_PHOTO') {
                                                alert("Can't edit while on 'Edit Page'\nFINISH EDITING or leave current page");
                                                return false;
                                            }
                                            
                                            
                                            
                                            _img_src = $(this).attr('src');
                                            
                                            _big_img_src = _img_src.replace('thumb_small', 'display_pic_with_logo');
                                            
                                            _match_part = _preg_match(_big_img_src, '\\-(\\d+)\\.jpg');
                                            _runInPlaceEditor(_match_part[1], _big_img_src);
                                            return false;
                                            
                                            
                                        });

                                        
                                        $('img.F5img_thumb').mouseenter( function(e){
                                            var _tmp_put_arch = _buildIADB_infoTable($(this).attr('id').replace('img_nr', ''), 'single');
                                            var _tmp_txt = "<b>" + $(this).attr('alt') + '</b>' + '<br />' +
                                            '<div id="thumbIADBInPlaceEditCSS">' +
                                            _tmp_put_arch +
                                            '</div>';


                                            $('#F5img_alt').html(_tmp_txt);
                                            
                                            
                                            $(this).css({
                                                'cursor': 'pointer'
                                            });
                                            
                                            _set_x = e.pageX - $('body').offset().left - 400 / 2 ;
                                            _set_y = e.pageY -180 - $('body').offset().top;
                                            
                                            if (_set_y < $(window).scrollTop() + 10) 
                                                _set_y = $(window).scrollTop() + 10;
                                            
                                            if (_set_x > $(window).width() - 400 - 20) 
                                                _set_x = $(window).width() - 400 - 20;
                                            
                                            if (_set_x < 10) 
                                                _set_x = 10;
                                            
                                            var _hg = $('#F5img_alt').height();
                                            
                                            $('#thumbIADBInPlaceEditCSS .IADBtable').css({
                                                'font-family': 'sans-serif',
                                                'font-size': '8pt'
                                            });
                                            $('#thumbIADBInPlaceEditCSS .IADBtable td').css({
                                                'color': '#f7fceb',
                                                'font-family': 'sans-serif',
                                                'font-size': '8pt',
                                                'padding-top': '3px',
                                                'font-weight': 'normal'
                                            });
                                            $('#thumbIADBInPlaceEditCSS span:contains( 0 )').css({
                                                'color': '#777777',
                                                'font-size': '8pt'
                                            });


                                          $('#F5img_alt').stop(true, true).delay(200).show().css({
                                                'top': _set_y + 'px',
                                                'left': _set_x + 'px',
                                                'z-index': '110'
                                            }); 
                                            
                                        
                                        });

                                        $('img.F5img_thumb').mouseleave(
                                        function(e){
                                            if( !$('#F5img_alt').hasClass('mouse-over'))
                                                $('#F5img_alt').stop(true, true).delay(200).hide();                                            
                                            } 
                                        );
                                        
                                      

                                        $('#F5img_alt').mouseenter( function(e){
                                            $(this).addClass('mouse-over');  
                                            $(this).stop(true, true).delay(200).show();
                                            
                                        });
                                       

                                        $('#F5img_alt').mouseleave( function(e){
                                            $(this).removeClass('mouse-over');  
                                            $(this).stop(true, true).delay(200).hide();
                                            
                                        });



                                        $('#F5img_alt').click(
                                        function(e){
                                        $(this).hide();
                                        }
                                        
                                        );
                                        
                                        
                                    }
                                    
                                    
                                    _tmp_filename = 'http://submit.shutterstock.com/stats_date.mhtml?date=' + _full_Date;
                                    
                                    $('#F5stat_status').html('<img src="http://footage.shutterstock.com/images/loading_icon_2.gif" />');
                                    $.get(_tmp_filename, _build_page);
                                    
                                    
                                    
                                    function _get_totals_for_day(_html_page){
                                    
                                        var _match;
                                        
                                        _new_content = _html_page.replace(/[\n\r\t]/g, '');
                                        _new = _new_content;
                                        myRGXP = new RegExp('<td class="total-heading">(.*?</tr>)\\s*<tr>\\s*<td colspan="11"', 'gi');
                                        _make_html = '<tr><td>';
                                        while (_match = myRGXP.exec(_new)) {
                                            _tmp_row = _match[1].replace('"stats_date.mhtml?date', '"http://submit.shutterstock.com/stats_date.mhtml?date');
                                            _make_html += _tmp_row;
                                        }
                                        
                                        _make_html += "</tr>";
                                        _make_html = _make_html.replace(/height="40" style="background-color: #e4eaff"/gi, '');
                                        _make_html = _make_html.replace(/<br>|:/gi, '');
                                        _make_html = _make_html.replace(/TOTALS/gi, '');
                                        _make_html = _make_html.replace(/<tr\s*>/gi, '<tr class="tr_overall">');
                                        _make_html_overall = _make_html;

                                        
                                        
                                        _new = _new_content;
                                        myRGXP = new RegExp('<tr><td class="date">(.*?)</tr>', 'gi');
                                        _make_html = _make_html_overall + _html_stat_table_head;
                                        
                                        while ( _match = myRGXP.exec(_new) ) {
                                            _tmp_row = _match[1].replace('"stats_date.mhtml?date', '"http://submit.shutterstock.com/stats_date.mhtml?date');
                                            _make_html += '<tr class="stat_row" title="Switch the DAY"><td class="date" title="Click to enter">' + _tmp_row + '</tr>';
                                        }
                                        
                                        
                                        
                                        $('#F5stat_stat_data').html('<table id="stat_table" style="width:100%;font-size:9pt;font-family:sans-serif">' + _make_html + '</table>');
                                        $('#F5stat_stat_data * TD').css({
                                            'padding': '3px'
                                        });
                                        $('#F5stat_stat_data * TR.tr_overall').css({
                                            'background': '#ECF9D2',
                                            'font-size': '10pt'
                                        });

                                        _new = _new_content;
                                        myRGXP = new RegExp('date=' + _full_Date + '.*?</a></td>.*?<td >(\\d+)</td>'
 +
                                        '.*?<td>(\\$\\d+\\.\\d+)</td>.*?class="date"', 'gi');
                                        _match = myRGXP.exec(_new);
                                        
                                        
                                        
                                        if (_match != null) {
                                            _tmp_put1 = _match[1];
                                            _tmp_put2 = _match[2];
                                            
                                        }
                                        else {
                                            _tmp_put1 = 0;
                                            _tmp_put2 = 0;
                                        }
                                        
                                        $('#F5_stat_panel * #F5_put_DLs').html('DLs: <b>' + _tmp_put1 + '</b>');
                                        $('#F5_stat_panel * #F5_put_cash').html(' Day: <b>' + _tmp_put2 + '</b>');
                                        
                                        _new = _new_content;
                                        
                                        var _tmp_regxp = '.*?total\\-value">\\$(\\d+\\.\\d+)<\/td>[^$]*?';
                                        //var _tmp_regxp = '.*?total\\-value">\\$(\\d+\\.\\d+)<\/td>';
                                        
                                        
                                        /*
                                        _tmp_regxp = 'ALL\\-TIME<br>TOTALS\\:' + '.*?total\\-value">(\\d+)<\/td>' 
                                            + _tmp_regxp
                                            + _tmp_regxp 
                                            + _tmp_regxp 
                                            + _tmp_regxp 
                                            + _tmp_regxp + _tmp_regxp + _tmp_regxp + _tmp_regxp 
                                            + _tmp_regxp + _tmp_regxp 
                                            //+  '.*?<\/tr>.*?' 
                                            + 'Gross Earnings\\:.*?\\$(\\d+\\.\\d+)<\/td>';
                                        */
                                        
                                        // "str".repeat(3) ;
                                        _tmp_regxp = 'ALL\\-TIME<br>TOTALS\\:' + '.*?total\\-value">(\\d+)<\/td>' 
                                            + Array(10+1).join(_tmp_regxp)
                                            + 'Gross Earnings\\:.*?\\$(\\d+\\.\\d+)<\/td>';
                                        
                                        
                                        
                                        
                                        myRGXP = new RegExp( _tmp_regxp, 'gi');
                                        _match = myRGXP.exec( _new ) ;
                                        
                                        //alert(_match);
                                        
                                        var _tVals = {};
                                        
                                        if ( _match != null) {
                                        
                                        
                                            _tVals.DLs = _match[1];
                                            _tVals.A25s = _match[2];
                                            _tVals.ODs = _match[3];
                                            _tVals.ELs = _match[4];
                                            _tVals.REF = _match[5];
                                            _tVals.bCD = _match[6];
                                            _tVals.REFsubs = _match[7];
                                            _tVals.FOTcs = _match[8];
                                            _tVals.FOTsubs = _match[9];
                                            _tVals.rFOT = _match[10];
                                            _tVals.total = _match[11];
                                            _tVals.gross = _match[12];
                                            
                                            $('#F5_stat_panel * #F5_put_GROSS').html('Gross earnings: <b>' + _tVals.gross + '</b>');
                                            
                                            putCookie('SSearningsValues', JSON.stringify(_tVals), 60 * 24);
                                        }
                                        
                                        
                                        _new = _new_content;
                                        var _tmp_regxp = '.*?total\\-value">\\$(\\d+\\.\\d+)<\/td>[^$]*?';
                                        
                                        _tmp_regxp = 'MONTH<br>TOTALS\\:' +
                                        '.*?total\\-value">(\\d+)<\/td>.*?'
                                            
                                            /*
                                            + _tmp_regxp + _tmp_regxp + _tmp_regxp + _tmp_regxp + _tmp_regxp + _tmp_regxp + _tmp_regxp 
                                            + _tmp_regxp + _tmp_regxp + _tmp_regxp
                                            */ 
                                        + Array(10+1).join(_tmp_regxp) + '<\/tr>.*?';
                                        
                                        myRGXP = new RegExp(_tmp_regxp, 'gi');
                                        _match = myRGXP.exec(_new);
                                        
                                        if (_match != null) {
                                            
                                            _tVals.DLs = _match[1];
                                            _tVals.A25s = _match[2];
                                            _tVals.ODs = _match[3];
                                            _tVals.ELs = _match[4];
                                            _tVals.REF = _match[5];
                                            _tVals.bCD = _match[6];
                                            _tVals.REFsubs = _match[7];
                                            _tVals.FOTcs = _match[8];
                                            _tVals.FOTsubs = _match[9];
                                            _tVals.rFOT = _match[10];
                                            _tVals.total = _match[11];
                                            
                                            putCookie('SSearningsValuesMonthly', JSON.stringify(_tVals), 60 * 24);
                                            
                                            $('#F5_stat_panel * #F5_put_monthly').html('Month: <b>$' + _tVals.total + '</b>');
                                            
                                        }
                                        
                                        $('#tTitles').find('TD').each(function(index){
                                        
                                            $(this).attr('title', _stat_table_titles[$(this).attr('id')]);
                                            $(this).css({
                                                'cursor': 'help',
                                                'font-weight': 'bold'
                                            });
                                        });
                                        $('#tTitles').css({
                                            'background': '#DCF0B5'
                                        });
                                        $('#stat_table * TR.stat_row').mouseover(function(e){
                                            e.preventDefault();
                                            $(this).css({
                                                'background': '#DCF0B5',
                                                'cursor': 'pointer'
                                            });
                                        });
                                        
                                        $('#stat_table * TR.stat_row').mouseout(function(e){
                                            e.preventDefault();
                                            $(this).css({
                                                'background': 'white'
                                            });
                                        });
                                        $('#stat_table tr.stat_row td:not(.date)').click(function(e){
                                            e.preventDefault();
                                            
                                            _new = $(this).parent().html();
                                            myRGXP = new RegExp('stats_date\\.mhtml\\?date=(\\d+-\\d+-\\d+)"', 'gi');
                                            _match = myRGXP.exec(_new);
                                            
                                            _F5_start(_match[1]);
                                            
                                        });
                                        
                                    }
                                    
                                    
                                    
                                    
                                    //$('#F5stat_stat_data').html('<span class="F5_clsText"><img src="http://footage.shutterstock.com/images/loading_icon_2.gif" /></span>');
                                    $('#F5stat_stat_data').html('<span class="F5_clsText">LOADING</span>');
                                    
                                    $('.F5_clsText').css({
                                        'font-size': '8pt',
                                        'font-weight': 'bold'
                                    });
                                    
                                    
                                    
                                    
                                    _tmp_filename = 'http://submit.shutterstock.com/stats.mhtml?year_month=' + _date_YM;
                                    

                                    $.get(_tmp_filename, _get_totals_for_day);
                                    
                                    
                                    
                                    
                                }
                                
                                function _REFERRALS_BTN_state(){
                                    if (getCookie('referrals_lock') == 'true') {
                                    
                                        $('#F5btn_referrals_chk_gal').attr('disabled', true);
                                    }
                                    else {
                                    
                                        $('#F5btn_referrals_chk_gal').attr('disabled', false);
                                    }
                                    
                                }
                                
                                function _build_Referrals_page(_html_page){
                                
                                
                                    if (_html_page) {
                                        _new_content = _html_page.replace(/[\n\r\t]/g, '');
                                        var myRGXP = new RegExp('target=gal>(\\d+)<\/a>.*?<td>(.*?)<\/td>.*?<\/tr>', 'gi');
                                        var _match;
                                    }
                                    
                                    var _gallery_link = 'http://www.shutterstock.com/gallery.mhtml?id=';
                                    var _footage_link_a = 'http://footage.shutterstock.com/gallery-';
                                    var _footage_link_b = '-p1.html';
                                    
                                    _referredUser = "";
                                    _tmp_cnt = 0;
                                    _tmp_pos = 1;
                                    
                                    _refIDs = new Array();
                                    
                                    
                                    
                                    if ((!_referrals_page_built) && (localStorage['referrals_HTMLlist'] == null))
                                    {
                                        while ((_match = myRGXP.exec(_new_content)) != null) {
                                        
                                        
                                            _referredUser = '<tr id="refID' + _match[1] + '" ><td>' +
                                            _tmp_pos +
                                            '. ' +
                                            _match[2] +
                                            '<br /><span class="togFullName"> </span>' +
                                            '</td>' +
                                            '<td class="gal"><a href="' +
                                            _gallery_link +
                                            _match[1] +
                                            '" target="gal"><img class="imgG" src="http://www.shutterstock.com/images/up_arrow.png" border="1"  /></a></td>' +
                                            '<td> </td>' +
                                            '<td class="footage"><a href="' +
                                            _footage_link_a +
                                            _match[1] +
                                            _footage_link_b +
                                            '" target="footage">' +
                                            '<img class="imgF" src="http://www.shutterstock.com/images/up_arrow.png" border="1"  /></a></td>' +
                                            '</a>' +
                                            '</tr>' +
                                            _referredUser;
                                            
                                            _refIDs[_tmp_cnt] = _match[1];
                                            
                                            _tmp_cnt++;
                                            _tmp_pos++;
                                        }
                                        
                                        
                                        if (_tmp_cnt - 1 == 0) {
                                            $('#F5stat_status_referrals_panel').html('<span class="F5_clsText">No Referrals found</span>');
                                            return false;
                                        }
                                        
                                        _tmp_header = '<tr class="F5ref_head"><td style="width:140px">1st name</td>' +
                                        '<td style="width:120px">Images</td>' +
                                        '<td> </td>' +
                                        '<td style="width:120px">Footage' +
                                        '</td></tr>';
                                        
                                        _referredUser = '<table id="F5referrals_table">' + _tmp_header + _referredUser + '</table>';
                                        _referredUser += 'About ' + Math.round(_tmp_pos * 7 / 60) + ' minutes needed to check the full list (depends on connection)<br /><br />'
                                        _referredUser += '<span style="font-size:9pt">1.) For large lists increase the stats refresh time <br />2.) Results will persist in cache only in modern browsers and until the browser session ends<br />3.) Next check allowed in 6 hours to avoid servers overload<br /><br />Still working on it</span>';
                                        
                                        _referredUser_tmp_list = _referredUser;
                                        
                                        _refIDs.reverse();
                                        _referredUser_tmp_refIDs = _refIDs;
                                        
                                        _referrals_page_built = true;
                                        
                                        $('#F5_app_status_txt').hide().text('Fresh referrals list built').fadeIn('slow');
                                    
                                    }
                                    else {
                                    
                                        if ((localStorage['referrals_HTMLlist'] != null))
                                        {
                                            _referredUser_tmp_list = localStorage['referrals_HTMLlist'];
                                            $('#F5_app_status_txt').hide().text('Referrals from local S cache').fadeIn('slow');
                                        }
                                        else {
                                            $('#F5_app_status_txt').hide().text('Referrals list from temporary cache').fadeIn('slow');
                                            _refIDs = _referredUser_tmp_refIDs;
                                        }
                                        
                                    }
                                    
                                    $('#F5stat_status_referrals_panel').html('');
                                    $('#F5stat_status_referrals_panel').append(_referredUser_tmp_list);
                                    _REFERRALS_BTN_state();
                                    
                                    
                                    $('#F5referrals_table').css({
                                        'float': 'left',
                                        'margin-right': '4px'
                                    
                                    });
                                    
                                    $('#F5referrals_table * TD').css({
                                        'padding': '3px',
                                        'margin': '1px',
                                        'font-size': '8pt'
                                    });
                                    
                                    $('#F5referrals_table * TR.F5ref_head > TD:first').css({
                                        'font-variant': 'small-caps',
                                        'font-weight': 'bold',
                                        'font-size': '9pt'
                                    });
                                    
                                    
                                    var _referralTog = 'empty';
                                    
                                    $('#F5btn_referrals_chk_gal').bind('mouseup.F5stat_status_referrals', (function(e){
                                        e.preventDefault();
                                        
                                        if (!_auto_referrals_check) {
                                            if ((localStorage) && (localStorage['referrals_HTMLlist'] != null)) {
                                                localStorage.removeItem('referrals_HTMLlist');
                                                _auto_referrals_check = true;
                                            }

                                            
                                            _referrals_page_built = false;
                                            _referredUser_tmp_list = false;
                                            _referredUser_tmp_refIDs = false;
                                            _referrals_check_running = 3;
                                            _F5_referrals();
                                        }
                                        _F5_referrals_check();
                                    }));
                                    if (_auto_referrals_check) {
                                        _F5_referrals_check();

                                    }
                                    
                                    
                                }
                                function _F5_referrals_check(){
                                
                                    _auto_referrals_check = false;
                                    
                                    $('#F5_app_status_txt').hide().text('Preparing to check... ').fadeIn('slow');
                                    
                                    _glob_referral_counter = 0;
                                    
                                    
                                    function _checkReferrals(){
                                        if (_referrals_check_running != 3) 
                                            return false;
                                        
                                        _referrals_check_running = 1;
                                        
                                        _tmp_cnt = _glob_referral_counter;
                                        _tmp_curr_pos = _refIDs.length - _tmp_cnt;
                                        
                                        $('#F5_app_status_txt').hide().text('Checking: ' + _tmp_curr_pos).fadeIn('normal');
                                        if (_tmp_cnt > 0) 
                                            $('#refID' + _refIDs[_tmp_cnt - 1]).css({
                                                'background': 'white'
                                            });
                                        
                                        $('#refID' + _refIDs[_tmp_cnt]).css({
                                            'background': '#b8eddc'
                                        });

                                        $('#refID' + _refIDs[_tmp_cnt] + ' * IMG.imgG').attr('src', 'http://submit.shutterstock.com/images/edit.png');
                                        _tmp_id = _refIDs[_tmp_cnt];
                                        $.getJSON('http://fotostocki.pl/plrangjs/_wrk/chk_gal.php?galId=' + _refIDs[_tmp_cnt] + '&cache=' + timeStampCache.getTime() + '&callback=?', function(data){
                                            _showReferral(_tmp_id, data, 'P');
                                        });
                                        $('#refID' + _refIDs[_tmp_cnt] + ' * IMG.imgF').attr('src', 'http://submit.shutterstock.com/images/edit.png');
                                        _tmp_id = _refIDs[_tmp_cnt];
                                        $.getJSON('http://fotostocki.pl/plrangjs/_wrk/chk_footage.php?footageId=' + _refIDs[_tmp_cnt] + '&cache=' + timeStampCache.getTime() + '&callback=?', function(data){
                                            _showReferral(_tmp_id, data, 'F');
                                        });
                                        
                                        
                                        function _showReferral(_id, _referralTog, _galType){
                                        
                                            if (_referralTog.IMGcount > 0) {
                                                if (_galType == 'P')
                                                {
                                                    $('#refID' + _id + ' * IMG.imgG').before(' <img src="' + _referralTog.IMGlatestSRC + '" title="' + _referralTog.IMGlatestALT + '" style="clear:both;margin-bottom:4px" /><br />');
                                                    $('#refID' + _id + ' * IMG.imgG').attr({
                                                        src: 'http://submit.shutterstock.com/images/camera_icon.png'
                                                    });
                                                    $('#refID' + _id + ' * IMG.imgG').after(' Ca. ' + _referralTog.IMGcount + ' images');
                                                    _referrals_dataSize += parseInt(_referralTog.dataSize);
                                                    
                                                }
                                                else {
                                                    $('#refID' + _id + ' * IMG.imgF').before(' <img src="' + _referralTog.IMGlatestSRC + '" title="' + _referralTog.IMGlatestALT + '" style="clear:both;margin-bottom:4px" /><br />');
                                                    $('#refID' + _id + ' * IMG.imgF').attr('src', 'http://submit.shutterstock.com/images/footage_icon.png');
                                                    $('#refID' + _id + ' * IMG.imgF').after(' Ca. ' + _referralTog.IMGcount + ' clips');
                                                    _referrals_dataSize += parseInt(_referralTog.dataSize);
                                                }
                                                
                                                $('#refID' + _id + ' * span.togFullName').html(_referralTog.togName).css({
                                                    'font-weight': 'bold'
                                                });
                                                
                                                
                                            }
                                            else {
                                                if (_galType == 'P') {
                                                    $('#refID' + _id + ' * IMG.imgG').attr({
                                                        src: 'http://www.shutterstock.com/images/question_mark_alpha_11.gif'
                                                    });
                                                    _referrals_dataSize += parseInt(_referralTog.dataSize);
                                                }
                                                
                                                
                                                if (_galType == 'F') {
                                                    $('#refID' + _id + ' * IMG.imgF').attr({
                                                        src: 'http://www.shutterstock.com/images/question_mark_alpha_11.gif'
                                                    });
                                                    _referrals_dataSize += parseInt(_referralTog.dataSize);
                                                    
                                                }
                                            }
                                            
                                            _referrals_check_running++;
                                        }
                                        
                                        _tmp_cnt++;
                                        
                                        if (_tmp_cnt > 4) 
                                            $('#F5stat_status_referrals_panel').scrollTop($('#F5stat_status_referrals_panel').scrollTop() + $('.gal').height() + 7);
                                        
                                        if (_tmp_cnt > _refIDs.length) {
                                            clearInterval(_referrals_interval_check);
                                            _referrals_interval_check = false;
                                            
                                            putCookie('referrals_lock', 'true', 60 * 6);
                                            _referrals_dataSize = 0;
                                            
                                            _REFERRALS_BTN_state();
                                            
                                            if (localStorage) {
                                                localStorage['referrals_HTMLlist'] = $('#F5stat_status_referrals_panel').html();
                                                $('#F5_app_status_txt').hide().append(' / Cached in Local S').fadeIn('slow');
                                            }
                                            
                                            if (localStorage['referrals_HTMLlist'] != null) 
                                                _tmp_size = ' ~' + Math.round(localStorage['referrals_HTMLlist'].length / 1024) + 'KB stored';
                                            else 
                                                _tmp_size = '';
                                            
                                            $('#F5_app_status_txt').text('Referrals checked - locked for 6 hours (avoiding servers overload) ' + _tmp_size);
                                            
                                        }
                                        
                                        _glob_referral_counter = _tmp_cnt;
                                        
                                        
                                        
                                    }
                                    
                                    _referrals_interval_check = setInterval(function(){
                                        $('#F5_app_status_txt').hide().text('Please wait...').fadeIn('slow');
                                        _checkReferrals();
                                    }, 7000);
                                    
                                    
                                    
                                }

                                $('#F5_refresh_mark').click(function(e){
                                    e.preventDefault();
                                    
                                    _F5_start();
                                });
                                $('#F5btn_stats').click(function(e){
                                    e.preventDefault();
                                    _panel_switch_to('F5stat_status');
                                    $('#F5_app_status_txt').hide().text('Browsing downloads').fadeIn('slow');
                                });
                                
                                
                                
                                $('.F5btn_standard').css({
                                    'font-size': '9pt',
                                    'font-weight': 'normal',
                                    'border': '1px solid #98d228',
                                    'background': '#dcf0b5',
                                    'cursor': 'pointer',
                                    '-moz-border-radius': '11px',
                                    'padding':'4px'
                                    ,'text-overflow': 'ellipsis'
                                    ,'overflow': 'hidden',
                                    'text-shadow': 'rgba(8, 10, 8, 0.3) 1px 1px 2px'
                                    ,

                                    'border-radius': '11px',
                                    '-webkit-border-radius': '11px',
                                    'letter-spacing':'0.04em',

                        'box-shadow': '0 2px 6px rgba(220, 240, 181, 0.5), inset 0 -8px 10px 0 #dfb, inset 0 -8px 0 8px #be9,  inset 0 -16px 17px -2px #bd9',
                        '-moz-box-shadow': '0 2px 6px rgba(220, 240, 181, 0.5), inset 0 -8px 10px 0 #dfb, inset 0 -8px 0 8px #be9, inset  0 -16px 17px -2px #bd9'
                                });

                                
                                
                                $('#F5btn_stats').attr('class', 'F5btn_standard');
                                $('#F5btn_referrals').attr('class', 'F5btn_standard');
                                
                                $('#F5btn_referrals').click(function(e){
                                    e.preventDefault();
                                    $('#F5stat_status').hide();
                                    _panel_switch_to('F5stat_status_referrals', 'kill');
                                    
                                    _F5_referrals();
                                });
                                
                                
                                
                                $('#F5btn_referrals_clear_localS').click(function(e){
                                    e.preventDefault();
                                    if (confirm('Clear referrals cache? You`ll have to run the check again\nBest solution is to clear it once a week\nor it`ll get cleared by itself')) 
                                        localStorage.removeItem('referrals_HTMLlist');
                                    
                                });
                                
                                function _F5_referrals(){
                                
                                    $('#F5stat_status_referrals_panel').html('<span class="F5_clsText">Loading Referrals...</span>');
                                    
                                    $('.F5_clsText').css({
                                        'font-size': '8pt',
                                        'font-weight': 'bold'
                                    });
                                    
                                    
                                    if (_referrals_page_built || (localStorage['referrals_HTMLlist'] != null)) {
                                        _build_Referrals_page();
                                    }
                                    else {
                                        _tmp_filename = 'http://submit.shutterstock.com/referrals.mhtml';
                                        $.get(_tmp_filename, _build_Referrals_page);
                                    }
                                    
                                    
                                    $('#F5stat_status').append(_refresh_pixel);
                                }
                                _html_ipreview = '<div id="plr_ipreview" style="'+_F5_eff_glow_2 + _F5_eff_corner +'padding:8px;top:10px;left:10px;position:absolute;display:none;width:360px;background:#494A4a;z-index:100">' +
                                '<div id="plr_img_title" style="letter-spacing:0.08em;word-spacing:0.1pt"></div>' +
                                '<div id="plr_img_container"><img id="plr_ipreview_img" src="" style="margin:0px;width:350px"></div> ' +
                                '<div id="imgArchData" style="font-size:8pt;font-family:sans-serif;color: #f7fceb;margin:2px;margin-bottom:0px;width:99%"></div></div>';
                                
                                $('body').append(_html_ipreview);
                                
                                
                                
                                
                                function _movr(_obj){

                                    $(_obj).attr('title', '');
                                    
                                    _big_img_src = $(_obj).attr('src');
                                    
                                    if (_big_img_src.indexOf('display_pic_with_logo') > 0)
                                       return false;
                                    
                                    _thumb_width = $(_obj).attr('width');
                                    _thumb_height = $(_obj).attr('height');
                                    
                                    var _tmp_id = $(_obj).parent().attr('href');
                                    
                                    _tmp_id = _preg_match(_tmp_id, "=(\\d+)");
                                    
                                    if (!_tmp_id)
                                    {
                                        _tmp_id = $(_obj).attr('src');
                                        _tmp_id = _preg_match(_tmp_id, "-(\\d+)\\.jpg");
                                    }
                                    
                                    if ( ( ( _tmp_id ) &&  ( _on_page_area == 'SUBMITTER') && ( _on_page != 'TOP50') ))
                                    {
                                    
                                        var _tmp_put_arch = _buildIADB_infoTable(_tmp_id[1], 'single');
                                        $('#imgArchData').html(_tmp_put_arch);
                                        
                                        
                                        $('#imgArchData .IADBtable').css({
                                            'font-family': 'sans-serif',
                                            'font-size': '8pt'
                                        });
                                        $('#imgArchData .IADBtable td').css({
                                            'color': '#f7fceb',
                                            'padding': '2px',
                                            'padding-left': '0px'
                                        
                                        });
                                        $('#imgArchData .IADBtable .IADBtableTitle').css({
                                            'color': '#a5b2b9',
                                            'font-size': '10pt'
                                        });
                                        
                                        $('#imgArchData span:contains( 0 )').css({
                                            'color': '#777777',
                                            'font-size': '8pt'
                                        });
                                        
                                        
                                    }
                                    else 
                                        $('#imgArchData').html('Stats available only in [submit.shutterstock.com] area<br />click EDIT ICON to view');
                                    
                                    
                                    if (_on_page == 'SINGLE_PHOTO') {
                                        $('#imgArchData .IADBtable ').html('');
                                        $('#SS_IADB_update_info').html('');
                                        
                                    }
                             
                                    
                                    $('#plr_ipreview_img').attr('src', _big_img_src).show();
                                    
                                    if (_big_img_src.indexOf('thumb_small') >= 0) {
                                        _big_img_src = _big_img_src.replace('thumb_small', 'display_pic_with_logo');
                                        
                                    }
                                    else 
                                        if (_big_img_src.indexOf('thumb_large') >= 0) {
                                            if (_on_page != 'REJECTED') 
                                                _big_img_src = _big_img_src.replace('thumb_large', 'display_pic_with_logo');
                                            
                                        }
                                    
                                    
                                    if (_big_img_src.indexOf('ttp://upload1') > 0)
                                        {
                                        _big_img_src = _big_img_src.replace('display_pic_with_logo', 'thumb_large');
                                        }
                                    
                                    
                                    $('#plr_ipreview_img').attr('src', _big_img_src);
                                    
                                    _tmp_width = 350;
                                    if ((_thumb_width - _thumb_height) > 0) {
                                        if (Math.abs(_thumb_width - _thumb_height) > _thumb_width * 0.10) {
                                            _tmp_width = 450;
                                        }
                                    }
                                    else 
                                    if ((_thumb_width - _thumb_height) < 0) {
                                        if ( Math.abs(_thumb_width - _thumb_height) > _thumb_height * 0.10 )
                                            {
                                            _tmp_width = 350;    
                                            }
                                            else
                                            _tmp_width = 450;    
                                        }
                                    
                                    
                                    $('#plr_ipreview_img').css({
                                        'width': _tmp_width + 'px',
                                        'border': '2px solid #535454'
                                    });
                                    
                                    var _tw2 = _tmp_width + 4;
                                    
                                    $('#plr_ipreview').css({
                                        'width': _tw2 + 'px'
                                    });
                                    
                                    
                                    $('#plr_ipreview').show();
                                    
                                    
                                    var _get_alt_txt = $(_obj).attr('alt');
                                    
                                    var repl = /stock photo : /gi;
                                    _get_alt_txt_prv = _get_alt_txt.replace(repl, '');
                                    
                                    $('#plr_img_title').text(_get_alt_txt_prv).css({
                                        'font-size': '8pt',
                                        'font-family': 'sans-serif',
                                        'color': '#CDF879',
                                        'font-weight': 'bold',
                                        'margin': '0px 0px 10px 0px'
                                    });

                                    
                                }
                                
                                
                                
                                function _mout(_obj){
                                    $('body').append(_html_ipreview);
                                    $('#plr_ipreview').hide();
                                    $(_obj).attr('alt', _get_alt_txt_prv);
                                }
                                
                                
                                
                                
                                $('img.thumb_image').mouseover(function(){
                                    _movr($(this))
                                });
                                
                                $('img.thumb_image').mouseout(function(){
                                    _mout($(this))
                                });
                                
                                if (_autorun) 
                                    $('div#download_map').delegate('img.download_map_media', 'mouseover mouseout', (function(e){
                                    
                                        if (e.type == 'mouseover') 
                                            _movr($(this));
                                        if (e.type == 'mouseout') 
                                            _mout($(this));
                                        
                                    }));
                                
                                
                                
                                $('div.sectioncontent').find('a').find('img').mouseover(function(){
                                    _movr($(this))
                                });
                                
                                $('div.sectioncontent').find('a').find('img').mouseout(function(){
                                    _mout($(this))
                                });
                                
                                
                                
                                
                                
                                $(document).mousemove(function(e){
                                
                                    _set_x = e.pageX - $('body').offset().left + 25;
                                    _set_y = e.pageY - 200 - $('body').offset().top;
                                    
                                    if (_set_y > $(window).scrollTop() + $(window).height() - 20 - $('#plr_ipreview').height()) {
                                        _set_y = $(window).scrollTop() + $(window).height() - $('#plr_ipreview').height() - 20;
                                    }
                                    
                                    if (_set_y < $(window).scrollTop() + 10) 
                                        _set_y = $(window).scrollTop() + 10;
                                    
                                    if (_set_x >= 650) 
                                        _set_x = _set_x - $('#plr_ipreview_img').attr('width') - 150;
                                    
                                    $('#plr_ipreview').css({
                                        'left': _set_x,
                                        'top': _set_y
                                    });
                                });
                                $('.inactive-cell').each(function(index){
                                    var _match = /(thumb-cell-)(\d+)/i.exec($(this).attr('id'));
                                    
                                    if (_match && (_match[2] != null)) {
                                        plr_edit = _match[2];
                                        $(this).find('.result_icons').before('<img src="http://submit.shutterstock.com/images/edit.png" class="clssplr_edit"  title="' + _match[2] + '">');
                                        
                                    };
                                                                    });
                                
                                
                                
                                
                                $('.result_icons').css({
                                    'display': 'inline'
                                });

                                $('#content_overview_container').find('a').each(function(index){

                                    
                                    var myRGXP = new RegExp('shutterstock\.com\/pic\.mhtml\\?id\\=(\\d+)', 'gi');
                                    var _match;
                                    _match = myRGXP.exec($(this).attr('href'));
                                    
                                    
                                    if (_match && (_match[1] != null)) {
                                        var plr_edit = "_runInPlaceEditor( " + _match[1] + ", '' );return false;";
                                        var _img_src = $(this).find('img').attr('src');
                                        _big_img_src = _img_src.replace('thumb_small', 'display_pic_with_logo');
                                        
                                        $(this).before('<div style="' + _F5_eff_corner_small + _F5_eff_glow +'position:absolute;background-color:rgba(255,255,255,0.7);border:1px solid black"><img src="http://submit.shutterstock.com/images/edit.png" class="clssplr_edit_inplace"  title="' + _match[1] + '" alt="' + _big_img_src + '" ></div>');

                                        
                                        
                                    };
                                });
                                
                                
                                console.log('>>> @ ' + _on_page);
                                if ( _on_page == 'EDIT_PHOTO' ) {
                                    _editFormImprove(_inplace_edit_id);
                                    
                                    _tmp_put_arch = _buildIADB_infoTable(_inplace_edit_id, 'single');
                                    $('form').before('<div id="page-EDIT_PHOTO" >' + _tmp_put_arch + '</div>');
                                    
                                    $('#page-EDIT_PHOTO .IADBtable').css({
                                        'font-family': 'sans-serif',
                                        'font-size': '8pt',
                                        'margin': '10px'
                                    });
                                    $('#page-EDIT_PHOTO * td').css({
                                        'color': 'black'
                                    });
                                    $('#page-EDIT_PHOTO * .IADBtableTitle').css({
                                        'color': '#8cc63e',
                                        'font-size': '10pt',
                                        'font-weight': 'bold'
                                    });
                                    
                                }
                                
                                
                                $('img.clssplr_edit').click(function(){
                                    _id = $(this).attr('title');
                                    window.location.href = 'http://submit.shutterstock.com/edit_media.mhtml?id=' + _id + '&type=photos';
                                    
                                });
                                
                                $('img.clssplr_edit_inplace').click(function(){
                                
                                    _id = $(this).attr('title');
                                    _runInPlaceEditor($(this).attr('title'), $(this).attr('alt'));
                                    return false;
                                });
                                
                                
                                
                                
                                
                                
                                
                                $('.clssplr_edit, .clssplr_edit_inplace').css({
                                    'border': '0px',
                                    'cursor': 'pointer',
                                    'margin': '3px'
                                
                                
                                });
                                $('.btn_standard').css({
                                    'border': '0px',
                                    'background': 'white',
                                    'border': '1px solid #99CA3C',
                                    'cursor': 'pointer'
                                });

                                
                                if ((_on_page != 'REJECTED') && (_on_page != 'APPROVED')) {
                                /*
                                
                                
                                 $('.thumb_image_container').css({
                                
                                
                                 
                                
                                
                                 'margin': '3px',
                                
                                
                                 'border': '0px',
                                
                                
                                 'padding': '0px',
                                
                                
                                 'height': '110px'
                                
                                
                                 
                                
                                
                                 
                                
                                
                                 });
                                
                                
                                 
                                
                                
                                 
                                
                                
                                 $('.thumb_image').css({
                                
                                
                                 'margin': '0px',
                                
                                
                                 'border': '0px'
                                
                                
                                 
                                
                                
                                 });*/
                                
                                
                                }
                                
                                
                                $('#results-mode-form').hide();
                            };
                            plr_go();
                            
                            
                            
                            
                        };

                    $('#F5stat_editor_cancel').click(function(e){
                        $('#F5stat_thumbs_direct_edit').hide();
                    });
                    
                    
                    function _runInPlaceEditor(_id, _img_src){
                        _panel_switch_to('F5stat_thumbs_direct_edit', 'nokill');
                        $('#F5stat_editor_place').html('<img src="http://submit.shutterstock.com/images/edit.png" />');
                        
                        
                        
                        $('#F5stat_editor_form_place').html('<img src="http://submit.shutterstock.com/images/edit.png" />');
                        $('#F5stat_editor_place').html('<img src="' + _img_src + '" style="border:2px solid #669D30;height:280px" />');
                        
                        _inplace_editor_fill(_id);
                        
                        
                        var _tmp_IADB = _buildIADB_infoTable(_id, 'single');
                        
                        
                        $('#F5stat_editor_IADB_place').html('<div id="IADBinPlaceCSS">' + _tmp_IADB + '</div>');
                        $('#IADBinPlaceCSS .IADBtable').css({
                            'font-family': 'sans-serif',
                            'font-size': '9pt',
                            'margin-left': '10px'
                        });
                        $('#IADBinPlaceCSS .IADBtable td').css({
                            'color': 'black',
                            'font-family': 'sans-serif',
                            'font-size': '9pt'
                        });
                        $('#IADBinPlaceCSS .IADBtable .IADBtableTitle').css({
                            'color': '#669D30',
                            'font-size': '13pt'
                        });
                        $('#IADBinPlaceCSS #IADBTotalEarnedCSS').css({
                            'color': 'black',
                            'font-size': '13pt'
                        });
                        $('#IADBinPlaceCSS .DATAseparator').css({
                            'border-top': '1px solid #99ca3c',
                            'padding-top': '6px',
                            'font-size': '4pt'
                        });
                        
                        
                        
                        
                        
                        
                    }
                    
                    
                    function _inplace_editor_fill(_id){
                    
                        _inplace_edit_id = _id;
                        _tmp_filename = 'http://submit.shutterstock.com/edit_media.mhtml?id=' + _id + '&type=photos';
                        $.get(_tmp_filename, _get_editor_form);
                        
                    }
                    
                    
                    function _get_editor_form(_html_page){
                    
                        var _match;
                        _new_content = _html_page.replace(/[\n\r\t]/g, '');
                        
                        _new = _new_content;
                        myRGXP = new RegExp('(<form method=post>.*?<\/form>)', 'gi');
                        _make_html = '';
                        
                        _match = myRGXP.exec(_new);
                        _html_inplace_edit_form = _match[1];
                        
                        
                        _html_inplace_edit_form = _html_inplace_edit_form.replace('<form method=post>', '<form method=post action="http://submit.shutterstock.com/edit_media.mhtml?id=' + _inplace_edit_id + '&type=photos">')
                        
                        $('#F5stat_editor_form_place').html('<div>' + _html_inplace_edit_form + '</div>');
                        
                        $('#F5stat_editor_form_place * form').css({
                            'margin': '0px'
                        });
                        $('#F5stat_editor_form_place * table').css({
                            'margin': '0px',
                            'margin-top': '4px'
                        });
                        
                        _editFormImprove(_inplace_edit_id);
                    }
                    
                    
                    function _editFormImprove(_img_id){
                    
                        if ($('#in_form_id')[0])
                        {
                            $('#in_form_id').remove();
                        }
                        
                        $('.thumb_image_container').before('<span id="in_form_id" style="background:#dcf0b5;padding:3px">ID: ' + _img_id + '</span><br />');
                        $('textarea[name=description]').before('<span id="chars_counter" style="background:#dcf0b5;font-weight:bold;padding:3px">???</span><br />');
                        
                        $('#keywords' + _img_id).before('<span id="keywords_counter" style="background:#dcf0b5;font-weight:bold;padding:3px">???</span><br />');
                        $('#keywords' + _img_id).height($('#keywords' + _img_id).height() + 50);
                        
                        $('#keywords' + _img_id).css({
                            'border': '2px solid #cfeb9c',
                            'padding': '4px',
                            'line-height': '1.5',
                            'word-spacing': '4pt',
                            'width': '150pt',
                            'font-size': '9pt'
                        });
                        $('textarea[name=description]').css({
                            'border': '2px solid #cfeb9c',
                            'padding': '4px',
                            'font-size': '9pt'
                        
                        });
                        $('form table').width('800px');
                        
                        
                        $('form table').css({
                            'border': '1px solid #dcf0b5'
                        });
                        
                        
                        
                        _count_keywords(_img_id);
                        _count_letters();
                        
                        
                        $('#keywords' + _img_id).keyup(function(){
                            setTimeout(function(){
                                _count_keywords(_img_id);
                            }, 1000);
                            
                        });
                        
                        $('textarea[name=description]').keyup(function(){
                            setTimeout(function(){
                                _count_letters();
                            }, 1000);
                        });
                    }
                    
                    
                    function _count_keywords(_id){
                    
                        _tmp_txt = $.trim($('#keywords' + _id).val());
                        _keys_cnt = _tmp_txt.split(/\s+/).length;
                        
                        $('#keywords_counter').text(_keys_cnt + ' keywords');
                    }
                    
                    function _count_letters(){
                    
                        _tmp_txt = $.trim($('textarea[name=description]').val());
                        _word_cnt = _tmp_txt.length;
                        
                        $('#chars_counter').text(_word_cnt + ' chars');
                    }

                    function _runTotalStats(){
                    
                        $('#F5stat_status').hide();
                        _panel_switch_to('F5stat_totals', 'kill');
                        $('#F5_app_status_txt').hide().text('Showing Total Stats').fadeIn('slow');
                        $('#F5stat_totals_dbg').hide();
                        
                        if (_IADBmode == 'auto') 
                            $('#F5btn_autoIADB_check').attr('checked', true);
                        else 
                            $('#F5btn_autoIADB_check').attr('checked', false);
                        
                        if (!localStor_OK) {
                            $('#F5_app_status_txt').hide().text(' ').fadeIn('slow');
                            $('#F5stat_totals_status').html('<b>Total Stats REQUIRES a modern browser</b>');
                            $('#F5stat_totals_place').text('Update to Firefox 3.5, Safari 4, IE8, Chrome 4+, Opera 10.5 or later');
                            
                            
                            return false;
                        }
                        
                        
                        $('#F5stat_totals_place').html(_buildIADB_infoTable('totals', 'totals'));
                        
                        $('#F5stat_totals_place .IADBtable').css({
                            'font-family': 'sans-serif',
                            'font-size': '8pt'
                        });
                        $('#F5stat_totals_place .IADBtable td').css({
                            'font-family': 'sans-serif',
                            'font-size': '9pt',
                            'padding-top': '3px'
                        
                        });
                        $('#F5stat_totals_place span:contains( 0 )').css({
                            'color': '#777777',
                            'font-size': '8pt'
                        });
                        
                        $('#F5stat_totals_place .DATAseparator').css({
                            
                            'padding': '0px',
                            'font-size': '2pt'
                        });
                        
                        
                        $('#F5btn_DBGtotalStats, #F5stat_totals_dbg').bind('mouseup.F5stat_totals', function(e){
                            e.preventDefault();
                            $('#F5stat_totals_dbg').toggle();
                        });

                        $('#F5stat_totals_dbg').bind('mouseup.F5stat_totals', function(e){
                            e.preventDefault();
                            $('#F5stat_totals_dbg').hide();
                        });


                        $('#F5btn_DBGtotalStats_clear_localS').bind('mouseup.F5stat_totals', function(e){
                            e.preventDefault();
                            if (confirm("Clear ALL CACHE? \n\nYou don't need to use it\n\nIt's a last resort option\n\nSets all Stats (image / referrals) data to default 0 state. \n\nCookies are not cleared - to clear cookies use Browser's Options")) 
                                localStorage.clear();
                        });


                        

                        
                        
                        
                        $('#F5btn_autoIADB_check').click(function(e){
                            if ($(this).is(':checked')) {
                                _IADBmode = 'auto';
                                putCookie('SSscr_IADBmode', 'auto');
                                $('#F5_app_status_txt').html('Total Stats check Enabled');
                                $('#F5stat_totals_dbg').append('<br /><span style="">' + 'mode = auto, check will start soon...<br />');
                            }
                            else {
                                _IADBmode = 'stop';
                                putCookie('SSscr_IADBmode', 'stop');
                                $('#F5_app_status_txt').html('Total Stats check STOPPED');
                            }
                        });
                        
                        
                        
                        
                        return false;
                        _IADBmode = 'IADBfullRescan';
                        localStorage['_IADBmode'] = _IADBmode;
                        
                        
                        if (!localStorage) {
                            $('#F5stat_totals_status').html("Can't build Statistics Database. Use newer browser. This browser doesn't support large local storage");
                            return false;
                        }
                        
                        $('#F5stat_totals_status').html('');
                        
                        _imgADBcurrPage = 1;
                        _imgADBcurrChapter = 0;
                        
                        localStorage['_imgADBcurrChapter'] = _imgADBcurrChapter;
                        
                        _IADBloadPage(_imgADBchapters[_imgADBcurrChapter], _imgADBcurrPage);
                        
                    }
                    
                    
                    
                    
                    
                    function _IADBloadPage(_name, _nr){
                    
                      $('#F5stat_totals_dbg').append( '<br /> >Next...');
                    
                        if (_IADBmode == 'stop') {
                            $('#F5_app_status_txt').html('Total Stats check STOPPED');
                            $('#F5stat_totals_dbg').append('<span style="">' + 'mode = stop<br />');
                            return false;
                        }
                        
                        _resetIADBauto_Interval();
                        
                        
                        $('#F5stat_totals_dbg').append('<span style="">' + 'Spider getting data P nr ' + _nr + '</span>' + ' chapter: <b>' + _name + '</b><br />');
                        
                        var _actualTime = parseInt(Math.round(new Date().getTime() / 1000 / 60));
                        putCookie('SSscrDBautoActiveSec', _actualTime);
                        $('#F5stat_totals_status').html('Processing: ' + _name + ' ' + _nr + ", ");

                        
                        if (_switch_prev_panel == 'F5stat_totals') 
                            ;
                        {
                            $('#F5stat_totals_place').html(_buildIADB_infoTable('totals', 'totals'));
                        }
                        
                        var _tmp_filename = 'http://submit.shutterstock.com/stats_media.mhtml?display_column=' + _name + '&pg=' + _nr;

                        if(! $.get( _tmp_filename, _get25AD) ) {
                            
                        }

                    }
                    
                    
                    
                    
                    function _get25AD(_html_page){
                        
                        if ( ($.trim( _html_page )=='') && (_imgADBcurrPage != 1)) {
                            _imgADBcurrPage = 1;
                            localStorage['_imgADBcurrPage'] = _imgADBcurrPage;
                            return false;
                        }

                        
                        var _new_content = _html_page.replace(/[\n\r\t]/g, '');
                        
                        if ((_imgADBcurrPage == 1) ) {
                        
                            var _rgxp = 'class="prev-next">(\\d+)<\/a>[^>]*?class="prev-next">next';
                            var myRGXP = new RegExp(_rgxp, 'gi');
                            _match = myRGXP.exec(_new_content);
                            
                            if (_match) {
                                if (_match[1]) 
                                    _imgADBnumPages = _match[1]
                            }
                            else 
                                _imgADBnumPages = 1;
                            
                            localStorage['_imgADBnumPages'] = _imgADBnumPages;
                            
                        }
                        
                        
                        if (_imgADBcurrPage <= _imgADBnumPages)
                        {
                        
                            $('#F5stat_totals_status').append(' Page: ' + _imgADBcurrPage + '/' + _imgADBnumPages);
                            _imgADBcurrPage++;
                            localStorage['_imgADBcurrPage'] = _imgADBcurrPage;
                            var _rgxp1 = 'class=\"datacellsm\".*?href=\"(http:\/\/www\\.shutterstock\\.com/pic\\.mhtml\\?id=(\\d+)\)"';
                            var _rgxp2 = '.*?<img[^<>]*?(http[^>]*?thumb_small[^>]*?jpg).*?alt="([^"><]*?)".*?class=\"datacell\">(\\d+)<\/td>';
                            var _rgxp3 = '.*?"datacell">\\$(\\d+\\.\\d+)<\/td>.*?"datacell">(\\d{4}-\\d{2}-\\d{2})<\/td>';
                            myRGXP = new RegExp(_rgxp1 + _rgxp2 + _rgxp3, 'gi');
                            
                            var _match;
                            var _img_nr = 0;
                            var _images_found = false;
                            var _newContent = '';

                            
                            
                            while ((_match = myRGXP.exec(_new_content)) != null) {
                            
                                if (_imgADB[_match[2]]) {
                                    var _dbChunks = _imgADB[_match[2]].split('|');
                                    
                                }
                                else {
                                    _dbChunks = ['', '', ''];
                                }
                                
                                if (_imgADBcurrChapter == 0) 
                                    _dbChunks[0] = _match[5] + ':' + _match[6] + ':' + _match[7];
                                else 
                                    _dbChunks[_imgADBcurrChapter] = _match[5] + ':' + _match[6];
                                if (_match[7] != '')
                                {
                                    if (_dbChunks[0] != '') {
                                        var _subChunks = _dbChunks[0].split(':');
                                        _subChunks[2] = _match[7];
                                        _dbChunks[0] = _subChunks[0] + ':' + _subChunks[1] + ':' + _subChunks[2];
                                    }
                                    else 
                                        _dbChunks[0] = ':' + ':' + _match[7];
                                }
                                
                                var _dbMerge = _dbChunks[0] + '|' + _dbChunks[1] + '|' + _dbChunks[2];
                                _imgADB[_match[2]] = _dbMerge;
                                
                                _img_nr++;
                                _images_found = true;
                            }
                            
                            
                            localStorage.setItem('_imgADB', JSON.stringify(_imgADB));
                        }
                        
                        if (_imgADBcurrPage > _imgADBnumPages) {

                            _imgADBcurrChapter++;
                            
                            if (_imgADBcurrChapter > _imgADBchapters.length - 1)
                            {
                                _imgADBcurrChapter = 0;
                                putCookie('SS_DB_dailyDone', 'true', SS_DB_dailyDone);
                            }
                            
                            localStorage['_imgADBcurrChapter'] = _imgADBcurrChapter;
                            
                            _imgADBcurrPage = 1;
                            localStorage['_imgADBcurrPage'] = 1;
                            
                        }
                        else {
                            if (_IADBmode == 'IADBfullRescan') 
                                setTimeout(function(){
                                    _IADBloadPage(_imgADBchapters[_imgADBcurrChapter], _imgADBcurrPage)
                                }, 3000);
                        }
                        
                        
                    }
                    
                    
                    
                    function _buildIADB_infoTable(_id, _get_more){
                    
                        var _tmp_put_arch = '<div class="IADBtable" style="font-weight:normal">No stat data yet</div>';
                        
                        if ((!_id) && (_get_more == 'single')) 
                            return _tmp_put_arch;
                        
                        if (!localStor_OK) {
                            var _tmp_put_arch = '<div class="IADBtable" style="font-weight:normal">Modern browser required <b>for STATS</b></div>';
                            return _tmp_put_arch;
                        }
                        
                        
                        var _totalImgsInGall = getCookie('SSimgsInGall');
                        
                        if (!_totalImgsInGall) 
                            _totalImgsInGall = 'wait..';
                        
                        if (localStorage) {
                            var _soldCount = $.param(_imgADB).split('=').length - 1;
                            var _notSoldCount = _totalImgsInGall - _soldCount;
                            var _percSold = Math.round((100 * _soldCount) / _totalImgsInGall * 100) / 100;
                            var _percNotSold = Math.round((100 * _notSoldCount) / _totalImgsInGall * 100) / 100;
                            
                            if (!_soldCount) 
                                _soldCount = 'wait..';
                            if (!_notSoldCount) 
                                _notSoldCount = 'wait..';
                            if (!_percSold) 
                                _percSold = '..';
                            if (!_percNotSold) 
                                _percNotSold = '..';
                        }
                        
                        
                        
                        var _sVal = '<span style="font-weight:bold"> ';
                        
                        if ((_imgADB[_id] != 'undefined') && (_imgADB[_id] != null) && (_id != 'totals')) {
                            var _tmpIADB = _imgADB[_id].split('|');
                            
                            var _25ad = _tmpIADB[0].split(':');
                            var _OD = _tmpIADB[1].split(':');
                            var _EL = _tmpIADB[2].split(':');
                            
                            var _25earned = _25ad[1] ? _25ad[1] : 0;
                            var _ODearned = _OD[1] ? _OD[1] : 0;
                            var _ELearned = _EL[1] ? _EL[1] : 0;
                            
                            var _25dls = _25ad[0] ? _25ad[0] : 0;
                            var _ODdls = _OD[0] ? _OD[0] : 0;
                            var _ELdls = _EL[0] ? _EL[0] : 0;
                            
                            var _TOTALearned = Math.round((parseFloat(_25earned) + parseFloat(_ELearned) + parseFloat(_ODearned)) * 1000) / 1000;
                            var _TOTALdls = parseInt(_25ad[0] ? _25ad[0] : 0) + parseInt(_EL[0] ? _EL[0] : 0) + parseInt(_OD[0] ? _OD[0] : 0);
                            
                            var _1Day = 1000 * 60 * 60 * 24;
                            var _today = new Date();
                            var _getDate = _25ad[2];
                            
                            _upDate = _getDate.split('-');
                            _upDate = new Date(_upDate[0], _upDate[1] - 1, _upDate[2]);
                            
                            var _online = Math.ceil((_today.getTime() - _upDate.getTime()) / (_1Day));
                            var _perDay = Math.round(parseInt(_TOTALearned) / _online * 1000) / 1000;
                            var _RPDovr = Math.round(_TOTALearned / _TOTALdls * 1000) / 1000;
                            
                            
                            
                            
                            if (_get_more == 'single') {
                            
                                _tmp_put_arch = '<div class="IADBtable" >'
                                +
                                '<table style="padding:4px;padding-left:0;padding-top:0px;width:100%">' +
                                '<tr><td style="width:19%"></td><td> </td><td style="width:18%">25AD</td><td> </td><td style="width:17%">OD</td><td> </td><td style="width:18%">EL</td><td> </td><td style="width:23%">Total</td></tr>' +
                                '<tr><td>DLs</td><td></td><td>' +
                                _sVal +
                                _25dls +
                                ' </span></td><td> </td>' +
                                '<td>' +
                                _sVal +
                                _ODdls +
                                ' </span></td><td> </td>' +
                                '<td>' +
                                _sVal +
                                _ELdls +
                                ' </span></td>' +
                                '<td>' +
                                '</span></td>' +
                                '<td>' +
                                _sVal +
                                _TOTALdls +
                                '</span></td>' +
                                '</tr>' +
                                '<tr><td>Earned $</td><td></td><td>' +
                                _sVal +
                                _25earned +
                                ' </span></td><td> </td>' +
                                '<td>' +
                                _sVal +
                                _ODearned +
                                ' </span></td><td> </td>' +
                                '<td>' +
                                _sVal +
                                _ELearned +
                                ' </span></td>' +
                                '<td>' +
                                '</span></td>' +
                                '<td>' +
                                '<span id="IADBTotalEarnedCSS" style="color:#a9da4c;font-weight:bold;font-size:larger">' +
                                _TOTALearned +
                                '</span> <br />' +
                                '$' +
                                _perDay +
                                ' a day</td>' +
                                '</tr>'
                                +
                                '<tr><td>Uploaded</td><td></td><td colspan=4>' +
                                _getDate +
                                ' = ' +
                                _online +
                                ' days</td> <td><abbr title="Return Per Download">RPD $</abbr></td><td> </td> <td>' +
                                _sVal +
                                _RPDovr +
                                '</span></td>' +
                                '</tr>';
                                
                            }
                        }
                        
                        
                        
                        if (_get_more == 'totals') {
                        
                            var _earningsV = JSON.parse(getCookie('SSearningsValues'));
                            var _earningsVmonthly = JSON.parse(getCookie('SSearningsValuesMonthly'));
                            
                            var _RPIovr = Math.round(_earningsV.total / _totalImgsInGall * 1000) / 1000;
                            if (!_RPIovr) 
                                _RPIovr = '...';
                            
                            var _RPIfromDLs = Math.round((parseInt(_earningsV.A25s) + parseInt(_earningsV.ODs) + parseInt(_earningsV.ELs) + parseInt(_earningsV.bCD)) / _totalImgsInGall * 1000) / 1000;
                            if (!_RPIfromDLs) 
                                _RPIfromDLs = '...';
                            
                            var _RPDoverall = Math.round(parseInt(_earningsV.total) / parseInt(_earningsV.DLs) * 100) / 100;

                            if (!_RPDoverall) 
                                _RPDoverall = '...';
                            
                            var _RPDmonthly = Math.round(parseInt(_earningsVmonthly.total) / parseInt(_earningsVmonthly.DLs) * 1000) / 1000;
                            if (!_RPDmonthly) 
                                _RPDmonthly = '...';
                            
                            
                            var _RPIfromDLsMonthly = Math.round((parseInt(_earningsVmonthly.A25s) + parseInt(_earningsVmonthly.ODs) + parseInt(_earningsVmonthly.ELs) + parseInt(_earningsVmonthly.bCD)) / _totalImgsInGall * 1000) / 1000;
                            

                            if (!_RPIfromDLsMonthly) 
                                _RPIfromDLsMonthly = '...';
                            
                            var _RPIoverallMonthly = Math.round(_earningsVmonthly.total / _totalImgsInGall * 1000) / 1000;
                            if (!_RPIoverallMonthly) 
                                _RPIoverallMonthly = '...';
                            
                            var _STR = Math.round(_soldCount / _totalImgsInGall * 100) / 100;
                            
                            
                            _tmp_put_arch = '<div class="IADBtable" >'
                            +
                            '<table style="padding:4px;padding-left:0;padding-top:0px;width:100%;">' +
                            '<tr><td colspan=9 class="DATAseparator"> </td></tr>' +
                            '<tr><td>All images</td><td></td><td><span>' +
                            _sVal +
                            _totalImgsInGall +
                            '</span></td> <td></td> <td></td> <td></td><td></td><td></td><td></td></tr>' +
                            '<tr><td>Sold</td><td></td><td colspan=3><span style="color:green"><b>' +
                            _soldCount +
                            '</b> ( ' +
                            _percSold +
                            '% <abbr title="Sell Through Rate - Sold / ALL">STR</abbr> )</span></td> <td></td> <td></td> <td></td><td></td></tr>' +
                            '<tr><td>Not sold</td><td> </td><td colspan=3><span style="color:red"><b>' +
                            _notSoldCount +
                            '</b> ( ' +
                            _percNotSold +
                            '% )</span></td> <td></td> <td></td> <td></td><td></td> </tr>' +
                            '<tr><td colspan=9 class="DATAseparator">&nbsp;</td> </tr>' +
                            '<tr><td></td> <td> </td> <td>Overall</td> <td> </td><td>Monthly</td> <td colspan=2></td> <td></td> <td>' +
                            '</span></td>  </tr>' +
                            '<tr><td><abbr title="Return Per Image - from ALL earnings">RPI from all $</abbr></td> <td> </td> <td>' +
                            _sVal +
                            '$ ' +
                            _RPIovr +
                            '</span></td> <td> </td> <td>' +
                            '$ ' + _RPIoverallMonthly +
                            ' </td> <td>' +
                            '</td> <td>All earnings</td> <td></td> <td> ' +
                            _sVal +
                            '$ ' +
                            _earningsV.total +
                            '</span></td>  </tr>' +
                            '<tr><td><abbr title="Return Per Image - AD25 + ODs + ELs + bCDs">RPI from IMGs</abbr></td> <td> </td><td>' +
                            _sVal +
                            '$ ' +
                            _RPIfromDLs +
                            '</span></td> <td> </td> <td> ' +
                            '$ ' + _RPIfromDLsMonthly +
                            '</td> <td> </td> <td> All downloads</td> <td></td> <td>' +
                            _sVal +
                            
                            _earningsV.DLs +
                            '</span></td></tr>' +
                            '<tr><td><abbr title="Return Per Download - AD25 + ODs + ELs + bCDs">RPD total</abbr></td> <td> </td><td>' +
                            _sVal +
                            '$ ' +
                            _RPDoverall +
                            '</span></td> <td> </td> <td>$ ' +
                            _RPDmonthly +
                            '</td> <td></td> <td><abbr title=""></abbr></td><td></td> <td>' +
                            _sVal +
                            '</span></td> </tr>'
                            + '<tr><td colspan=9 > </td></tr>' 
                            ;
                        }
                        
                        _tmp_put_arch += '</table>' + '<div id="SS_IADB_update_info" style="font-weight:normal;margin-left:1px;color:#999999;font-family:sans-serif;font-size:9pt">' + 'Shutterstock updates stats <b>once per day</b>' + '</div></div>';
                        
                        
                        
                        return _tmp_put_arch;
                        
                    }
                    
                    
                    
                    
                    
                    $('#F5btn_totalStats').click(function(e){
                        _runTotalStats();
                    });
                    
                    $('#F5stat_totals_cancel').click(function(e){
                        $('#F5stat_totals').hide();
                        
                    });
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    function _panel_switch_to(_name, _kill_others){
                    
                        if ((_kill_others != 'nokill') && (_switch_prev_panel != false)) {
                            $('#' + _switch_prev_panel).css({
                                'display': 'none'
                            });
                        }
                        
                        
                        
                        if (_kill_others != 'nokill')
                            switch (_switch_prev_panel) {
                                case 'F5stat_status_referrals':{
                                    $('#F5btn_referrals_chk_gal').unbind('.F5stat_status_referrals');
                                }
                                case 'F5stat_totals':{
                                    $('#F5btn_DBGtotalStats').unbind('.F5stat_totals');
                                    $('#F5btn_DBGtotalStats_clear_localS').unbind('.F5stat_totals');
                                    
                                }
                                
                                
                            }
                        
                        if (_switch_prev_panel != null) {
                            if (_switch_prev_panel == 'F5stat_status_referrals') {
                                if (_referrals_interval_check) {
                                    clearInterval(_referrals_interval_check);
                                    _referrals_interval_check = false;
                                }
                                
                            }
                        }
                        
                        
                        _panel = '#' + _name;
                        $(_panel).show();
                        _switch_prev_panel = _name;
                        
                    }
                    
                    
                    
                    function _IADBauto(){
                
                    
                        if (_IADBmode == 'stop' || (_on_page == 'GALLERY')) {
                            $('#F5_app_status_txt').html('Total Stats check STOPPED');
                            $('#F5stat_totals_dbg').append('<span style="">' + 'mode = stop or Gallery page<br />');
                            return false;
                        }
                        
                        
                        var _actualTime = parseInt(Math.round(new Date().getTime() / 1000 / 60));
                        var _activeTime = parseInt(getCookie('SSscrDBautoActiveSec'));
                        $('#F5stat_totals_dbg').append('<br /><span style="color:red">' + '[' + _scriptID + '] Get cookie _activeTime: ' + _activeTime + '</span> / actual = ' + _actualTime + '<br />');
                        
                        if (!_activeTime) {
                            _activeTime = _actualTime;
                            putCookie('SSscrDBautoActiveSec', _activeTime);
                            $('#F5stat_totals_dbg').append('<span style="color:red">' + 'Put cookie _activeTime: ' + _activeTime + '</span><br />');
                        }
                        
                        var _tDiff = _actualTime - _activeTime;
                        if (getCookie('SSscrID') == _scriptID)
                        {
                            $('#F5stat_totals_dbg').append('<span style="color:red">' + 'Actual SSscrID = cookie = ' + _scriptID + '</span><br />');
                        
                        }
                        else {
                        
                            /*
                         if ( _tDiff < _stat_timer_refresh )
                         {
                         $('#F5_app_status_txt').hide().html('<span style="color:red">' + _tDiff + " this page doesn't track the DB </span>").fadeIn('slow');
                         
                         setInterval(function() {
                         _IADBauto()
                         }, 30 * 1000);
                         return false;
                         }
                         */
                            
                            
                            
                            if (_tDiff > 3) {
                                
                                $('#F5stat_totals_dbg').append('<br /><span style="color:red">Taking over data base update</span><br />');
                                $('#F5stat_totals_dbg').append('<span style="color:red">' + ' Get cookie _activeTime: ' + _activeTime + '</span><br />');
                            }
                            else {
                                clearInterval(_scriptIDcheckInterval);
                                _scriptIDcheckInterval = setInterval(function(){
                                    _IADBauto()
                                }, _stat_IADBauto_refresh_continue * 2 * 60 * 1000);
                                clearInterval(_stat_IADBauto_refresh_int);
                                
                                $('#F5stat_totals_dbg').append('<span style="color:red"><br />Another SS window was updating, WAITING for free time slot, current task ID: ' + _scriptID + ' time: ' + _tDiff + '</span>');
                                return false;
                            }
                        }
                        
                        
                        
                        $('#F5stat_totals_dbg').append('<span style="color:red">OK Tracking DB : </span> SCRID: [' + _scriptID + '] ' + _actualTime + ' ' + _activeTime + '<br />');
                        
                        putCookie('SSscrID', _scriptID, _stat_IADBauto_refresh_time);
                        putCookie('SSscrDBautoActiveSec', Math.round(new Date().getTime() / 1000 / 60));
                        if (_IADBmode == 'auto') {
                            _resetIADBauto_Interval('run');
                        }
                    }
                  
                    function _resetIADBauto_Interval(_cmd){
                        if (getCookie('SS_DB_dailyDone') == 'true') {
                            $('#F5stat_totals_dbg').append('<br /><span style="color:blue">' + '<b>Daily scan DONE</b></span> - slowing down just for 12h<br />');
                            var _minutes = _stat_IADBauto_refresh_DayWait * 60;
                        }
                        else {
                            var _minutes = _stat_IADBauto_refresh_continue;
                        }
                        
                        
                        $('#F5stat_totals_dbg').append('<span style="color:blue">' + 'Scan interval set to</span> ' + _minutes + ' minutes<br />');
                        
                        var _prev_RT = _stat_IADBauto_refresh_time;
                        
                        _stat_IADBauto_refresh_time = _minutes * 60 * 1000;
                        if ((_prev_RT == _stat_IADBauto_refresh_time)) {
                            return false;
                        }
                        else 
                            $('#F5stat_totals_dbg').append('<span style="color:green">' + 'Scan interval changed: </span> ' + _minutes + ' minutes<br />');
                        
                        $('#F5stat_totals_dbg').append('<span style="color:green">' + 'New interval: </span> ' + _stat_IADBauto_refresh_time + ' <br />');
                        
                        if (_cmd) {
                            clearInterval(_scriptIDcheckInterval);
                            $('#F5stat_totals_dbg').append('Stop checking for time slot, start scan..<br />');
                        }
                        
                        clearInterval(_stat_IADBauto_refresh_int);
                        
                        _stat_IADBauto_refresh_int = setInterval(function(){
                            
                            if (_imgADBcurrPage > _imgADBnumPages) {
                                _imgADBcurrPage = 1;
                                localStorage['_imgADBcurrPage'] = _imgADBcurrPage;
                            }
                            
                            if (_imgADBnumPages > 0) 
                                var _pr = Math.round((_imgADBcurrPage * 100) / _imgADBnumPages);
                                else 
                                _pr = 0;
                            
                            $('#F5_app_status_txt').hide().html('<span style="color:green">Updating full stats ' + _pr + '% </span>' + ' chapter: ' + _imgADBchapters[_imgADBcurrChapter]).fadeIn('slow');
                            $('#F5stat_totals_dbg').append('<span style="color:green">' + 'New interval: </span> ' + _stat_IADBauto_refresh_time + ' <br />');
                            
                            _IADBloadPage( _imgADBchapters[_imgADBcurrChapter], _imgADBcurrPage);
                            
                        }, _stat_IADBauto_refresh_time);
                    }




                function _getSSInitialData()    
                    {
                    $('#F5_LSdbg').hide().html('Getting initial...').fadeIn('slow');

                    if (!getCookie('SSimgsInGall')) 
                       {

                        $('#F5_LSdbg').hide().append(' no.. > setting').fadeIn('slow');

                       $.get( 'http://submit.shutterstock.com/review.mhtml?approved=1&type=photos',
                        function(data){
                            _new_content = data.replace(/[\n\r\t]/g, '');
                             myRGXP = new RegExp('View\\s+All\\s+(\\d*)\\s+Approved\\s+Photos', 'gi');
                            _match = myRGXP.exec(_new_content);
                         if (_match && _match[1]) {
                            putCookie('SSimgsInGall', _match[1], 60 * 1);
        
                            }
                         }
    
                         );

                       } else $('#F5_LSdbg').hide().append(' ok.. ').fadeIn('slow');
                    }


                }// run
            })(jQuery);
            
            
            
            
            
            function putCookie(_name, _val, _minutes){
                if (_minutes) {
                    var date = new Date();
                    date.setTime(date.getTime() + (_minutes * 60 * 1000));
                    var expires = "; expires=" + date.toGMTString();
                }
                else 
                    var expires = "";
                
                document.cookie = _name + "=" + escape(_val) + expires + "; path=/";
            }
            
            
            function getCookie(_name){
                _return = false;
                if (document.cookie != "") {
                    var cookieArr = document.cookie.split("; ");
                    
                    for (i = 0; i < cookieArr.length; i++) {
                        var cookieName = cookieArr[i].split("=")[0];
                        var cookieVal = cookieArr[i].split("=")[1];
                        if (cookieName == _name) 
                            _return = unescape(cookieVal);
                    }
                }
                return _return;
            }
            
            function delCookie(_name){
                putCookie(_name, "", -1);
            }
            
            
            
             
            
        } /* _main() exchange end */

      
     function _preg_match(_str, _patt){
            
                var myRGXP_part = new RegExp(_patt, 'gi');
                return myRGXP_part.exec(_str);
            }
            
            
    console.log('>>> SSSiteBoost finished');
  } //run_SSS: function()
    
} // SSSiteBoost


window.onload = setTimeout(function() { SSSiteBoost.run_SSS(); }, 800);