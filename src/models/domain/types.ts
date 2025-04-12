export interface Serializable {
  id: string
  toJSON(): string
  toObject(): Record<string, unknown>
}
