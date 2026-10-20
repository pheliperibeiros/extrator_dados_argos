import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENTIDADES_COLUMNS,
  CASO_COLUMNS,
  formatDocumento,
  formatDataNascimento,
  normalizeTags,
  sanitizeEntidadeRow,
  sanitizeCasoRow,
  generateEntidadesCSV,
  generateCasoCSV,
} from './rules.ts';

test('formatDocumento formats valid CPF to nnn.nnn.nnn-nn', () => {
  assert.equal(formatDocumento('12345678901'), '123.456.789-01');
  assert.equal(formatDocumento('123.456.789-01'), '123.456.789-01');
  assert.equal(formatDocumento('12345678901234', 'PJ'), '12.345.678/9012-34');
});

test('formatDataNascimento formats ISO and Brazilian dates to dd/mm/aaaa', () => {
  assert.equal(formatDataNascimento('1985-04-12'), '12/04/1985');
  assert.equal(formatDataNascimento('5/3/1990'), '05/03/1990');
  assert.equal(formatDataNascimento('15/08/1992'), '15/08/1992');
});

test('normalizeTags formats tags according to standard crime slugs', () => {
  const input = 'Organização Criminosa, Tráfico de Drogas; Lavagem de Capitais';
  const expected = 'organização-criminosa, tráfico-de-drogas, lavagem-de-capitais';
  assert.equal(normalizeTags(input), expected);
});

test('sanitizeEntidadeRow enforces required blank Vinculos column', () => {
  const sanitized = sanitizeEntidadeRow({
    Nome: 'Carlos Eduardo',
    Documento: '11122233344',
    Vinculos: 'Membro antigo', // Deve ser forçado a vazio
    Papel: 'Liderança',
  });
  assert.equal(sanitized.Vinculos, '');
  assert.equal(sanitized.Documento, '111.222.333-44');
  assert.equal(sanitized.Papel, 'Liderança');
});

test('sanitizeCasoRow enforces required blank columns: Status, Numero_Eproc, Data_Criacao, Criado_Por', () => {
  const sanitized = sanitizeCasoRow({
    Tipo: 'PIC',
    Status: 'Ativo', // deve ser forçado a vazio
    Numero_Eproc: '5001234', // deve ser forçado a vazio
    Numero_IntegrarE: 'MP-2024-9988',
    Tags: 'tráfico-de-drogas',
    Data_Criacao: '2024-01-01', // deve ser forçado a vazio
    Criado_Por: 'Promotor A', // deve ser forçado a vazio
    Eproc_Investigacao: '5001234-88.2024.8.27.2700',
    Codinome: 'Operação Tempestade',
  });

  assert.equal(sanitized.Status, '');
  assert.equal(sanitized.Numero_Eproc, '');
  assert.equal(sanitized.Data_Criacao, '');
  assert.equal(sanitized.Criado_Por, '');
  assert.equal(sanitized.Codinome, 'Operação Tempestade');
  assert.equal(sanitized.Numero_IntegrarE, 'MP-2024-9988');
});

test('ENTIDADES_COLUMNS has exact 17 columns in correct order', () => {
  const expected = [
    'Tipo_Entidade',
    'Nome',
    'Documento',
    'Faccao',
    'Vinculos',
    'Vulgo',
    'Nascimento',
    'Nome_Pai',
    'Nome_Mae',
    'Papel',
    'Observacoes',
    'Razao_Social',
    'Abertura',
    'Situacao',
    'Capital_Social',
    'Enderecos',
    'Socios',
  ];
  assert.deepEqual(ENTIDADES_COLUMNS, expected);
});

test('CASO_COLUMNS has exact 9 columns in correct order', () => {
  const expected = [
    'Tipo',
    'Status',
    'Numero_Eproc',
    'Numero_IntegrarE',
    'Tags',
    'Data_Criacao',
    'Criado_Por',
    'Eproc_Investigacao',
    'Codinome',
  ];
  assert.deepEqual(CASO_COLUMNS, expected);
});

test('generateEntidadesCSV and generateCasoCSV generate properly formatted CSV headers', () => {
  const entidades = [sanitizeEntidadeRow({ Nome: 'Alvo 1' })];
  const csvEnt = generateEntidadesCSV(entidades);
  assert.match(csvEnt, /^Tipo_Entidade;Nome;Documento;Faccao;Vinculos/);

  const caso = sanitizeCasoRow({ Codinome: 'Operação Raio' });
  const csvCaso = generateCasoCSV(caso);
  assert.match(csvCaso, /^Tipo;Status;Numero_Eproc;Numero_IntegrarE;Tags/);
});
