import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMarkdownText, validatePlainText } from '../src/index.js';

test('TXT preserves headings, nested and task lists, quotations, links and figures', () => {
  const markdown =
    '# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six\n\n**strong** *emphasis* `inline` ~~removed~~\n\n> quote\n>\n> second paragraph\n\n3. first\n4. second\n\n- [x] done\n- [ ] pending\n  - nested\n\n- paragraph\n\n  another paragraph\n\n[Website](https://example.com "Title")\n\n<https://example.com>\n\n![Caption](local.png) ![](empty.png)\n\n[Reference][ref] ![Reference image][ref]\n\n[ref]: https://example.org "Reference title"\n\n---\n\nline  \nbreak\n';
  const text = renderMarkdownText(markdown);
  for (const expected of [
    'One\n===',
    'Two\n---',
    'Three\n~~~~~',
    'Four\n^^^^',
    'Five\n""""',
    "Six\n'''",
    'strong emphasis inline [Deleted: removed]',
    '3. first\n4. second',
    '- [x] done',
    '- [ ] pending',
    '  - nested',
    'quote\n\nsecond paragraph',
    'Website: https://example.com (Title)',
    '[Figure: Caption]: local.png',
    '[Figure: Uncaptioned image]: empty.png',
    'Reference: https://example.org (Reference title)',
    '[Figure: Reference image]: https://example.org (Reference title)',
    '--------------------',
    'line\nbreak',
  ])
    assert.ok(text.includes(expected), expected);
  assert.deepEqual(validatePlainText(Buffer.from(text)), []);
  assert.equal(
    renderMarkdownText('[Visible](https://hidden.invalid)', { includeLinkDestinations: false }),
    'Visible\n',
  );
  assert.match(
    renderMarkdownText('~~old~~ ![](empty.png)', { language: 'fr' }),
    /Supprimé: old.*Image sans légende/s,
  );
  assert.equal(renderMarkdownText('• item'), '- item\n');
  assert.throws(
    () => renderMarkdownText('<div>unsafe</div>'),
    /Unsupported TXT source block: html/,
  );
});

test('TXT localizes code labels and selects readable table layouts', () => {
  for (const language of ['en', 'fr'] as const) {
    for (const documentCodeLabels of [true, false]) {
      const text = renderMarkdownText(
        '```mermaid\nflowchart LR\n A --> B\n```\n\n```ts\nconst x = 1;\n```\n\n```\nplain\n```',
        { language, documentCodeLabels },
      );
      assert.ok(
        text.includes(
          language === 'fr'
            ? documentCodeLabels
              ? 'Source du diagramme Mermaid'
              : 'Source du diagramme (Mermaid) :'
            : documentCodeLabels
              ? 'Mermaid diagram source'
              : 'Diagram source (Mermaid):',
        ),
      );
      assert.ok(text.includes(documentCodeLabels ? 'Code - ts' : 'Code (ts):'));
      assert.ok(text.includes(documentCodeLabels ? 'Code\nplain' : 'Code:\nplain'));
    }
  }
  const compact = '| Name | Count |\n| --- | --- |\n| Ada | 2 |';
  assert.equal(renderMarkdownText(compact), 'Name  Count\n----  -----\nAda   2\n');
  assert.equal(renderMarkdownText(compact, { documentTableText: true }), 'Name Count\nAda 2\n');
  const wide = '| | Detail |\n| --- | --- |\n| row | ' + 'x'.repeat(101) + ' |';
  assert.match(renderMarkdownText(wide), /Column 1: row\nDetail: x/);
  assert.match(renderMarkdownText(wide, { language: 'fr' }), /Colonne 1: row/);
});

test('plain-text validation reports encoding, content and line-ending defects independently', () => {
  assert.deepEqual(validatePlainText(Uint8Array.of(0xff)), ['TXT must be valid UTF-8.']);
  assert.deepEqual(validatePlainText(Buffer.from('')), [
    'TXT must be non-empty.',
    'TXT must end with a newline.',
  ]);
  assert.deepEqual(validatePlainText(Buffer.from(' \n')), ['TXT must be non-empty.']);
  assert.deepEqual(validatePlainText(Buffer.from('x\0\r')), [
    'TXT must contain no NUL bytes.',
    'TXT must use LF line endings.',
    'TXT must end with a newline.',
  ]);
  assert.deepEqual(validatePlainText(Buffer.from('valid\n')), []);
});
