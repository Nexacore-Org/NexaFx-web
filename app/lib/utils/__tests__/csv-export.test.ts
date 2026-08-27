import { exportTransactionsToCSV } from '../csv-export';
import type { Transaction } from '@/lib/api/transactions';

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    type: 'Deposit',
    currency: 'NGN',
    amount: 1000,
    amountString: '1000',
    date: '2026-01-15T10:30:00.000Z',
    status: 'Success',
    reference: 'REF-1',
    description: 'Test deposit',
    ...overrides,
  };
}

describe('exportTransactionsToCSV', () => {
  let capturedContent: string;
  let originalBlob: typeof Blob;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    capturedContent = '';
    originalBlob = global.Blob;
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;

    // exportTransactionsToCSV builds the CSV string and immediately hands it
    // to `new Blob([csvContent], ...)` to trigger a browser download — there
    // is no return value to assert against, so capture the content at the
    // Blob boundary instead.
    global.Blob = jest.fn().mockImplementation((parts: string[]) => {
      capturedContent = parts.join('');
      return {};
    }) as unknown as typeof Blob;

    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    global.Blob = originalBlob;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  it('produces a valid, header-only CSV for an empty dataset', () => {
    exportTransactionsToCSV([]);

    const lines = capturedContent.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(
      '"Date","Type","Currency","Amount","Status","Reference","Description"',
    );
  });

  it('escapes commas, quotes, and newlines in field values', () => {
    const transaction = makeTransaction({
      description: 'Note, with "quotes" and\nan embedded newline',
    });

    exportTransactionsToCSV([transaction]);

    const lines = capturedContent.split('\n');
    expect(lines[0]).toBe(
      '"Date","Type","Currency","Amount","Status","Reference","Description"',
    );

    // Every field is always wrapped in quotes and embedded quotes are
    // doubled, so the comma and the raw newline inside the description
    // stay safely inside its one quoted field instead of breaking the row
    // into extra fields/lines. Slice past the header rather than splitting
    // on '\n' again, since the embedded newline would otherwise be
    // mistaken for a new CSV row boundary.
    const dataPortion = capturedContent.slice(lines[0].length + 1);
    expect(dataPortion.startsWith('"')).toBe(true);
    expect(dataPortion).toContain('"NGN"');
    expect(dataPortion).toContain('"1000"');
    expect(dataPortion).toContain('"REF-1"');
    expect(dataPortion).toContain(
      '"Note, with ""quotes"" and\nan embedded newline"',
    );
  });

  it('correctly renders a realistically large number of rows without truncation', () => {
    const rowCount = 5000;
    const transactions = Array.from({ length: rowCount }, (_, i) =>
      makeTransaction({
        id: `tx-${i}`,
        reference: `REF-${i}`,
        amount: i,
        amountString: String(i),
      }),
    );

    const started = Date.now();
    exportTransactionsToCSV(transactions);
    const elapsed = Date.now() - started;

    const lines = capturedContent.split('\n');
    expect(lines).toHaveLength(rowCount + 1); // header + one line per row
    expect(lines[1]).toContain('"REF-0"');
    expect(lines[rowCount]).toContain(`"REF-${rowCount - 1}"`);
    expect(elapsed).toBeLessThan(5000);
  });
});
