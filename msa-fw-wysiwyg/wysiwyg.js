/**************************************************************
 * Copyright (C) 2025 msa-fw. All Rights Reserved
 *
 * @file        https://github.com/msa-fw/wysiwyg/blob/master/msa-fw-wysiwyg/wysiwyg.js
 * @author      msa-fw
 * @site        https://github.com/msa-fw/wysiwyg
 * @date        2025-04-23
 */

window.wysiwyg = {};

window.wysiwyg = {
    kits: {},
    langs: {},
    addKit: function(key, buttonsPackage)
    {
        this.kits[key] = JSON.parse(buttonsPackage);
        return this;
    },
    addLang: function(langPackage)
    {
        this.langs = JSON.parse(langPackage);
        return this;
    },
    init: function(textAreaFieldSelector, packageKit)
    {
        let selectorObject = document.querySelector(textAreaFieldSelector);
        wysiwyg.makeEvent(selectorObject, 'beforeWysiwygInitialized');

        if(wysiwyg.defined(selectorObject)){
            wysiwyg.addRemoveClass('hidden', selectorObject);

            let parent = selectorObject.parentNode;
            parent.innerHTML = parent.innerHTML + this.createField(textAreaFieldSelector, packageKit);
        }
        wysiwyg.makeEvent(selectorObject, 'afterWysiwygInitialized');
    },
    createField: function(textAreaFieldSelector, packageKit, append)
    {
        let selector = textAreaFieldSelector.replace(/#|./, '');
        let id = selector + '_' + packageKit;

        return '<div class="wysiwyg" id="' + id + '">\n' +
                '<div class="wysiwyg-block">\n' +
                    '<div class="editor-header">\n' +
                        this.renderButtons(packageKit) +
                    '</div>\n' +
                    '<div class="editor-body">\n' +
                        '<div class="container">\n' +
                            '<div class="content content-editable-field" contenteditable="true" data-selector="' + textAreaFieldSelector + '"></div>\n' +
                        '</div>\n' +
                    '</div>\n' +
                '</div>\n' +
            '</div>\n';
    },
    renderButtons: function(packageKit)
    {
        let parent = [];
        let children = [];

        if(wysiwyg.defined(this.kits[packageKit])){
            for(let i = 0; i < this.kits[packageKit].length; i++){
                let button = this.kits[packageKit][i];

                if(!button.parentKey){
                    parent.push(button);
                }else{
                    children.push(button);
                }
            }
        }

        let result = '';
        let childrenButtons;
        for(let p = 0; p < parent.length; p++){
            childrenButtons = '';
            for(let c = 0; c < children.length; c++){
                if(parent[p].key === children[c].parentKey){
                    childrenButtons = childrenButtons + this.renderButton(children[c], true);
                }
            }

            if(childrenButtons){
                result = result +
                    '<span class="wysiwyg-button clickable with-pop-up ' + parent[p].key + '" onclick="wysiwyg.commands.' + parent[p].key + '(this)">' +
                        '<img class="pop-up-image" src="' + parent[p].icon + '" title="' + wysiwyg.translate(parent[p].title) + '"/>' +
                        '<span class="pop-up closeable hidden">' +
                            '<span class="header">' + wysiwyg.translate(parent[p].title) + '</span>' +
                            '<span class="children-buttons">' + childrenButtons + '</span>' +
                        '</span>' +
                    '</span>';
            }else{
                result = result + this.renderButton(parent[p]);
            }
        }

        return result;
    },
    renderButton: function(button, titleAsText = false)
    {
        let buttonClass = 'wysiwyg-button ' + button.key;
        let buttonParams = '';
        if(button.key !== 'limiter'){
            buttonClass = buttonClass + ' clickable';
            if(button.parentKey){
                buttonParams = ' onclick="wysiwyg.commands.' + button.key + '(this, \'' + button.key + '\')"';
            }else {
                buttonParams = ' onclick="wysiwyg.commands.' + button.key + '(this)"';
            }
        }

        if(!titleAsText){
            return '<span class="' +  buttonClass + '"' + buttonParams + ' data-title="' + wysiwyg.translate(button.title) + '">' +
                        '<img src="' + button.icon + '" title="' + wysiwyg.translate(button.title) + '"/>' +
                    '</span>';
        }
        return '<span class="' +  buttonClass + '"' + buttonParams + ' data-title="' + wysiwyg.translate(button.title) + '">' +
                    '<img src="' + button.icon + '"/>' +
                    '<span class="title">' + wysiwyg.translate(button.title) + '</span>' +
                '</span>';
    },
    run: function(selector)
    {
        let wysiwygObject = document.querySelector(selector);

        wysiwyg.makeEvent(wysiwygObject, 'onWysiwygInitialized');
        wysiwyg.makeEvent(wysiwygObject, 'beforeWysiwygStart');

        document.addEventListener('input', function(event){
            if(wysiwyg.defined(wysiwygObject.dataset) && wysiwyg.defined(wysiwygObject.dataset.selector)){
                let selector = document.querySelector(wysiwygObject.dataset.selector);
                if(wysiwyg.defined(selector)){
                    selector.value = wysiwygObject.innerHTML;
                }
            }
        });
        wysiwyg.makeEvent(wysiwygObject, 'afterWysiwygStart');
    },
    showPopUp: function(button)
    {
        let popUp = button.querySelector('.pop-up');
        if(wysiwyg.defined(popUp)){
            if(popUp.classList.contains('hidden')){
                this.closeAllPopups();
                popUp.classList.remove('hidden');
            }else{
                popUp.classList.add('hidden');
            }
        }
    },
    closeAllPopups: function()
    {
        let popUps = document.querySelectorAll('.pop-up.closeable');
        if(wysiwyg.defined(popUps)){
            for(let i = 0; i < popUps.length; i++){
                if(!popUps[i].classList.contains('hidden')){
                    popUps[i].classList.add('hidden');
                }
            }
        }
    },
    addRemoveClass: function(className, object)
    {
        if(object.classList.contains(className)){
            object.classList.remove(className);
        }else{
            object.classList.add(className);
        }
    },
    getEditor : function(button)
    {
        let parent = button.closest('.wysiwyg');
        if(wysiwyg.defined(parent)){
            return parent;
        }
        return false;
    },
    getEditorObject : function(button)
    {
        let parent;
        if(parent = wysiwyg.getEditor(button)){
            let editable = parent.querySelector('.container .content');
            if(wysiwyg.defined(editable)){
                return editable;
            }
        }
        return false;
    },
    selected: function()
    {
        let windowSelection = window.getSelection();
        let editorSelection = {
            selection: null,
            element: '',
            text: '',
            node: '',
        };
        if(windowSelection !== null){
            editorSelection.selection = windowSelection;
            editorSelection.node = windowSelection.anchorNode;
            editorSelection.element = windowSelection.anchorNode.parentElement;
            let selectionText = windowSelection.toString();
            if(selectionText.length > 0){
                editorSelection.text = selectionText;
            }
        }
        return editorSelection;
    },
    focus: function(button)
    {
        let editor;
        if(editor = wysiwyg.getEditorObject(button)){
            editor.focus();
        }
        return this;
    },
    insertHtml: function(button, command, content = null)
    {
        let editor;
        if(editor = wysiwyg.getEditorObject(button)){ editor.focus(); }

        document.execCommand(command, false, content);
        // if(editor){ editor.focus(); }
    },
    commands: {
        limiter: function(button)
        {
            // buttons delimiter; not for using
            return false;
        },
        bold: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'bold');
        },
        italic: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'italic');
        },
        strike: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'strikethrough');
        },
        underline: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }
            wysiwyg.insertHtml(button, 'underline');
        },
        hr: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'insertHtml', '<hr>');
        },
        code: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<pre>' + content.text + '</pre><br>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        quote: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<blockquote>' + content.text + '</blockquote><br>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        table: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent =
                '<table>' +
                    '<thead>' +
                        '<tr>' +
                            '<th class="buttons-add" contenteditable="false">' +
                                '<div class="button-add table-button" onclick="wysiwyg.helper.addTableColumn(this)" contenteditable="false">+</div>' +
                                '<div class="button-remove table-button" onclick="wysiwyg.helper.removeTableColumn(this)" contenteditable="false">-</div>' +
                            '</th>' +
                            '<th>A</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        '<tr>' +
                            '<td class="buttons-add" contenteditable="false">' +
                                '<div class="button-add table-button" onclick="wysiwyg.helper.addTableRow(this)" contenteditable="false">+</div>' +
                                '<div class="button-remove table-button" onclick="wysiwyg.helper.removeTableRow(this)" contenteditable="false">-</div>' +
                            '</td>' +
                            '<td>' + content.text + '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        header: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, 'h1');
        },
        h1: function(button, tag = 'h1')
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            content.text = content.text ? content.text : 'HEADER';
            let textContent = '<' + tag + '>' + content.text + '</' + tag + '><br>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        h2: function(button, tag)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, tag);
        },
        h3: function(button, tag)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, tag);
        },
        h4: function(button, tag)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, tag);
        },
        h5: function(button, tag)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, tag);
        },
        h6: function(button, tag)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.h1(button, tag);
        },
        align: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }
            return this.alignLeft(button);
        },
        alignCenter: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'JustifyCenter');
        },
        alignJustify: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'justifyFull');
        },
        alignLeft: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'JustifyLeft');
        },
        alignRight: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.insertHtml(button, 'JustifyRight');
        },
        list: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.listPointer(button);
        },
        listRating: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ol class="rating" reversed><li>' + content.text + '</li></ol>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        listCircled: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ul style="list-style-type: circle"><li>' + content.text + '</li></ul>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        listPointer: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ul style="list-style-type: disc"><li>' + content.text + '</li></ul>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        listCheckbox: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ol class="checkbox"><li><input type="checkbox">' + content.text + '</li></ol>';

            for(let i=0; i<10;i++){
                wysiwyg.insertHtml(button, 'insertHtml', textContent);
            }
        },
        outlineList: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.outlineListInteger(button);
        },
        outlineListInteger: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ol type="1"><li>' + content.text + '</li></ol>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        outlineListLetter: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ol type="A"><li>' + content.text + '</li></ol>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        outlineListRoman: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            let textContent = '<ol type="I"><li>' + content.text + '</li></ol>';
            wysiwyg.insertHtml(button, 'insertHtml', textContent);
        },
        link: function(button){
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            wysiwyg.helper.openModal(button, 'wysiwyg.helper.addLink', content.text);
        },
        audio: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.fileRemote(button, 'Audio');
        },
        image: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.fileRemote(button, 'Image');
        },
        video: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.fileRemote(button, 'Video');
        },
        file: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            return this.fileRemote(button, 'File');
        },
        fileRemote: function(button, target)
        {
            if(button.querySelector('.pop-up')){ return; }

            let content = wysiwyg.focus(button).selected();
            wysiwyg.helper.openModal(button, 'wysiwyg.helper.add' + target, content.text);
        },
        remove: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let editor;
            if(editor = wysiwyg.getEditorObject(button)){ editor.focus(); }

            let content = wysiwyg.selected();

            if(content.text){
                document.execCommand('insertHtml', false, content.text);
            }else{
                editor.innerHTML = editor.innerText;
            }

            if(editor){ editor.focus(); }
        },
        showBlocks: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let editor;
            if(editor = wysiwyg.getEditorObject(button)){
                wysiwyg.addRemoveClass('active', button);
                wysiwyg.addRemoveClass('dashed', editor);
            }
        },
        fullScreen: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            wysiwyg.addRemoveClass('active', button);

            let editor = button.closest('.wysiwyg');
            if(wysiwyg.defined(editor)){
                if(editor.classList.contains('full-screen')){
                    editor.classList.remove('full-screen');
                    document.body.style.overflow = 'auto';

                    let containerBlock = editor.querySelector('.container');
                    if(wysiwyg.defined(containerBlock)){
                        containerBlock.style.height = '';
                        containerBlock.style.maxHeight = '';
                    }

                    let contentField = containerBlock.querySelector('.content');
                    if(wysiwyg.defined(contentField)){
                        contentField.style.height = '';
                        contentField.style.maxHeight = '';
                    }
                }else{
                    editor.classList.add('full-screen');
                    document.body.style.overflow = 'hidden';

                    let containerBlock = editor.querySelector('.container');
                    if(wysiwyg.defined(containerBlock)){
                        containerBlock.style.height = window.screen.availHeight + 'px';
                        containerBlock.style.maxHeight = window.screen.availHeight + 'px';
                    }

                    let contentField = containerBlock.querySelector('.content');
                    if(wysiwyg.defined(contentField)){
                        contentField.style.height = window.screen.availHeight/1.3 + 'px';
                        contentField.style.maxHeight = window.screen.availHeight/1.3 + 'px';
                    }
                }
            }
        },
        editSource: function(button)
        {
            if(button.querySelector('.pop-up')){ return; }

            let editor;
            if(editor = wysiwyg.getEditorObject(button)){
                wysiwyg.addRemoveClass('active', button);
                wysiwyg.addRemoveClass('hidden', editor);
            }

            let parent = editor.closest('.container');
            if(wysiwyg.defined(parent)){
                if(editor.classList.contains('hidden')){
                    let parentEditor, tempIdentifier = '';
                    if(parentEditor = wysiwyg.getEditor(button)){
                        tempIdentifier = 'temporaryTextAreaIdentifier-' + parentEditor.id;
                    }

                    let textArea = document.createElement('textarea');
                    textArea.classList.add(...editor.classList);
                    textArea.classList.remove('hidden');
                    textArea.id = tempIdentifier;
                    textArea.innerHTML = editor.innerHTML;
                    parent.appendChild(textArea);

                    textArea.addEventListener('input', function(event){
                        if(wysiwyg.defined(editor.dataset) && wysiwyg.defined(editor.dataset.selector)){
                            let textAreaMainField = document.querySelector(editor.dataset.selector);
                            if(wysiwyg.defined(textAreaMainField)){
                                editor.innerHTML = textArea.value;
                                textAreaMainField.value = textArea.value;
                            }
                        }
                    });
                }else{
                    let textArea = parent.querySelector('textarea');
                    if(wysiwyg.defined(textArea)){
                        parent.removeChild(textArea);
                    }
                }
            }
        },
    },
    helper: {
        addTableColumn: function(self)
        {
            let table = self.closest('table');
            if(wysiwyg.defined(table)){
                let theadTr = table.querySelector(':scope > thead > tr');
                if(wysiwyg.defined(theadTr)){
                    let theadHead = theadTr.querySelectorAll(':scope > th');
                    let latestHeader = theadHead[theadHead.length-1];
                    if(wysiwyg.defined(theadHead) && wysiwyg.defined(latestHeader)){
                        theadTr.innerHTML = theadTr.innerHTML + latestHeader.outerHTML;
                    }
                }

                let tbodyTr = table.querySelectorAll(':scope > tbody > tr');
                for(let tbodyTrTotal = 0; tbodyTrTotal < tbodyTr.length; tbodyTrTotal++){
                    let tbodyBody = tbodyTr[tbodyTrTotal].querySelectorAll(':scope > td');

                    let latestBody = tbodyBody[tbodyBody.length-1];
                    if(wysiwyg.defined(tbodyBody) && wysiwyg.defined(latestBody)){
                        tbodyTr[tbodyTrTotal].innerHTML += latestBody.outerHTML;
                    }
                }
            }
        },
        addTableRow: function(self)
        {
            let tr = self.closest('tr');
            if(wysiwyg.defined(tr)){
                let tbody = self.closest('tbody');
                if(wysiwyg.defined(tbody)){
                    tr = tr.cloneNode(tr);
                    tbody.appendChild(tr);
                }
            }
        },
        removeTableColumn: function(self)
        {
            let table = self.closest('table');
            if(wysiwyg.defined(table)){
                let theadTr = table.querySelector(':scope > thead > tr');
                if(wysiwyg.defined(theadTr)){
                    let theadHead = theadTr.querySelectorAll(':scope > th');
                    let latestHeader = theadHead[theadHead.length-1];
                    if(wysiwyg.defined(theadHead) && wysiwyg.defined(latestHeader)){
                        theadTr.removeChild(latestHeader);
                    }
                }

                let tbodyTr = table.querySelectorAll(':scope > tbody > tr');
                for(let tbodyTrTotal = 0; tbodyTrTotal < tbodyTr.length; tbodyTrTotal++){
                    let tbodyBody = tbodyTr[tbodyTrTotal].querySelectorAll(':scope > td');

                    let latestBody = tbodyBody[tbodyBody.length-1];
                    if(wysiwyg.defined(tbodyBody) && wysiwyg.defined(latestBody)){
                        tbodyTr[tbodyTrTotal].removeChild(latestBody);
                    }
                }
            }
        },
        removeTableRow: function(self)
        {
            let tr = self.closest('tr');
            if(wysiwyg.defined(tr)){
                let tbody = self.closest('tbody');
                if(wysiwyg.defined(tbody)){
                    tbody.removeChild(tr);
                }
            }
        },
        addLink: function(modalId, wysiwygId, linkContent = '')
        {
            let wysiwygEditor = document.querySelector('#' + wysiwygId);
            let editable = wysiwygEditor.querySelector('.container .content');
            let tmpLink = editable.querySelector('#link-tmp-' + wysiwygId);

            if(wysiwyg.defined(editable)){
                editable.focus();

                if(!linkContent){
                    let modalData = document.forms['modalForm'];

                    let linkTitle = '';
                    let linkHref = '';
                    if(modalData.url.value){
                        linkHref = linkTitle = modalData.url.value;
                        if(modalData.title.value){
                            linkTitle = modalData.title.value;
                        }
                        linkContent = '<a href="' + linkHref + '" target="_blank">' + linkTitle + '</a>';
                    }
                }

                if(wysiwyg.defined(tmpLink)){
                    if(linkContent){
                        tmpLink.outerHTML = linkContent;
                        tmpLink.removeAttribute('id');
                        tmpLink.removeAttribute('class');
                    }else{
                        tmpLink.remove();
                    }
                }
            }
            wysiwyg.helper.closeModal('#' + modalId, '#link-tmp-' + wysiwygId);
        },
        addAudio: function(modalId, wysiwygId)
        {
            let modalData = document.forms['modalForm'];

            if(modalData.url.value){
                let linkTitle = wysiwyg.translate('wysiwyg.default.value.audio');
                let linkHref = modalData.url.value;

                if(modalData.title.value){
                    linkTitle = modalData.title.value;
                }

                let linkContent = '<br>\n<audio controls class="audio-content-inserted" title="' + linkTitle + '">' +
                    '<source src="' + linkHref + '">' + linkTitle + '</audio><br>\n';

                this.addLink(modalId, wysiwygId, linkContent);
            }
        },
        addImage: function(modalId, wysiwygId)
        {
            let modalData = document.forms['modalForm'];

            if(modalData.url.value){
                let linkTitle = wysiwyg.translate('wysiwyg.default.value.image');
                let linkHref = modalData.url.value;

                if(modalData.title.value){
                    linkTitle = modalData.title.value;
                }

                let linkContent = '<br>\n<img class="image-content-inserted" src="' + linkHref + '" title="' + linkTitle + '"  alt="' + linkTitle + '"/><br>\n';

                this.addLink(modalId, wysiwygId, linkContent);
            }
        },
        addVideo: function(modalId, wysiwygId)
        {
            let modalData = document.forms['modalForm'];

            if(modalData.url.value){
                let linkTitle = wysiwyg.translate('wysiwyg.default.value.video');
                let linkHref = modalData.url.value;

                if(modalData.title.value){
                    linkTitle = modalData.title.value;
                }

                let linkContent = '<br>\n<video controls class="video-content-inserted" title="' + linkTitle + '" width="320" height="240">' +
                    '<source src="' + linkHref + '">' + linkTitle + '</video><br>\n';

                this.addLink(modalId, wysiwygId, linkContent);
            }
        },
        addFile: function(modalId, wysiwygId)
        {
            wysiwyg.helper.addLink(modalId, wysiwygId);
        },
        openModal: function(button, success, textContent)
        {
            let wysiwygEditor = wysiwyg.getEditor(button);
            let wysiwygId = wysiwygEditor.id;
            let modalId = 'tmp-pop-up-modal-' + wysiwygId;

            if(!wysiwyg.defined(button.title) && wysiwyg.defined(button.dataset.title)){
                button.title = button.dataset.title;
            }

            wysiwyg.insertHtml(button, 'insertHtml', '<span class="tmp-lik-for-wysiwyg-editor" id="link-tmp-' + wysiwygId + '"></span>');

            let modalPopUp =
                '<div class="pop-up modal-pop-up">' +
                    '<div class="modal-header">' +
                        '<h2 class="header-value">' + button.title + '</h2>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<form name="modalForm">' +
                            '<div class="input">' +
                                '<input name="title" type="text" value="' + textContent + '" placeholder="' + wysiwyg.translate('input.title.placeholder') + '">' +
                            '</div>' +
                            '<div class="input">' +
                                '<input required="required" name="url" type="url" placeholder="' + wysiwyg.translate('input.href.placeholder') + '">' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<div class="buttons">' +
                            '<button class="button success" onclick="(' + success + ')(\'' + modalId + '\', \'' + wysiwygId + '\')">✔</button>' +
                            '<button class="button danger" onclick="wysiwyg.helper.closeModal(\'#' + modalId + '\', \'#link-tmp-' + wysiwygId + '\')">✖</button>' +
                        '</div>\n' +
                    '</div>' +
                '</div>';

            let modalPopUpInput = document.createElement('div');
            modalPopUpInput.classList.add('modal-pop-up-window');
            modalPopUpInput.id = modalId;
            modalPopUpInput.innerHTML = modalPopUp;

            document.body.appendChild(modalPopUpInput);

            let modalTitleField = document.querySelector('.modal-pop-up .modal-body input[name="title"]');
            if(wysiwyg.defined(modalTitleField)){
                modalTitleField.focus();
            }
        },
        closeModal: function(selector, tmpLinkId = null)
        {
            if(tmpLinkId){
                let tmpLink = document.querySelector(tmpLinkId);
                if(wysiwyg.defined(tmpLink)){
                    tmpLink.remove();
                }
            }

            let modal = document.querySelector(selector);
            if(wysiwyg.defined(modal)){
                document.body.removeChild(modal);
                return true;
            }
            return false;
        }
    },
    translate: function(key)
    {
        return wysiwyg.defined(this.langs[key]) ? this.langs[key]: key;
    },
    defined: function(val)
    {
        return val !== null && val !== undefined && val !== '';
    },
    makeEvent: function(element, eventName, eventType = null)
    {
        eventType = eventType ? eventType : eventName;

        let event;
        if(document.createEvent){
            event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
            event.eventName = eventName;
            element.dispatchEvent(event);
        } else {
            event = document.createEventObject();
            event.eventName = eventName;
            event.eventType = eventType;
            element.fireEvent(event.eventType, event);
        }
    }
};

document.addEventListener('click', function(event){
    if(event.ctrlKey){ return; }

    if(event.target.classList.contains('pop-up-image')){
        wysiwyg.showPopUp(event.target.closest('.with-pop-up'));
    }else
    if(event.target.classList.contains('with-pop-up')){
        wysiwyg.showPopUp(event.target);
    }else{
        wysiwyg.closeAllPopups();
    }
});

document.addEventListener('keydown', function(event){
    if(event.key === 'Escape'){
        wysiwyg.helper.closeModal('.modal-pop-up-window', '.tmp-lik-for-wysiwyg-editor');
        wysiwyg.closeAllPopups();
    }
});















