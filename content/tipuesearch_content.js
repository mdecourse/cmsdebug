var tipuesearch = {"pages": [{'title': 'About', 'text': '倉儲:  https://github.com/mdecourse/cmsdebug   \n 網頁:  https://mde.tw/cmsdebug \n 目的: 用於測試  CMSiMDE  新功能, 並進行相關除錯與測試流程.', 'tags': '', 'url': 'About.html'}, {'title': 'Develop', 'text': '2021 Fall 的  CMSiMDE  改版, 主要是將 Edit All 與 Edit 的編輯存檔改為 AJAX.', 'tags': '', 'url': 'Develop.html'}, {'title': 'AJAX', 'text': '總共有四個地方進行修改: \n savepage 與 ssavepage 要 comment 將 \\n 換為空字串的程式碼. \n sh4tinymce 要讓程式碼二次編修能告知 editor, 修改函式如下: \n function onSubmitFunction(e) {\n    var code = e.data.code;\n    code = code.replace(/\\</g,"<").replace(/\\>/g,">");\n    /* Convert settings into strings for classname */\n    var language\t= e.data.language ? e.data.language : defaultLanguage;\n    var collapse\t= e.data.collapse != shDefault.collapse ? \';collapse:\' + e.data.collapse : \'\';\n    var autolinks\t= e.data.autolinks != shDefault.autolinks ? \';auto-links:\' + e.data.autolinks : \'\';\n    var gutter\t\t= e.data.gutter != shDefault.gutter ? \';gutter:\' + e.data.gutter : \'\';\n    var htmlscript\t= e.data.htmlscript != shDefault.htmlscript ? \';html-script:\' + e.data.htmlscript : \'\';\n    var toolbar\t\t= e.data.toolbar != shDefault.toolbar ? \';toolbar:\' + e.data.toolbar : \'\';\n    var firstline\t= e.data.firstline != shDefault.firstline ? \';first-line:\' + e.data.firstline : \'\';\n    var hlstart=e.data.highlight.indexOf(",")!=-1?"[":"",\n        hlend=e.data.highlight.indexOf(",")!=-1?"]":"";\n    var highlight\t= e.data.highlight.replace(/ /g,"").replace(/\\[/g,"").replace(/\\]/g,"") != shDefault.highlight ? \';highlight:\' + hlstart + e.data.highlight.replace(/ /g,"").replace(/\\[/g,"").replace(/\\]/g,"").replace(/,$/g,"") + hlend : \'\';\n    var tabsize\t\t= e.data.tabsize != shDefault.tabsize ? \';tab-size:\' + e.data.tabsize : \'\';\n    \n    // Create SH element with string settings\n    Elmt = editor.dom.create(\'pre\',\n                {class: \'brush:\' + language + collapse + autolinks + gutter + htmlscript + toolbar + firstline + highlight + tabsize,\n                 contenteditable: \'false\'},\n                 code);\n    \n    if(selected)\n        editor.dom.replace(Elmt, selectionNode);\n    else\n        editor.insertContent(editor.dom.getOuterHTML(Elmt)+\'<br>\');\n    // KMOlab before get back to tinymce editor, set dirty\n    tinymce.activeEditor.setDirty(true);\n} \n 最後則是 tinymce_editor 函式的修改, 共有三種存檔模式: Edit_All, one page save and collaborative save. \n def tinymce_editor(menu_input=None, editor_content=None, page_order=None):\n    \n    """Tinymce editor scripts\n    """\n    \n    sitecontent =file_get_contents(config_dir + "content.htm")\n    editor = set_admin_css() + editorhead() + \'\'\'</head>\'\'\' + editorfoot()\n    # edit all pages\n    if page_order is None:\n        outstring = editor + "<div class=\'container\'><nav>" + \\\n                        menu_input + "</nav><section><form onsubmit=\'return save_all_data(this)\'> \\\n                        <textarea class=\'simply-editor\' name=\'page_content\' cols=\'50\' rows=\'15\'>" +  \\\n                        editor_content + "</textarea><input type=\'button\' onClick=\'save_all()\' value=\'save\'>"\n        outstring +="""\n        <script>    \n        function tempAlert(msg,duration)\n            {\n             var el = document.createElement("div");\n             el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:lightgreen;");\n             el.innerHTML = msg;\n             setTimeout(function(){\n              el.parentNode.removeChild(el);\n             },duration);\n             document.body.appendChild(el);\n            }\n        \n        function save_all(){\n            tinymce.activeEditor.execCommand(\'mceSave\');\n        }\n        \n        function save_all_data(form) {\n                var page_content = $(\'textarea#page_content\').val();\n                \n                $.ajax({\n                    type: "POST",\n                    url: "/savePage",\n                    data: {"page_content": page_content},\n                    error: function(XMLHttpRequest, textStatus, errorThrown) {\n                        alert(XMLHttpRequest.status);\n                        alert(XMLHttpRequest.readyState);\n                        alert(textStatus);\n                    },\n                    success: function() {\n                        //document.getElementById("notice").innerHTML = "saved!";\n                        tempAlert("saved!", 700);\n                    }\n                 }); \n        }\n        </script>\n        """\n        outstring += "</form></section></body></html>"\n    else:\n        # add viewpage button while single page editing\n        head, level, page = parse_content()\n        outstring = "<p id=\'notice\'></p>"\n        outstring  += editor + "<div class=\'container\'><nav>" + \\\n                        menu_input+"</nav><section><form onsubmit=\'return save_data(this)\'> \\\n                        <textarea class=\'simply-editor\' id=\'page_content\' name=\'page_content\' cols=\'50\' rows=\'15\'>" + \\\n                        editor_content + "</textarea><input type=\'hidden\'  id=\'page_order\' name=\'page_order\' value=\'" + \\\n                        str(page_order) + "\'>"\n        # add an extra collaborative save button\n        outstring += """<input type="button" onClick="ssave()"  value="save">"""\n        outstring += """<input type="button" onClick="cssave()"  value="csave">"""\n\n        outstring +="""\n        <script>    \n        \n        function tempAlert(msg,duration)\n            {\n             var el = document.createElement("div");\n             el.setAttribute("style","position:absolute;top:40%;left:20%;background-color:lightgreen;");\n             el.innerHTML = msg;\n             setTimeout(function(){\n              el.parentNode.removeChild(el);\n             },duration);\n             document.body.appendChild(el);\n            }\n            \n        // default action is "save"\n        var action ="save"\n        \n        function cssave(){\n            action = "csave";\n            tinymce.activeEditor.execCommand(\'mceSave\');\n        }\n        \n        function ssave(){\n            action = "save";\n            tinymce.activeEditor.execCommand(\'mceSave\');\n        }\n        \n        function save_data(form) {\n                var page_content = $(\'textarea#page_content\').val();\n                var page_order = $(\'#page_order\').val();\n                \n                $.ajax({\n                    type: "POST",\n                    url: "/ssavePage",\n                    data: {"page_content": page_content, "page_order": page_order, "action": action},\n                    error: function(XMLHttpRequest, textStatus, errorThrown) {\n                        alert(XMLHttpRequest.status);\n                        alert(XMLHttpRequest.readyState);\n                        alert(textStatus);\n                    },\n                    success: function() {\n                        //document.getElementById("notice").innerHTML = "saved!";\n                        tempAlert("saved!", 700);\n                    }\n                 }); \n        }\n        </script>\n        """\n        outstring += \'\'\'<input type=button onClick="location.href=\'/get_page/\'\'\' + \\\n                    head[page_order] + \\\n                    \'\'\'\'" value=\'viewpage\'></form></section></body></html>\'\'\'\n    return outstring\n\n\n \n', 'tags': '', 'url': 'AJAX.html'}]};