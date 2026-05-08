export function roomsCacheKey(userId: string) {
  return `vai-comprar:rooms-cache:${userId}`
}

export function shoppingSessionStorageKey(roomSlug: string) {
  return `vai-comprar:shopping:${roomSlug}`
}
