const editor = ace.edit("editor");
const savedLanguage = localStorage.getItem("language") || "c";
const savedTheme = localStorage.getItem("theme") || "textmate";
editor.setShowPrintMargin(false);

let languageCodeSamples = {
    "c": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
    "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}",
    "java": "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}",
    "kotlin": "fun main() {\n    println(\"Hello, World!\")\n}",
    "pascal": "program HelloWorld;\nbegin\n    writeln('Hello, World!');\nend.",
    "pypy": "print('Hello, World!')",
    "python": "print('Hello, World!')",
    "scratch": "// Scratch is a visual programming language, no text code required"
};

let languageFileNames = {
    "c": "main.c",
    "cpp": "main.cpp",
    "java": "Main.java",
    "kotlin": "Main.kt",
    "pascal": "Main.pas",
    "pypy": "main.py",
    "python": "main.py",
    "scratch": "main.sb3"
};


document.getElementById("theme").addEventListener("change", function () {
    editor.setTheme("ace/theme/" + this.value);
    localStorage.setItem("theme", this.value);
});

document.getElementById("language").addEventListener("change", function () {
    const selectedLang = this.value;

    if (selectedLang == 'c' || selectedLang == 'cpp') {
        editor.session.setMode("ace/mode/c_cpp");
    } else {
        editor.session.setMode("ace/mode/" + selectedLang);
    };

    localStorage.setItem("language", selectedLang);
    editor.setValue(languageCodeSamples[selectedLang]);
    editor.clearSelection();
    const fileName = languageFileNames[selectedLang];
    document.querySelector(".ace_wrapper .file-name").value = fileName;
});

document.getElementById("language").value = savedLanguage;
document.getElementById("theme").value = savedTheme;
document.querySelector(".ace_wrapper .file-name").value = languageFileNames[savedLanguage];
if (savedLanguage == 'c' || savedLanguage == 'cpp') {
    editor.session.setMode("ace/mode/c_cpp");
} else {
    editor.session.setMode("ace/mode/" + savedLanguage)
};
editor.setValue(languageCodeSamples[savedLanguage]);

editor.clearSelection();
if (this.value == 'c' || this.value == 'cpp') {
    editor.setTheme("ace/theme/c_cpp");
} else {
    editor.setTheme("ace/theme/" + savedTheme)
};


function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const index = tabId === 'input-tab' ? 0 : 1;
    document.querySelectorAll('.tab-button')[index].classList.add('active');
}

let terminal = document.getElementById("terminal");
let input = document.getElementById("input");

function saveFile() {
    let code = editor.getValue();
    let filename = document.querySelector('.ace_wrapper .file-name').value || "main.c";
    if (!filename) return; 

    let blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



function showIde(){
    document.querySelector('.ace_wrapper').style.display = 'block';
    document.querySelector('.ide-btn').style.display = 'none';
    document.querySelector('#page-container').classList.add('ide-open');
    document.querySelector('main#content').classList.add('ide-content');
    const pdfContainer = document.querySelector('object#pdfContainer');

    if (pdfContainer) {
        const contentLeft = document.querySelector('#content-left.split-common-content');
        if (contentLeft) contentLeft.classList.add('ide-active');

        const commonContent = document.querySelector('#common-content');
        if (commonContent) commonContent.classList.add('ide-active');

        const contentRight = document.querySelector('#content-body #content-right');
        if (contentRight) contentRight.classList.add('ide-active');
    }
}

function hideIde(){
    document.querySelector('.ace_wrapper').style.display = 'none';
    document.querySelector('.ide-btn').style.display = 'block';
    document.querySelector('#page-container').classList.remove('ide-open');
    document.querySelector('main#content').classList.remove('ide-content');
    const pdfContainer = document.querySelector('object#pdfContainer');

    if (pdfContainer) {
        const contentLeft = document.querySelector('#content-left.split-common-content');
        if (contentLeft) contentLeft.classList.remove('ide-active');

        const commonContent = document.querySelector('#common-content');
        if (commonContent) commonContent.classList.remove('ide-active');

        const contentRight = document.querySelector('#content-body #content-right');
        if (contentRight) contentRight.classList.remove('ide-active');
    }
}

function runCode() {
    let code = editor.getValue(); 
    let inputText = input.value;  

    terminal.value = "Running code...\n";
    showTab('output-tab');

    fetch("http://127.0.0.1:8000/run_code/", {
        method: "POST",  
        headers: {
            "Content-Type": "application/json"  
        },
        body: JSON.stringify({
            code: code,
            input_data: inputText
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail); 
            });
        }
        return response.json();  
    })
    .then(data => {
        terminal.value = data.output;
        terminal.value += "\nElapsed Time: " + data.elapsed_time + " seconds";
        terminal.value += "\nMemory Usage: " + data.memory_usage + " KB";
    })
    .catch(error => {
        terminal.value = "Error: " + error.message;  
    });
}