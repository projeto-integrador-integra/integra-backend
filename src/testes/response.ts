import { Response } from 'express'
import { vi } from 'vitest'

export function createMockResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response
}
