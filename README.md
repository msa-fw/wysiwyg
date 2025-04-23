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
- `[buttonsPackage3]` массив кнопок, закодированный в JSON в формате

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

- метод `wysiwyg.addLang()` принимает ассоциативный массив языковых переводов, закодированный в JSON. Полный список в файле `lang.ru.js`

- `uniqueTextareaIdentifier` уникальный идентификатор для поля `textarea`, в которое будет дублироваться инфа из WYSIWYG-редактора
- `uniqueWysiwygIdentifier` - уникальный идентификатор для поля WYSIWYG-редактора (на одной странице может быть подключено неограниченное количество WYSIWYG-редакторов)

полный список кнопок находится в файле `buttons.json`


DEMO: https://msa-fw.github.io/wysiwyg/
