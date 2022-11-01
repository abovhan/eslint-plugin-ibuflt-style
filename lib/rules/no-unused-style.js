'use strict'

const {codeFrameColumns} = require('@babel/code-frame');

const detectFuncNames = ['IBUDynamicStyleSheet']
const validFuncOfCall = ['FunctionExpression', 'ArrowFunctionExpression'];
const isFuncArgvOfCall = (funcName) => validFuncOfCall.includes(funcName);
const getStyleContent = (properties) => properties.filter(property => property.type === 'Property');
const getMemberExp = (node) => {
    if(node?.object?.object) return null;
    if(node.object && node.property) return [node.object.name, node.property.name].join('-');
    return null;
}

const create = function(context) {
    const styles = new Map();
    const memberExps = new Set();
    const varDecExps = new Set();

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
        },
        CallExpression(node) {
            const calleeName = node.callee.name;
            if(detectFuncNames.concat(context.settings['style-sheet-name']).includes(calleeName)) {
                if(isFuncArgvOfCall(node.arguments[0].type)) {
                    const varName = node.parent.id?.name;
                    if(varName) {
                        styles.set(varName, getStyleContent(node.arguments[0].body.properties));
                    }
                }
            }
        },
        MemberExpression(node) {
            const exp = getMemberExp(node);
            !!exp && memberExps.add(exp);
        },
        VariableDeclarator(node) {
            const idName = node.id.name;
            const initName = node.init?.callee?.name;
            if(!!idName && !!initName) {
                varDecExps.add([idName, initName].join('-'));
            }
        },
        'Program:exit'() {
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