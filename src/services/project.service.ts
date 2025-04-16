import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { ProjectType } from '@/models/dto/project/project.dto'
import { ProjectRepository } from '@/repositories/project.repository'

export class ProjectService {
  constructor(private readonly ProjectRepository: ProjectRepository) {}

  async register(data: ProjectType): Promise<Project> {
    //TODO: Check if the project already exists
    //TODO: Create a project
    console.log('Registering project', data)
    const existingProject = await this.ProjectRepository.getById(data.name)
    if (!existingProject)
      throw new AppError('Project already exists', 409, 'PROJECT_ALREADY_EXISTS')
    return existingProject
  }
}
