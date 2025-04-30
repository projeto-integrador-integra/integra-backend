import { MAX_PROJECTS_PER_USER } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { ProjectRepository } from '@/repositories/project.repository'

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async register(data: Project): Promise<Project> {
    const existingProject = await this.projectRepository.findSimilarProject({
      userId: data.creatorId,
      title: data.name,
    })
    if (existingProject.length > 0)
      throw new AppError('Project already exists', 409, 'PROJECT_ALREADY_EXISTS')

    const userProjects = await this.projectRepository.listProjects({ createdBy: data.creatorId })
    if (userProjects.total >= MAX_PROJECTS_PER_USER)
      throw new AppError('User already has 3 projects', 409, 'USER_PROJECT_LIMIT_REACHED')

    const newProject = await this.projectRepository.create(data)
    return newProject
  }
}
