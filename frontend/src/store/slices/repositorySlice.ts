import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Repository {
  id: string
  name: string
  description?: string
  url: string
  localPath: string
  isPrivate: boolean
  lastUpdated: string
  branchCount: number
  commitCount: number
}

interface RepositoryState {
  repositories: Repository[]
  currentRepository: Repository | null
  loading: boolean
  error: string | null
}

const initialState: RepositoryState = {
  repositories: [],
  currentRepository: null,
  loading: false,
  error: null,
}

const repositorySlice = createSlice({
  name: 'repository',
  initialState,
  reducers: {
    fetchRepositoriesStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchRepositoriesSuccess: (state, action: PayloadAction<Repository[]>) => {
      state.repositories = action.payload
      state.loading = false
    },
    fetchRepositoriesFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    setCurrentRepository: (state, action: PayloadAction<Repository>) => {
      state.currentRepository = action.payload
    },
    addRepository: (state, action: PayloadAction<Repository>) => {
      state.repositories.push(action.payload)
    },
    removeRepository: (state, action: PayloadAction<string>) => {
      state.repositories = state.repositories.filter(repo => repo.id !== action.payload)
    },
    updateRepository: (state, action: PayloadAction<Repository>) => {
      const index = state.repositories.findIndex(repo => repo.id === action.payload.id)
      if (index !== -1) {
        state.repositories[index] = action.payload
      }
    },
  },
})

export const {
  fetchRepositoriesStart,
  fetchRepositoriesSuccess,
  fetchRepositoriesFailure,
  setCurrentRepository,
  addRepository,
  removeRepository,
  updateRepository,
} = repositorySlice.actions

export default repositorySlice.reducer