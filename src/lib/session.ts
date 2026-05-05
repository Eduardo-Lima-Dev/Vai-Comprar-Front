const TOKEN_KEY = 'vai-comprar:token'

export function getSessionToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setSessionToken(token: string): void {
  const normalizedToken = token.replace(/^Bearer\s+/i, '').trim()
  if (!normalizedToken) {
    throw new Error('Token de sessao invalido.')
  }
  sessionStorage.setItem(TOKEN_KEY, normalizedToken)
}

export function clearSessionToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}
