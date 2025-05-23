import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined // Get filter status from query params
    const limit = parseInt(searchParams.get('limit') || '3', 10) // Default limit is 3

    try {
        const payload = await getPayload({ config: configPromise })

        const query: any = {
            collection: 'users',
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

        const fetchedUsers = await payload.find(query)
        return Response.json(fetchedUsers.docs)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return Response.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}