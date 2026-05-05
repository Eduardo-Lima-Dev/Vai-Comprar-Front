const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('Variavel de ambiente VITE_API_BASE_URL nao foi definida.')
}

export const env = {
  apiBaseUrl,
}
