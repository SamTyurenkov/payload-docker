'use client'
import { cn } from '@/utilities/ui'
import React from 'react'

import type { Project } from '@/payload-types'

export const ProjectCard: React.FC<{
    alignItems?: 'center'
    className?: string
    doc?: Project
    relationTo?: 'projects'
    title?: string
    onClick?: () => void
}> = (props) => {
    const { className, doc, relationTo, title: titleFromProps, onClick } = props

    const { slug, title, budget, status, deadline, assigned } = doc || {}
    const titleToUse = titleFromProps || title
    const href = `/${relationTo}/${slug}`

    function formattedDate(dateString: string) {
        if (dateString == null) {
            return null; // Fallback for null or undefined
        }
        const deadlineDate = new Date(dateString);

        // Format the date for readability
        // Extract day, month, and year
        const day = String(deadlineDate.getUTCDate()).padStart(2, "0"); // Ensure two digits
        const month = String(deadlineDate.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = deadlineDate.getUTCFullYear();

        // Format as mm/dd/yyyy
        const formattedDate = `${month}/${day}/${year}`;
        return formattedDate;
    }

    return (
        <article
            onClick={onClick}
            className={cn(
                'border border-border rounded-lg overflow-hidden bg-card',
                className,
            )}
        >
            <div className="p-4">
                {titleToUse && (
                    <div className="prose relative">
                        <h3 className="not-prose text-xl font-bold mb-2">
                            {titleToUse}
                        </h3>
                        <div className=''>
                            Budget: {budget}$
                        </div>
                        <div className="absolute text-sm text-gray-400 end-2 top-1">
                            {status}
                        </div>
                        {deadline &&
                            <div>
                                Deadline: {formattedDate(deadline)}
                            </div>}
                        {assigned && Array.isArray(assigned) ? <div className='flex gap-2'>
                            <div>Assignees: </div>
                            <div>
                                {assigned.map((item, index) => {
                                    if (typeof item === "string") {
                                        // If the item is a string, render it directly
                                        return <div key={index}>{item}</div>;
                                    } else if ("name" in item) {
                                        // If the item is a User object, render the name property
                                        return <div key={index}>{item.name}</div>;
                                    }
                                    return null; // Handle unexpected cases
                                })}
                            </div>
                        </div> : <div>No assignees</div>}
                    </div>
                )}
            </div>
        </article>
    )
}
