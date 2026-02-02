/**
 * SharIF Judge
 * @file shj_submit.js
 *
 *     Javascript codes for "Submit" page
 */

$(document).ready(function(){
    var editor = ace.edit("code_editor");
    editor.setOptions({
        theme: "ace/theme/monokai",
        fontSize: "11pt"
    });

    function disableEditor(bool) {
        $("#editor_save").prop("disabled", bool);
        $("#editor_execute").prop("disabled", bool);
        $("#editor_submit").prop("disabled", bool);
        $("#editor_input").prop("disabled", bool);
        editor.setReadOnly(bool);
    }

    function loadCode(problem_id){
        $("#editor_input").val("");
        $("#editor_output").val("");

        if(problem_id == 0){
            disableEditor(true);
            editor.setValue("");
            $("#ajax_status").html("Select problem and language");
        }
        else{
            disableEditor(true);
            $.ajax({
                url: shj.site_url + 'submit/load/' + problem_id,
                cache: false,
                success: function (data){
                    data = JSON.parse(data);
                    editor.setValue(data.content);
                    $("#ajax_status").html(data.message);
                },
                error: function (error){
                    console.error(error);
                },
            });
        }
    }

    $("select#problems").change(function(){
        var v = $(this).val();
        loadCode(v);
        $('select#languages').empty();
        $('<option value="0" selected="selected">-- Select Language --</option>').appendTo('select#languages');
        for (var i=0;i<shj.p[v].length;i++)
            $('<option value="'+shj.p[v][i]+'">'+shj.p[v][i]+'</option>').appendTo('select#languages');
    });

    $("select#languages").change(function(){
        if(this.value.toLowerCase().includes("java")){
            editor.session.setMode("ace/mode/java");
            disableEditor(false);
        }
        else if(this.value.toLowerCase().includes("python")){
            editor.session.setMode("ace/mode/python");
            disableEditor(false);
        }
        else if(this.value.toLowerCase().includes("c")){
            editor.session.setMode("ace/mode/c_cpp");
            disableEditor(false);
        }
        else if(this.value.toLowerCase().includes("txt")){
            editor.session.setMode("ace/mode/plain_text");
            disableEditor(false);
            $("#editor_execute").prop("disabled", true);
            $("#editor_input").prop("disabled", true);
        }
        else{
            editor.session.setMode("ace/mode/plain_text");
            disableEditor(true);
        }
    });

    $("#editor_save").click(function(){
        disableEditor(true);
        $.ajax({
            type: "POST",
            url: shj.site_url + 'submit/save', 
            data: {
                shj_csrf_token: shj.csrf_token,
                code_editor: editor.getValue(),
                problem_id: $("select#problems").val(),
                language: $("select#languages").val(),
            },
            cache: false,
            success: function(data){
                data = JSON.parse(data);
                $("#ajax_status").html(data.message);
                disableEditor(false);
            },
            error: function (error){
                console.error(error);
                disableEditor(false);
            },
        });
     });

    $("#editor_submit").click(function(){
        disableEditor(true);
        $.ajax({
            type: "POST",
            url: shj.site_url + 'submit/save/submit', 
            data: {
                shj_csrf_token: shj.csrf_token,
                code_editor: editor.getValue(),
                problem_id: $("select#problems").val(),
                language: $("select#languages").val(),
            },
            cache: false,
            success: function(data){
                data = JSON.parse(data);
                $("#ajax_status").html(data.message);
                disableEditor(false);
                if(data.status){	
                    window.location.href = shj.site_url + 'submissions/all';
                }
            },
            error: function (error){
                console.error(error);
                disableEditor(false);
            },
        });
     });

    $("#editor_execute").click(function(){
        disableEditor(true);
        $.ajax({
            type: "POST",
            url: shj.site_url + 'submit/save/execute', 
            data: {
                shj_csrf_token: shj.csrf_token,
                code_editor: editor.getValue(),
                editor_input: $('textarea#editor_input').val(),
                problem_id: $("select#problems").val(),
                language: $("select#languages").val(),
            },
            cache: false,
            success: function(data){
                data = JSON.parse(data);
                $("#ajax_status").html(data.message);
                if(data.status){
                    (function update() {
                        $.ajax({
                            url: shj.site_url + 'submit/get_output/' + $("select#problems").val(),
                            cache: false,
                            success: function (data){
                                data = JSON.parse(data);
                                $('textarea#editor_output').val(data.content);
                                if(!data.status){
                                    setTimeout(update, 1000);
                                }
                                else{
                                    $("#ajax_status").html("Completed");
                                    disableEditor(false);
                                }
                            },
                            error: function (error){
                                console.error(error);
                                disableEditor(false);
                            },
                        })
                    })();
                }
                else{
                    disableEditor(false);
                }
            },
            error: function (error){
                console.error(error);
                disableEditor(false);
            },
        });
     });

    loadCode($("select#problems").val()); 
});