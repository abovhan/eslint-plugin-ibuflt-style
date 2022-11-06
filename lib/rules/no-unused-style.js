'use strict'

const detectFuncNames = ['IBUDynamicStyleSheet']
const validFuncOfCall = ['FunctionExpression', 'ArrowFunctionExpression'];
const isFuncArgvOfCall = (funcName) => validFuncOfCall.includes(funcName);
const last = (arr) => arr[arr.length - 1];
const getStyleContent = (body) => {
    if(body.type === 'ObjectExpression') {
        return body.properties.filter(property => property.type === 'Property') ?? [];
    }
    if(body.type === 'BlockStatement' && last(body?.body).type === 'ReturnStatement') {
        return last(body?.body)?.argument?.properties?.filter(property => property.type === 'Property') ?? [];
    }
}
const getMemberExp = (node) => {
    if(node?.object?.object) return null;
    if(node.object && node.property) return [node.object.name, node.property.name].join('-');
    return null;
}

const create = function(context) {
    const styles = new Map();
    const memberExps = new Set();
    const varDecExps = new Set();
    const useStyleWithCall = new Set();

    const reportUnusedStyle = () => {
        for (const [caller, nodes] of styles) {
            for (const node of nodes) {
                const messages = [
                    'Ibuflt unused style detected: ',
                    caller,
                    '.',
                    node.key?.name,
                ].join('')
                context.report(node, messages, (fixer) => fixer.remove(node));
            }
        }
    }

    return {
        Program(){
            styles.clear();
            memberExps.clear();
            varDecExps.clear();
            useStyleWithCall.clear();
        },
        CallExpression(node) {
            const calleeName = node.callee.name;
            if(detectFuncNames.concat(context.settings['ibuflt-style/style-sheet-object-names'] ?? null).includes(calleeName)) {
                if(isFuncArgvOfCall(node.arguments[0].type)) {
                    const varName = node.parent.id?.name;
                    if(varName) {
                        styles.set(varName, getStyleContent(node.arguments[0].body));
                    }
                }
            }
        },
        MemberExpression(node) {
            const exp = getMemberExp(node);
            !!exp && memberExps.add(exp);

            if(node.object.type === 'CallExpression') {
                useStyleWithCall.add([node.object.callee.name, node.property.name].join('-'));
            }
        },
        VariableDeclarator(node) {
            const idName = node.id.name;
            const initName = node.init?.callee?.name;
            if(!!idName && !!initName) {
                varDecExps.add([idName, initName].join('-'));
            }
        },
        'Program:exit'() {
            for(const exp of useStyleWithCall) {
                const [caller, callee] = exp.split('-');
                if(styles.has(caller)) {
                    styles.set(caller, styles.get(caller).filter(style => style.key.name !== callee));
                }
            }

            for (const varDec of varDecExps) {
                const [idName, initName] = varDec.split('-');
                if(styles.has(initName)) {
                    const style = styles.get(initName);
                    styles.delete(initName);
                    styles.set(idName, style);
                }
            }
            for (const exp of memberExps) {
                const [caller, callee] = exp.split('-');
                if(!!caller && !!callee && styles.has(caller)) {
                    styles.set(caller, styles.get(caller).filter(style => style.key.name !== callee));
                }
            }
            reportUnusedStyle();
        }
    }
}

module.exports = {
    meta: {
        schema: []
    },
    create
}