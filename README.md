WYSIWYG-редактор для сайта.

Настройка:

- инициализировать WYSIWYG

```
document.addEventListener('DOMContentLoaded', function(){
	wysiwyg.addKit('packageName', [buttonsPackage]);
	wysiwyg.addKit('packageName1', [buttonsPackage1]);
	wysiwyg.addKit('packageName2', [buttonsPackage2]);
	wysiwyg.addKit('packageName3', [buttonsPackage3]);
	... ...
	wysiwyg.addKit('packageNameN', [buttonsPackageN]);
	
	wysiwyg.addLang([languagePack]);
	
	wysiwyg.init('uniqueTextareaIdentifier', 'packageName');
	
	wysiwyg.run('uniqueWysiwygIdentifier');
});
```

где:
- метод `wysiwyg.addKit()` может установить несколько наборов кнопок
- `packageName`, `packageName1`, `packageName2`, `packageName3`, `packageNameN` - произвольная строка
- `[buttonsPackage]`, `[buttonsPackage1]`, `[buttonsPackage2]`, `[buttonsPackage3]`, `[buttonsPackageN]` - массив кнопок, закодированный в JSON в формате

пример кнопки:

```
[
	{
        "key": "fullScreen",
        "icon": "base64 data or link",
        "title": "развернуть на весь экран",
        "parentKey": ""
    },
]
```

полный список кнопок находится в файле `buttons.json`


- метод `wysiwyg.addLang()` принимает ассоциативный массив языковых переводов, закодированный в JSON. Полный список в файле `lang.ru.js`

- `uniqueTextareaIdentifier` уникальный идентификатор для поля `textarea`, в которое будет дублироваться инфа из WYSIWYG-редактора
- `uniqueWysiwygIdentifier` - уникальный идентификатор для поля WYSIWYG-редактора (на одной странице может быть подключено неограниченное количество WYSIWYG-редакторов)


DEMO: https://msa-fw.github.io/wysiwyg/

Добавлены события:

- `beforeWysiwygInitialized` - перехват до начала инициализации обьекта `wysiwyg`
- `afterWysiwygInitialized` - перехват после инициализации обьекта `wysiwyg`
- `onWysiwygInitialized` - когда обьект `wysiwyg` инициализирован
- `beforeWysiwygStart` - до начала рендера редактора
- `afterWysiwygStart` - после рендера редактора


Пример:
```
<script type="application/javascript">
    document.addEventListener('beforeWysiwygInitialized', function(e){
        wysiwyg.kits = {};                             // переопределить набор кнопок (в этом случае - очистить)

        wysiwyg.commands.header = function(button)     // переопределить метод `wysiwyg.commands.header()`
        {
            console.log(wysiwyg);
            if(button.querySelector('.pop-up')){ return; }
            return wysiwyg.commands.h1(button, 'h1');
        };
    });
</script>

<script type="application/javascript">
    document.addEventListener('DOMContentLoaded', function(){
        wysiwyg.addKit('def', '[buttons]');
        wysiwyg.addLang('[langs]');

        wysiwyg.init('#textareaId', 'def');
        wysiwyg.run('#contentEditableField_def div.content');
    });
</script>
```
