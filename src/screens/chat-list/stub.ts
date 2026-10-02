export const STUB_EVENT = 'stub-sheet'

/** Opens the "not ready yet" bottom sheet; pass a title to describe the specific feature. */
export function showStub(title?: string) {
  window.dispatchEvent(new CustomEvent(STUB_EVENT, { detail: title }))
}
