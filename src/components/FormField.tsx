import { useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string
  error?: string
  multiline?: boolean
}

export function FormField({ name, label, error, multiline, ...rest }: Props) {
  const id = useId()
  const errId = `${id}-err`
  const common = {
    id,
    name,
    className: 'field-input',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errId : undefined,
  } as const
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea {...common} rows={3} placeholder={rest.placeholder} className="field-input resize-none" />
      ) : (
        <input {...rest} {...common} />
      )}
      {error && (
        <p id={errId} className="mt-1.5 text-[13px] font-medium text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
