import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { apiClient } from '../api-client'

export const registerPasskey = async (): Promise<void> => {
  const challenge = await apiClient('/auth/webauthn/register/begin', { method: 'POST', useProxy: false })
  const credential = await startRegistration(challenge)
  await apiClient('/auth/webauthn/register/finish', { method: 'POST', useProxy: false, body: JSON.stringify(credential) })
}

export const authenticateWithPasskey = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const challenge = await apiClient('/auth/webauthn/authenticate/begin', { method: 'POST', useProxy: false })
  const credential = await startAuthentication(challenge)
  return apiClient('/auth/webauthn/authenticate/finish', { method: 'POST', useProxy: false, body: JSON.stringify(credential) })
}

export interface Passkey {
  id: string
  label: string
  createdAt: string
  lastUsedAt?: string
}

export const getPasskeys = (): Promise<Passkey[]> =>
  apiClient('/auth/webauthn/passkeys', { method: 'GET', useProxy: false })

export const deletePasskey = (id: string): Promise<void> =>
  apiClient(`/auth/webauthn/passkeys/${id}`, { method: 'DELETE', useProxy: false })
