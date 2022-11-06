# eslint-plugin-ibuflt-style

- 支持扩展样式函数，通过在 .eslintrc.json 文件中定义  

```json
{
    "settings": {
        "ibuflt-style/style-sheet-object-names": ["mystyle"]
    },
}
```

```
// APP.tsx
export default function APP() {
    return {
        <View />
    }
}

const styleFunc = mystyle(() => ({
    add: {
        width: 1
    }
}))
```

- 支持的样式函数调用方式

```
const dynamicStyles = IBUDynamicStyleSheet(() => ({
    refreshControlContainer: {
        backgroundColor: 'transparent'
    }
}));
```

```
const dynamicStyles = IBUDynamicStyleSheet(() => {
    
    /**
    *
    * 其他代码
    */

    return {
        refreshControlContainer: {
            backgroundColor: 'transparent'
        }
    }
});
```

```
const dynamicStyles = IBUDynamicStyleSheet(function() {
    
    /**
    *
    * 其他代码
    */

    return {
        refreshControlContainer: {
            backgroundColor: 'transparent'
        }
    }
});
```
- 支持的样式使用方式  

```
class APP {
    render() {
        const style = dynamicStyles();
        return (
            <View style={style.refreshControlContainer}>
        )
    }
}
const dynamicStyles = IBUDynamicStyleSheet(() => ({
    refreshControlContainer: {
        backgroundColor: 'transparent'
    }
}));
```

```
class APP {
    render() {
        return (
            <View style={dynamicStyles().refreshControlContainer}>
        )
    }
}
const dynamicStyles = IBUDynamicStyleSheet(() => ({
    refreshControlContainer: {
        backgroundColor: 'transparent'
    }
}));
```