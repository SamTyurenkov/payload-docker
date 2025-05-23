"use client"

import type { Project, ProjectsTableBlock as ProjectsTableBlockProps } from '@/payload-types'
import { ProjectCard, ProjectCardPostData } from '@/components/ProjectCard'
import { ProjectModal } from '@/components/ProjectModal'
import React, { useState, useEffect } from 'react'
export type Props = {
    projects: ProjectCardPostData[]
}
// Extract the status type from the Project interface
type ExtendedProjectStatus = Project['status'] | ''

export const ProjectsFiltered: React.FC<
    Omit<ProjectsTableBlockProps, 'id' | 'introContent' | 'limit'> & {
        initialProjects: Project[]
    }
> = (props) => {
    const availableStatuses: ExtendedProjectStatus[] = ['planned', 'in-progress', 'completed']
    const { initialProjects } = props
    const [filterStatus, setFilterStatus] = useState<ExtendedProjectStatus>('')
    const [fetchedProjects, setFetchedProjects] = useState<Project[]>(initialProjects)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    useEffect(() => {
        console.log('ProjectsFiltered mounted on client')
        console.log('Available statuses:', availableStatuses)
    }, [])


    const handleFilterChange = (status: ExtendedProjectStatus) => {
        console.log('fetching projects');
        setFilterStatus(status)
        fetchProjects(status)
    }

    // Fetch projects with optional filtering by status
    const fetchProjects = async (status?: ExtendedProjectStatus) => {
        const queryParams = new URLSearchParams()
        if (status) queryParams.set('status', status as string)

        try {
            const response = await fetch(`/api/projects_custom?${queryParams.toString()}`)
            if (!response.ok) {
                const error = await response.json()
                console.error('Error fetching projects:', error)
                setFetchedProjects([])
            } else {
                const projects = await response.json()
                setFetchedProjects(projects)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
            setFetchedProjects([])
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
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                        Filter by Status:
                    </label>
                    <select
                        id="status-filter"
                        name="status-filter"
                        value={filterStatus}
                        onChange={(e) => {
                            console.log('Dropdown onChange triggered:', e.target.value)
                            handleFilterChange(e.target.value as ExtendedProjectStatus)
                        }
                        }
                        className="block w-full rounded-md sm:text-sm shrink max-w-fit outline-none"
                    >
                        {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
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