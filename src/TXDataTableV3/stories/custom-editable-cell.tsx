// custom-editable-columns.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { DUMMY_DATA_SOURCE } from '../data';
import type { ColumnSettings } from '../interfaces';
import { Actions } from '../interfaces';

function AutoFocusInput({
  inputRef,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { inputRef?: any }) {
  const localRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef?.current?.setFocus) inputRef.current.setFocus();
    else if (inputRef?.current?.focus) inputRef.current.focus();
    else localRef.current?.focus?.();
  }, [inputRef]);
  return <input ref={localRef} {...rest} />;
}

const ErrorText = ({ error }: { error?: string | null }) =>
  error ? <div style={{ color: 'var(--color-danger)', fontSize: 12 }}>{error}</div> : null;

export default function CustomEditableColumnsDemo() {
  // Seed a small sample with custom fields to play with
  const data = useMemo(
    () =>
      DUMMY_DATA_SOURCE.slice(0, 20).map((r: any, i: number) => ({
        ...r,
        customText: r.customText ?? (i % 2 === 0 ? `note ${i}` : ''),
        rating: r.rating ?? ((i % 5) + 1),
        customSelect: r.customSelect ?? (i % 3 === 0 ? 'A' : 'B'),
        uniqueCode: r.uniqueCode ?? (i < 2 ? 'DUP' : `U-${i}`),
      })),
    []
  );

  const columns: ColumnSettings[] = [
    { title: 'ID', column: 'id', width: 140 },
    { title: 'Name (read-only baseline)', column: 'text', width: 220, actionConfig: false },

    // 1) Custom Text — staged typing, commit on blur/Enter, validation + schema
    {
      title: 'Custom Text (stage→commit)',
      column: 'customText',
      width: 260,
      actionConfig: {
        schema: { type: 'string', minLength: 3 },
        validation: (row) =>
          String(row.customText || '').includes('bad') ? 'No "bad" allowed' : undefined,
        render: ({ value = '', onChange, onCancel, inputRef, isInvalid, error, disabled }) => (
          <div style={{ display: 'grid', gap: 6 }}>
            <AutoFocusInput
              inputRef={inputRef}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange((e.target as HTMLInputElement).value)} // stage
              onKeyDown={(e) => {
                if (e.key === 'Enter') onChange((e.currentTarget as HTMLInputElement).value, { commit: true });
                if (e.key === 'Escape') onCancel();
              }}
              onBlur={(e) => onChange((e.currentTarget as HTMLInputElement).value, { commit: true })}
              placeholder="Type then Enter/Blur to commit"
              style={{
                padding: '6px 8px',
                border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-border, #ddd)'}`,
                borderRadius: 6,
                fontSize: 12,
                width: '100%',
              }}
            />
            <ErrorText error={error || undefined} />
          </div>
        ),
      },
    },

    // 2) Star rating — commit on click
    {
      title: 'Rating (★ commit-on-click)',
      column: 'rating',
      width: 200,
      actionConfig: {
        // optional: ensure a non-undefined default
        value: 0,
        render: ({ value, onChange, error }) => (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const n = i + 1;
              const filled = n <= (Number(value) || 0);
              return (
                <span
                  key={n}
                  role="button"
                  aria-label={`rate ${n}`}
                  onClick={() => {
                    // 1) stage the value so editingCells has it
                    onChange(n, { commit: false });
                    // 2) commit on next frame so validation reads the staged value
                    requestAnimationFrame(() => onChange(n, { commit: true }));
                  }}
                  style={{ cursor: 'pointer', fontSize: 18, userSelect: 'none' }}
                >
                  {filled ? '★' : '☆'}
                </span>
              );
            })}
            {error ? <span style={{ color: 'var(--color-danger)' }}>{error}</span> : null}
          </div>
        ),
        // keep your validation; cast defensively
        validation: (row) => (Number(row?.rating) > 0 ? undefined : 'pick at least 1 star'),
      },
    },

    // 3) Custom select — commit on change, disabled when row.level === 'level-1', uses rowValues in label
    {
      title: 'Custom Select (A/B/C)',
      column: 'customSelect',
      width: 220,
      actionConfig: {
        disabled: (row) => row?.level === 'level-1',
        render: ({ value = 'A', rowValues, onChange, onCancel, disabled }) => {
          const name =
            typeof rowValues?.text === 'string'
              ? rowValues.text
              : rowValues?.text?.value ?? 'n/a';
          return (
            <div onKeyDown={(e) => e.key === 'Escape' && onCancel()}>
              <select
                value={value}
                disabled={disabled}
                onChange={(e) => onChange((e.target as HTMLSelectElement).value, { commit: true })}
                style={{ padding: '6px 8px', borderRadius: 6, fontSize: 12 }}
              >
                <option value="A">A (name: {name})</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          );
        },
      },
    },

    // 4) Unique + schema — commit path triggers duplicate error
    {
      title: 'Unique Code',
      column: 'uniqueCode',
      width: 220,
      actionConfig: {
        isUnique: true,
        schema: { type: 'string', minLength: 2 },
        render: ({ value = '', onChange, onCancel, inputRef, isInvalid, error, disabled }) => (
          <div style={{ display: 'grid', gap: 6 }}>
            <AutoFocusInput
              inputRef={inputRef}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange((e.target as HTMLInputElement).value)} // stage
              onKeyDown={(e) => {
                if (e.key === 'Enter') onChange((e.currentTarget as HTMLInputElement).value, { commit: true });
                if (e.key === 'Escape') onCancel();
              }}
              onBlur={(e) => onChange((e.currentTarget as HTMLInputElement).value, { commit: true })}
              placeholder='Must be unique (try typing "DUP")'
              style={{
                padding: '6px 8px',
                border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-border, #ddd)'}`,
                borderRadius: 6,
                fontSize: 12,
                width: '100%',
              }}
            />
            <ErrorText error={error || undefined} />
          </div>
        ),
      },
    },

    // 5) Derived min length using rowValues.userID
    {
      title: 'Derived MinLen (from userID)',
      column: 'customText',
      width: 280,
      actionConfig: {
        render: ({ value = '', rowValues, onChange, onCancel, inputRef }) => {
          const tail = String(rowValues?.userID ?? '').slice(-1);
          const minLen = Math.max(3, Number(tail) || 3);
          const tooShort = String(value || '').length < minLen;
          return (
            <div style={{ display: 'grid', gap: 6 }}>
              <AutoFocusInput
                inputRef={inputRef}
                value={value}
                onChange={(e) => onChange((e.target as HTMLInputElement).value)} // stage
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onChange((e.currentTarget as HTMLInputElement).value, { commit: true });
                  if (e.key === 'Escape') onCancel();
                }}
                onBlur={(e) => onChange((e.currentTarget as HTMLInputElement).value, { commit: true })}
                placeholder={`Min ${minLen} chars (based on userID)`}
                style={{
                  padding: '6px 8px',
                  border: `1px solid ${tooShort ? 'var(--color-danger)' : 'var(--color-border, #ddd)'}`,
                  borderRadius: 6,
                  fontSize: 12,
                  width: '100%',
                }}
              />
              {tooShort && <ErrorText error={`Enter at least ${minLen} characters`} />}
            </div>
          );
        },
      },
    },

    // 6) Cancel flow — ESC discards staged value (no commit)
    {
      title: 'Cancelable Text (ESC discards)',
      column: 'customText',
      width: 260,
      actionConfig: {
        render: ({ value = '', onChange, onCancel, inputRef, disabled }) => (
          <AutoFocusInput
            inputRef={inputRef}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange((e.target as HTMLInputElement).value)} // stage
            onKeyDown={(e) => {
              if (e.key === 'Escape') onCancel();
              if (e.key === 'Enter') onChange((e.currentTarget as HTMLInputElement).value, { commit: true });
            }}
            onBlur={(e) => onChange((e.currentTarget as HTMLInputElement).value, { commit: true })}
            placeholder="ESC cancels, Enter/Blur commits"
            style={{ padding: '6px 8px', border: '1px solid var(--color-border, #ddd)', borderRadius: 6, fontSize: 12, width: '100%' }}
          />
        ),
      },
    },
  ];

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Single table showcasing multiple <b>custom editable cells</b> via <code>actionConfig.render(ctx)</code>.</p>
      <TXDataTable
        dataSource={data}
        columnSettings={columns}
        actions={[Actions.EDIT, Actions.ADD, Actions.DELETE]}
        rowKey="id"
        undoRedoCellEditing
        headerSearchSettings
      />
    </Container>
  );
}
