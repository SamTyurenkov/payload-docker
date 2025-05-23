import React from 'react'
import RichText from '@/components/RichText'
import { ProjectsFiltered } from '@/components/ProjectsFiltered'
import type { Project, ProjectsTableBlock as ProjectsTableBlockProps } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const ProjectsTableBlock: React.FC<
    ProjectsTableBlockProps & {
        id?: string
    }
> = async (props) => {
    const { id, introContent, limit: limitFromProps } = props
    const payload = await getPayload({ config: configPromise })
    const query: any = {
        collection: 'projects',
        depth: 1,
        limit: limitFromProps || 10,
    }

    const fetchedData = await payload.find(query)
    // Assert the type of `docs` to `Project[]`
    const projects = fetchedData.docs as Project[]

    return (
        <div className="my-16" id={`block-${id}`}>
            {introContent && (
                <div className="container mb-16">
                    <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
                </div>
            )}
            <ProjectsFiltered initialProjects={projects} {...props}></ProjectsFiltered>
        </div>
    )
}
