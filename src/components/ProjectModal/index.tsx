"use client"

import React, { useState, useEffect } from 'react'
import { formatDateTime } from 'src/utilities/formatDateTime'
import type { Project, User, ProjectsTableBlock as ProjectsTableBlockProps } from '@/payload-types'
import { ProjectCard, ProjectCardPostData } from '@/components/ProjectCard'
import DatePicker from 'react-datepicker';

export type ProjectModalProps = {
    isOpen: boolean // Controls whether the modal is visible
    onClose: () => void // Callback to close the modal
    onFormSuccess: () => void //Callback on form success
    project?: Project | null
}
// Extract the status type from the Project interface
type ProjectStatus = Project['status']

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onFormSuccess, project }) => {

    const [assignees, setAssignees] = useState<User[]>([]) // List of available assignees
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]) // Selected assignee IDs
    const [selectedDate, setSelectedDate] = useState<Date | null>(project?.deadline ? new Date(project.deadline) : null);
    const [error, setError] = useState<string>('')
    const [success, setSuccess] = useState<string>('')
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    let errorMessage = ''

    // Fetch assignees from the database
    useEffect(() => {
        const fetchAssignees = async () => {
            try {
                const response = await fetch('/api/users_custom') // Replace with your API endpoint
                if (!response.ok) {
                    setAssignees([])
                } else {
                    const data = await response.json()
                    setAssignees(data)
                }

            } catch (error) {
                console.error('Error fetching assignees:', error)
                setAssignees([])
            }
        }

        if (isOpen) {
            fetchAssignees()
        }
    }, [isOpen])

    // Prepopulate selected assignees when editing
    useEffect(() => {
        if (project?.assigned) {
            const assignedIds =
                typeof project.assigned[0] === 'string'
                    ? (project.assigned as string[])
                    : (project.assigned as User[]).map((user) => user.id)
            setSelectedAssignees(assignedIds)
        }
    }, [project])

    function formattedDate(dateString: string | null | undefined) {
        if (dateString == null) {
            return '';
        }
        const deadlineDate = new Date(dateString);

        // Format the date for readability
        // Extract day, month, and year
        const day = String(deadlineDate.getUTCDate()).padStart(2, "0"); // Ensure two digits
        const month = String(deadlineDate.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = deadlineDate.getUTCFullYear();

        // Format as yyyy-mm-dd
        return `${year}-${month}-${day}`
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('');
        setSuccess('');
        setIsSubmitted(true);
        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const status = formData.get('status') as Project['status']
        const deadline = formData.get('deadline') as string
        const budget = parseInt(formData.get('budget') as string)

        try {
            const url = project ? `/api/projects/${project.id}` : '/api/projects'
            const method = project ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: project?.id,
                    title,
                    budget,
                    status,
                    deadline,
                    _status: 'published',
                    assigned: selectedAssignees,
                }),
            })

            if (!response.ok) {
                if (response.status === 403) {
                    errorMessage = 'Please <a href="/admin" class="font-bold underline">log in</a> to add or edit projects'
                } else {
                    errorMessage = project ? 'Failed to update project' : 'Failed to create project'
                    const errorResponse = await response.text()
                    const errorData = JSON.parse(errorResponse)
                    errorMessage = errorData?.error || errorMessage
                }
                setError(errorMessage);
                setIsSubmitted(false);
            } else {
                let successMessage = project ? 'Project updated!' : 'Project created!'
                setSuccess(successMessage);
                setIsSubmitted(false);
                if (onFormSuccess) onFormSuccess();
            }
        } catch (error: any) {
            setError(error.message);
            setIsSubmitted(false);
        }
    }
    return isOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                <button
                    className='absolute top-2 end-3'
                    onClick={onClose}>
                    X
                </button>
                <h2 className="text-xl font-bold mb-4">{project ? 'Edit Project' : 'Add New Project'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Example form fields */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            defaultValue={project?.title || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                            Budget
                        </label>
                        <input
                            type="number"
                            id="budget"
                            name="budget"
                            defaultValue={project?.budget || 0}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={project?.status || 'planned'}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="planned">Planned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                            Deadline
                        </label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            defaultValue={project ? formattedDate(project?.deadline) : ''} //formatDateTime(project.deadline)
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                            Assignees
                        </label>
                        <select
                            id="assigned"
                            name="assigned"
                            multiple
                            value={selectedAssignees}
                            onChange={(e) =>
                                setSelectedAssignees(
                                    Array.from(e.target.selectedOptions, (option) => option.value)
                                )
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            {assignees.map((assignee) => (
                                <option key={assignee.id} value={assignee.id}>
                                    {assignee.name || 'Unnamed User'}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitted}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Save
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 text-sm text-red-600" dangerouslySetInnerHTML={{ __html: error }} />
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mt-4 text-sm text-green-600">
                            {success}
                        </div>
                    )}
                </form>
            </div>
        </div>
}