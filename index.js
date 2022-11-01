'use strict';

const allRules = {
    'no-unused-style': require('./lib/rules/no-unused-style')
}

module.exports = {
    rules: allRules,
    rulesConfig: {
        'no-unused-style': 0
    },
    environments: {
        'react-native': {
            globals: require('eslint-plugin-react-native-globals').environments.all.globals
        }
    },
    configs: {
        all: {
            plugins: [
                'react-native'
            ],
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            rules: allRules
        }
    }
}
