import React, {useState, useCallback, useRef} from 'react';
import {Draft} from 'immer';

import {Button} from '@condict/ui';
import {
  InflectionTable,
  InflectedFormJson,
  DefinitionTable,
} from '@condict/table-editor';
import {tokenizePattern, normalizeStem} from '@condict/inflect';

import InflectionTableEditorDemo from './inflection-table-editor';
import DefinitionTableEditorDemo from './definition-table-editor';
import InflectionTableData from './inflection-table-data.json';
import {HistoryStack} from './history-stack';

const InitialInflectionTableValue = HistoryStack.create(
  InflectionTable.fromJson(InflectionTableData)
);

const InitialDefinitionTableValue = HistoryStack.create(
  DefinitionTable.fromJson(
    InflectionTableData,
    // Custom forms:
    new Map([
      [6, 'nerkuar'],
      [12, ''],
    ])
  )
);

const InitialTerm = 'nerku';

const InitialStems: ReadonlyMap<string, string> = new Map([
  ['Plural root', 'nerk'],
]);

const InitialStemNames: readonly string[] = ['~', 'Plural root'];

// Logic taken from the server-side code.
const collectStemNames = (pattern: string, stems: Set<string>) => {
  for (const token of tokenizePattern(pattern)) {
    if (token.kind === 'placeholder') {
      stems.add(normalizeStem(token.stem));
    }
  }
};

// Naughty hack to get an ID for "new" inflected forms, when exporting the
// inflection table to the DefinitionTableEditor.
let nextFormId = 1000;

const Main = (): JSX.Element => {
  const [inflectionTable, setInflectionTable] = useState(
    InitialInflectionTableValue
  );
  const [definitionTable, setDefinitionTable] = useState(
    InitialDefinitionTableValue
  );
  const [term, setTerm] = useState(InitialTerm);
  const [stems, setStems] = useState(InitialStems);
  const [stemNames, setStemNames] = useState(InitialStemNames);

  const inflectionTableRef = useRef(inflectionTable.value);
  inflectionTableRef.current = inflectionTable.value;
  const copyLayout = useCallback(() => {
    const inflectionTable = inflectionTableRef.current;

    const stemNames = new Set<string>();
    const inflectionTableData = InflectionTable.export(inflectionTable);
    inflectionTableData.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.inflectedForm) {
          collectStemNames(cell.inflectedForm.inflectionPattern, stemNames);

          if (cell.inflectedForm.id === null) {
            // Naughty hack.
            (cell.inflectedForm as Draft<InflectedFormJson>).id = nextFormId;
            nextFormId++;
          }
        }
      });
    });
    // eslint-disable-next-line no-console
    console.log('Inflection table data = ', inflectionTableData);

    const definitionTableData = DefinitionTable.exportCustomForms(
      definitionTable.value
    );
    // eslint-disable-next-line no-console
    console.log('Definition table data = ', definitionTableData);

    setStemNames(Array.from(stemNames));
    setDefinitionTable(dt => HistoryStack.push(
      dt,
      DefinitionTable.fromJson(inflectionTableData, definitionTableData)
    ));
  }, [definitionTable]);

  return (
    <section>
      <h2>InflectionTableEditor</h2>
      <InflectionTableEditorDemo
        value={inflectionTable}
        onChange={setInflectionTable}
      />

      <p>
        <Button intent='accent' onClick={copyLayout}>
          &darr; Copy layout to definition table
        </Button>
      </p>

      <h2>DefinitionTableEditor</h2>
      <DefinitionTableEditorDemo
        value={definitionTable}
        term={term}
        stems={stems}
        stemNames={stemNames}
        onChange={setDefinitionTable}
        onChangeTerm={setTerm}
        onChangeStems={setStems}
      />
    </section>
  );
};

export default Main;
