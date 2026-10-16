'use client'

import { useId, useState } from 'react'
import { useUpdateProfile } from '@/hooks/use-update-profile'
import { notify } from '@/lib/notify'
import type { User } from '@/types/user'

const NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u

function validateName(value: string, label: string, required: boolean): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return required ? `${label} is required.` : null
  }
  if (trimmed.length > 50) {
    return `${label} must be 50 characters or fewer.`
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return `${label} contains invalid characters.`
  }
  return null
}

export function ProfileForm({ user }: { user: User }) {
  const formId = useId()
  const { mutate, isPending } = useUpdateProfile()

  const [firstName, setFirstName] = useState(user.firstName ?? '')
  const [lastName, setLastName] = useState(user.lastName ?? '')
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({})
  const [savedName, setSavedName] = useState(
    [user.firstName, user.lastName].filter(Boolean).join(' ')
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = {
      firstName: validateName(firstName, 'First name', true) ?? undefined,
      lastName: validateName(lastName, 'Last name', false) ?? undefined,
    }
    setErrors(nextErrors)
    if (nextErrors.firstName || nextErrors.lastName) return

    mutate(
      {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      },
      {
        onSuccess: () => {
          setSavedName([firstName.trim(), lastName.trim()].filter(Boolean).join(' '))
          notify.success('Profile updated')
        },
        onError: () => {
          notify.error('Could not save your changes. Please try again.')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">
      <p className="text-xs text-gray-500">
        Currently saved as <span className="font-medium text-gray-700">{savedName || '—'}</span>.
      </p>

      <div className="space-y-1">
        <label htmlFor={`${formId}-firstName`} className="block text-sm font-medium text-gray-700">
          First name
        </label>
        <input
          id={`${formId}-firstName`}
          name="firstName"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? `${formId}-firstName-error` : undefined}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
        />
        {errors.firstName && (
          <p id={`${formId}-firstName-error`} role="alert" className="text-xs text-red-600">
            {errors.firstName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor={`${formId}-lastName`} className="block text-sm font-medium text-gray-700">
          Last name
        </label>
        <input
          id={`${formId}-lastName`}
          name="lastName"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          disabled={isPending}
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? `${formId}-lastName-error` : undefined}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
        />
        {errors.lastName && (
          <p id={`${formId}-lastName-error`} role="alert" className="text-xs text-red-600">
            {errors.lastName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor={`${formId}-email`} className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id={`${formId}-email`}
          name="email"
          type="email"
          value={user.email}
          readOnly
          aria-describedby={`${formId}-email-help`}
          className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
        />
        <p id={`${formId}-email-help`} className="text-xs text-gray-500">
          Contact support to change your email address.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
