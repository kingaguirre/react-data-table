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
      title: "Rating (custom stars)",
      column: "rating",
      width: 200,
      actionConfig: {
        value: 0,
        // keep your validation as-is
        validation: (row) => (Number(row?.rating) > 0 ? undefined : "pick at least 1 star"),
        render: ({ value, onChange, isInvalid, error, disabled }) => (
          <StarRatingEditor
            value={value}
            disabled={disabled}
            isInvalid={isInvalid}
            error={error || undefined}
            // IMPORTANT: commit on click; StarRatingEditor handles event ordering
            onChange={(n, opts) => onChange(n, { commit: opts?.commit ?? true })}
          />
        ),
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
  ];

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Single table showcasing multiple <b>custom editable cells</b> via <code>actionConfig.render(ctx)</code>.</p>
      <TXDataTable
        dataSource={data}
        columnSettings={columns}
        actions={[Actions.EDIT,Actions.DELETE]}
        rowKey='id'
        onChange={(value) => console.log('onChange: ', value)}
      />
    </Container>
  );
}

export type StarRatingEditorProps = {
  value: number | null | undefined;
  max?: number;
  disabled?: boolean;
  isInvalid?: boolean;
  error?: string | null;
  /** table’s render(ctx).onChange; must accept { commit?: boolean } */
  onChange: (next: number, opts?: { commit?: boolean }) => void;
};

export function StarRatingEditor({
  value,
  max = 5,
  disabled,
  isInvalid,
  error,
  onChange,
}: StarRatingEditorProps) {
  const current = Number.isFinite(value as number) ? Number(value) : 0;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div>
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const filled = n <= current;
          return (
            <span
              key={n}
              role="button"
              aria-label={`rate ${n}`}
              // CRITICAL: pointerDown fires before blur/click; preventDefault
              // so the parent cell doesn't lose focus/commit the old value.
              onPointerDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                e.stopPropagation();
                // Commit immediately; no need to stage first.
                onChange(n, { commit: true });
              }}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(n, { commit: true });
                }
              }}
              // Non-focusable element avoids focus transfer -> no blur
              tabIndex={-1}
              style={{
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: 18,
                lineHeight: 1,
                userSelect: "none",
                color: filled ? "currentColor" : "var(--color-border, #bbb)",
                marginRight: 2,
              }}
            >
              {filled ? "★" : "☆"}
            </span>
          );
        })}
      </div>
      {error ? <span style={{ color: "var(--color-danger)" }}>{error}</span> : null}
    </div>
  );
}
