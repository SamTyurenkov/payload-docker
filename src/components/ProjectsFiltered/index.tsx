"use client"

import type { Project, ProjectsTableBlock as ProjectsTableBlockProps } from '@/payload-types'
import { ProjectCard, ProjectCardPostData } from '@/components/ProjectCard'
import { ProjectModal } from '@/components/ProjectModal'
import React, { useState } from 'react'
export type Props = {
    projects: ProjectCardPostData[]
}
// Extract the status type from the Project interface
type ProjectStatus = Project['status']

export const ProjectsFiltered: React.FC<
    ProjectsTableBlockProps & {
        id?: string
        initialProjects: Project[]
    }
> = (props) => {
    const availableStatuses: ProjectStatus[] = ['planned', 'in-progress', 'completed']
    const { id, introContent, limit: limitFromProps, initialProjects } = props
    const limit = limitFromProps || 9
    const [filterStatus, setFilterStatus] = useState<string>('')
    const [fetchedProjects, setFetchedProjects] = useState<Project[]>(initialProjects)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    const handleFilterChange = (status: ProjectStatus | '') => {
        setFilterStatus(status)
        fetchProjects(status)
    }

    // Fetch projects with optional filtering by status
    const fetchProjects = async (status?: string) => {
        const queryParams = new URLSearchParams()
        if (status) queryParams.set('status', status)

        try {
            const response = await fetch(`/api/projects?${queryParams.toString()}`)
            if (!response.ok) {
                setFetchedProjects([])
            } else {
                const projects = await response.json()
                setFetchedProjects(projects.docs)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        }
    }

    const handleEditProject = (project: Project) => {
        setEditingProject(project) // Set the project to be edited
        setIsModalOpen(true) // Open the modal
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingProject(null) // Reset editing state
    }

    const onFormSuccess = () => {
        fetchProjects(filterStatus) // Refetch projects with the current filter applied
    }

    return (
        <>
            < div className="container mb-8 flex gap-2 justify-end items-center" >
                {/* Filter Section */}
                <div className='border-gray-300 border-2 max-w-fit flex gap-2 justify-end items-center px-4 py-2'>
                    <div className="block text-sm font-medium text-gray-700">
                        Filter by Status:
                    </div>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => handleFilterChange(e.target.value as ProjectStatus)}
                        className="block w-full rounded-md sm:text-sm shrink max-w-fit outline-none"
                    >
                        <option value="">All</option>
                        {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalize first letter */}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Add New Project */}
                <button
                    onClick={handleOpenModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Add New Project
                </button>
            </div >

            {/* Projects Grid */}
            < div className="container mb-16 grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8" >
                {fetchedProjects?.map((result, index) => {
                    if (typeof result === 'object' && result !== null) {
                        return (
                            <div className="col-span-4" key={index}>
                                <ProjectCard className="h-full cursor-pointer" doc={result} relationTo="projects" onClick={() => handleEditProject(result)} />
                            </div>
                        )
                    }
                    return null
                })}
            </div >

            {/* Modal */}
            {isModalOpen && (
                <ProjectModal isOpen={isModalOpen} onClose={handleCloseModal} onFormSuccess={onFormSuccess} project={editingProject} />
            )}
        </>
    )
}
