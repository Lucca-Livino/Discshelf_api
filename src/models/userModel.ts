export interface UserPublic {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
}
