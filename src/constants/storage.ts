export const LAST_ROOM_SLUG_KEY = 'vai-comprar:last-room-slug'

export function shoppingSessionStorageKey(roomSlug: string) {
  return `vai-comprar:shopping:${roomSlug}`
}
