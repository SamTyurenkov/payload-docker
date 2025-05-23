import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Project, User } from '@/payload-types';

type ProjectInput = Omit<Project, "updatedAt" | "createdAt" | "id" | "sizes">

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined // Get filter status from query params
    const limit = parseInt(searchParams.get('limit') || '9', 10) // Default limit is 3

    try {
        const payload = await getPayload({ config: configPromise })

        const query: any = {
            collection: 'projects',
            depth: 1,
            limit,
        }

        if (status) {
            query.where = {
                status: {
                    equals: status,
                },
            }
        }

        const fetchedProjects = await payload.find(query)
        return Response.json(fetchedProjects.docs)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

// POST Request: Create a new project
export async function POST(request: Request) {
    try {
        const payload = await getPayload({ config: configPromise })
        // Parse the incoming JSON body
        const body = await request.json()

        const adminDocs = await payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: 'demo-author@example.com',
                },
            },
        })
        const userDocs = await payload.find({
            collection: 'users',
            where: {
                email: {
                    in: body.assigned,
                },
            },
        })

        // Validate the request body
        const projectData: ProjectInput = {
            title: body.title,
            status: body.status || 'planned',
            deadline: body.deadline || null,
            assigned: userDocs.docs || [],
            budget: Number(body.budget) || null,
            _status: 'published',
            authors: adminDocs.docs || [],
        }

        // Create the new project in the database
        const newProject = await payload.create({
            collection: 'projects',
            data: projectData,
        })

        // Validate required fields
        if (!projectData.title) {
            return Response.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Return the newly created project
        return Response.json(newProject, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return Response.json({ error: 'Failed to create project: ' + error }, { status: 500 })
    }
}

// PUT Request: Update an existing project
export async function PUT(request: Request) {
    try {
        const payload = await getPayload({ config: configPromise })
        const body = await request.json()

        if (!body.id) {
            return Response.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const adminDocs = await payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: 'demo-author@example.com',
                },
            },
        })
        const userDocs = await payload.find({
            collection: 'users',
            where: {
                email: {
                    in: body.assigned,
                },
            },
        })

        // Validate the request body
        const projectData: ProjectInput = {
            title: body.title,
            status: body.status || 'planned',
            deadline: body.deadline || null,
            assigned: userDocs.docs || [],
            budget: Number(body.budget) || null,
            _status: 'published',
            authors: adminDocs.docs || [],
        }

        // Update the project in the database
        const updatedProject = await payload.update({
            collection: 'projects',
            id: body.id,
            data: projectData,
        })

        // Return the updated project
        return Response.json(updatedProject, { status: 200 })
    } catch (error) {
        console.error('Error updating project:', error)
        return Response.json({ error: 'Failed to update project' }, { status: 500 })
    }
}