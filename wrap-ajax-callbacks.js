/**
 * Codemod para envolver callbacks success/error de $.ajax num try/catch
 * e chamar TratamentoErroComLinha(__scriptName, "ajax.<endpoint>.<callback>", error);
 */

// Usa o parser Flow do Babel para tolerar duplicação de funções, etc.
export const parser = 'flow';

export default function transformer(file, api)
{
    const j = api.jscodeshift;
    const root = j(file.source);

    // Encontra todas as chamadas $.ajax({...})
    root.find(j.CallExpression, {
        callee: {
            object: { name: '$' },
            property: { name: 'ajax' }
        }
    }).forEach(path =>
    {
        const opts = path.node.arguments[0];
        if (!opts || opts.type !== 'ObjectExpression') return;

        // Extrai o último segmento da URL pra nomear o callback
        let endpoint = 'unknown';
        const urlProp = opts.properties.find(p =>
            p.key &&
            ((p.key.type === 'Identifier' && p.key.name === 'url') ||
                (p.key.type === 'Literal' && p.key.value === 'url'))
        );
        if (urlProp && urlProp.value.type === 'Literal')
        {
            const segs = String(urlProp.value.value).split('/');
            endpoint = segs[segs.length - 1].replace(/\W+/g, '');
        }

        ['success', 'error'].forEach(cbName =>
        {
            const prop = opts.properties.find(p =>
                p.key &&
                ((p.key.type === 'Identifier' && p.key.name === cbName) ||
                    (p.key.type === 'Literal' && p.key.value === cbName))
            );
            if (!prop) return;

            const fn = prop.value;
            // somente FunctionExpression ou ArrowFunctionExpression
            if (
                fn.type === 'FunctionExpression' ||
                fn.type === 'ArrowFunctionExpression'
            )
            {
                // corpo original
                const originalStmts = fn.body.type === 'BlockStatement'
                    ? fn.body.body
                    : [j.returnStatement(fn.body)];

                // substitui o corpo por try/catch
                fn.body = j.blockStatement([
                    j.tryStatement(
                        j.blockStatement(originalStmts),
                        j.catchClause(
                            j.identifier('error'),
                            null,
                            j.blockStatement([
                                j.expressionStatement(
                                    j.callExpression(
                                        j.identifier('TratamentoErroComLinha'),
                                        [
                                            j.identifier('__scriptName'),
                                            j.literal(`ajax.${endpoint}.${cbName}`),
                                            j.identifier('error')
                                        ]
                                    )
                                )
                            ])
                        )
                    )
                ]);
            }
        });
    });

    return root.toSource({ quote: 'double' });
}
